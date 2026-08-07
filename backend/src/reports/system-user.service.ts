import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SYSTEM_USER_EMAIL } from './reports.constants';

@Injectable()
export class SystemUserService {
  private systemUserId: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getSystemUserId(): Promise<string> {
    if (this.systemUserId) {
      return this.systemUserId;
    }

    const email =
      this.config.get<string>('SYSTEM_USER_EMAIL') ?? SYSTEM_USER_EMAIL;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error(
        `System user ${email} not found — run npm run db:seed`,
      );
    }

    this.systemUserId = user.id;
    return user.id;
  }
}
