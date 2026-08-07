import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import {
  PaginatedUsersAdminResponseDto,
  UserAdminResponseDto,
} from './dto/user-admin-response.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { SYSTEM_USER_EMAIL } from './users.constants';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAdmin(
    query: UserListQueryDto,
  ): Promise<PaginatedUsersAdminResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    if (
      query.role &&
      query.role !== UserRole.ADMIN &&
      query.role !== UserRole.STAFF
    ) {
      throw new BadRequestException('Role filter must be ADMIN or STAFF');
    }

    const where = this.manageableUsersWhere(query.role);

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async createAdmin(dto: CreateUserAdminDto): Promise<UserAdminResponseDto> {
    if (dto.role !== UserRole.ADMIN && dto.role !== UserRole.STAFF) {
      throw new BadRequestException('Role must be ADMIN or STAFF');
    }

    const email = dto.email.trim().toLowerCase();

    if (email === SYSTEM_USER_EMAIL) {
      throw new BadRequestException('System user cannot be created via admin');
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: dto.role,
      },
    });

    return this.toResponse(user);
  }

  async updateAdmin(
    id: string,
    dto: UpdateUserAdminDto,
  ): Promise<UserAdminResponseDto> {
    if (dto.role === undefined && dto.password === undefined) {
      throw new BadRequestException('Provide role and/or password to update');
    }

    if (
      dto.role &&
      dto.role !== UserRole.ADMIN &&
      dto.role !== UserRole.STAFF
    ) {
      throw new BadRequestException('Role must be ADMIN or STAFF');
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    this.assertManageableUser(existing);

    if (dto.role && dto.role !== existing.role) {
      await this.assertCanChangeRole(existing, dto.role);
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.role) {
      data.role = dto.role;
    }

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.toResponse(updated);
  }

  private manageableUsersWhere(role?: UserRole): Prisma.UserWhereInput {
    return {
      email: { not: SYSTEM_USER_EMAIL },
      role: role ?? { in: [UserRole.ADMIN, UserRole.STAFF] },
    };
  }

  private assertManageableUser(user: User): void {
    if (user.email === SYSTEM_USER_EMAIL) {
      throw new BadRequestException('System user cannot be modified');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.STAFF) {
      throw new BadRequestException('Only admin panel users can be managed');
    }
  }

  private async assertCanChangeRole(
    user: User,
    newRole: UserRole,
  ): Promise<void> {
    if (user.role !== UserRole.ADMIN || newRole === UserRole.ADMIN) {
      return;
    }

    const adminCount = await this.prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        email: { not: SYSTEM_USER_EMAIL },
      },
    });

    if (adminCount <= 1) {
      throw new BadRequestException('Cannot demote the last admin');
    }
  }

  private toResponse(user: User): UserAdminResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
