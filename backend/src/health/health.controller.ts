import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Service health check' })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiServiceUnavailableResponse({ type: HealthResponseDto })
  async getHealth(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponseDto> {
    const timestamp = new Date().toISOString();
    const version = process.env.APP_VERSION ?? '0.0.1';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'ok',
        timestamp,
        version,
      };
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'degraded',
        database: 'error',
        timestamp,
        version,
      };
    }
  }
}
