import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';

type AuthenticatedRequest = Request & {
  user: { id: string; email: string; role: UserRole };
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiForbiddenResponse({ description: 'USER role cannot access admin' })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse()
  me(@Req() req: AuthenticatedRequest): Promise<AuthUserDto> {
    return this.authService.getMe(req.user.id);
  }
}
