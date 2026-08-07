import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdateUserAdminDto {
  @ApiPropertyOptional({ enum: [UserRole.ADMIN, UserRole.STAFF] })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ minLength: 8 })
  @ValidateIf((dto: UpdateUserAdminDto) => dto.password !== undefined)
  @IsString()
  @MinLength(8)
  password?: string;
}
