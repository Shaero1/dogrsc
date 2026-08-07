import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { CaptchaService } from '../captcha/captcha.service';
import { DEFAULT_MEDIA_MAX_BYTES } from '../media/media.constants';
import { MediaResponseDto } from '../media/dto/media-response.dto';
import { MediaService } from '../media/media.service';
import { CreateReportDto } from './dto/create-report.dto';
import {
  PaginatedReportsPublicResponseDto,
  ReportPublicDetailDto,
} from './dto/report-public-response.dto';
import {
  PaginatedReportsResponseDto,
  ReportResponseDto,
} from './dto/report-response.dto';
import { ReportListQueryDto } from './dto/report-list-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ENTITY_TYPE_LOST_REPORT } from './reports.constants';
import { ReportsService } from './reports.service';
import { SystemUserService } from './system-user.service';

@ApiTags('lost-reports')
@Controller('lost-reports')
export class LostReportsPublicController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly mediaService: MediaService,
    private readonly systemUserService: SystemUserService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public lost dog reports' })
  @ApiOkResponse({ type: PaginatedReportsPublicResponseDto })
  findAll(
    @Query() query: ReportListQueryDto,
  ): Promise<PaginatedReportsPublicResponseDto> {
    return this.reportsService.findAllLostPublic(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public lost dog report by id' })
  @ApiOkResponse({ type: ReportPublicDetailDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ReportPublicDetailDto> {
    return this.reportsService.findLostByIdPublic(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a lost dog report' })
  @ApiCreatedResponse({ type: ReportResponseDto })
  async create(@Body() dto: CreateReportDto): Promise<ReportResponseDto> {
    await this.captchaService.verify(dto.captchaToken);
    return this.reportsService.createLost(dto);
  }

  @Public()
  @Post(':id/media')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: DEFAULT_MEDIA_MAX_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({ type: MediaResponseDto })
  async uploadMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const systemUserId = await this.systemUserService.getSystemUserId();

    return this.mediaService.createForPublicReport(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      },
      ENTITY_TYPE_LOST_REPORT,
      id,
      systemUserId,
    );
  }
}

@ApiTags('admin-lost-reports')
@Controller('admin/lost-reports')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class LostReportsAdminController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'List lost reports' })
  @ApiOkResponse({ type: PaginatedReportsResponseDto })
  findAll(
    @Query() query: ReportListQueryDto,
  ): Promise<PaginatedReportsResponseDto> {
    return this.reportsService.findAllLostAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lost report by id' })
  @ApiOkResponse({ type: ReportResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ReportResponseDto> {
    return this.reportsService.findLostByIdAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lost report status (hide, verify, restore)' })
  @ApiOkResponse({ type: ReportResponseDto })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
  ): Promise<ReportResponseDto> {
    return this.reportsService.updateLostStatus(id, dto.status);
  }
}
