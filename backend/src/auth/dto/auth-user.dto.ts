import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@dogerescue.org' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;
}
