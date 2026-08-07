import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserAdminDto {
  @ApiProperty({ example: 'staff@dogerescue.org' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: [UserRole.ADMIN, UserRole.STAFF] })
  @IsEnum(UserRole)
  role!: UserRole;
}
