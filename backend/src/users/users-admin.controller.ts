import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import {
  PaginatedUsersAdminResponseDto,
  UserAdminResponseDto,
} from './dto/user-admin-response.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { UsersService } from './users.service';

@ApiTags('admin-users')
@Controller('admin/users')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List admin panel users (ADMIN/STAFF)' })
  @ApiOkResponse({ type: PaginatedUsersAdminResponseDto })
  findAll(
    @Query() query: UserListQueryDto,
  ): Promise<PaginatedUsersAdminResponseDto> {
    return this.usersService.findAllAdmin(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create admin panel user' })
  @ApiCreatedResponse({ type: UserAdminResponseDto })
  create(@Body() dto: CreateUserAdminDto): Promise<UserAdminResponseDto> {
    return this.usersService.createAdmin(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role and/or password' })
  @ApiOkResponse({ type: UserAdminResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserAdminDto,
  ): Promise<UserAdminResponseDto> {
    return this.usersService.updateAdmin(id, dto);
  }
}
