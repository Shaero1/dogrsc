import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FoundReport, LostReport, Prisma, ReportStatus } from '@prisma/client';
import { MediaResponseDto } from '../media/dto/media-response.dto';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import {
  ReportPublicDetailDto,
  ReportPublicListItemDto,
  PaginatedReportsPublicResponseDto,
} from './dto/report-public-response.dto';
import {
  PaginatedReportsResponseDto,
  ReportListItemDto,
  ReportResponseDto,
} from './dto/report-response.dto';
import { ReportListQueryDto } from './dto/report-list-query.dto';
import {
  ENTITY_TYPE_FOUND_REPORT,
  ENTITY_TYPE_LOST_REPORT,
} from './reports.constants';

type ReportRecord = FoundReport | LostReport;
type ReportKind = 'found' | 'lost';

const PUBLIC_VISIBLE_STATUSES: ReportStatus[] = [
  ReportStatus.ACTIVE,
  ReportStatus.VERIFIED,
];

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  createFound(dto: CreateReportDto): Promise<ReportResponseDto> {
    return this.createReport('found', dto);
  }

  createLost(dto: CreateReportDto): Promise<ReportResponseDto> {
    return this.createReport('lost', dto);
  }

  findAllFoundPublic(
    query: ReportListQueryDto,
  ): Promise<PaginatedReportsPublicResponseDto> {
    return this.findAllPublic('found', query);
  }

  findAllLostPublic(
    query: ReportListQueryDto,
  ): Promise<PaginatedReportsPublicResponseDto> {
    return this.findAllPublic('lost', query);
  }

  findFoundByIdPublic(id: string): Promise<ReportPublicDetailDto> {
    return this.findByIdPublic('found', id);
  }

  findLostByIdPublic(id: string): Promise<ReportPublicDetailDto> {
    return this.findByIdPublic('lost', id);
  }

  findAllFoundAdmin(
    query: ReportListQueryDto,
  ): Promise<PaginatedReportsResponseDto> {
    return this.findAllAdmin('found', query);
  }

  findAllLostAdmin(
    query: ReportListQueryDto,
  ): Promise<PaginatedReportsResponseDto> {
    return this.findAllAdmin('lost', query);
  }

  findFoundByIdAdmin(id: string): Promise<ReportResponseDto> {
    return this.findByIdAdmin('found', id);
  }

  findLostByIdAdmin(id: string): Promise<ReportResponseDto> {
    return this.findByIdAdmin('lost', id);
  }

  updateFoundStatus(
    id: string,
    status: ReportStatus,
  ): Promise<ReportResponseDto> {
    return this.updateStatus('found', id, status);
  }

  updateLostStatus(
    id: string,
    status: ReportStatus,
  ): Promise<ReportResponseDto> {
    return this.updateStatus('lost', id, status);
  }

  private async createReport(
    kind: ReportKind,
    dto: CreateReportDto,
  ): Promise<ReportResponseDto> {
    const data = this.mapCreateData(dto);

    const report =
      kind === 'found'
        ? await this.prisma.foundReport.create({ data })
        : await this.prisma.lostReport.create({ data });

    return this.toResponse(kind, report, []);
  }

  private async findAllPublic(
    kind: ReportKind,
    query: ReportListQueryDto,
  ): Promise<PaginatedReportsPublicResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = { status: { in: PUBLIC_VISIBLE_STATUSES } };

    if (kind === 'found') {
      const [total, items] = await Promise.all([
        this.prisma.foundReport.count({ where }),
        this.prisma.foundReport.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return this.toPublicListResponse(kind, items, total, page, limit);
    }

    const [total, items] = await Promise.all([
      this.prisma.lostReport.count({ where }),
      this.prisma.lostReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return this.toPublicListResponse(kind, items, total, page, limit);
  }

  private async findByIdPublic(
    kind: ReportKind,
    id: string,
  ): Promise<ReportPublicDetailDto> {
    const report = await this.findReportOrThrow(kind, id);

    if (!PUBLIC_VISIBLE_STATUSES.includes(report.status)) {
      throw new NotFoundException('Report not found');
    }

    const entityType =
      kind === 'found' ? ENTITY_TYPE_FOUND_REPORT : ENTITY_TYPE_LOST_REPORT;
    const media = await this.mediaService.findByEntity(entityType, id);

    return this.toPublicDetail(report, media);
  }

  private async findAllAdmin(
    kind: ReportKind,
    query: ReportListQueryDto,
  ): Promise<PaginatedReportsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const statusFilter = query.status ? { status: query.status } : {};

    if (kind === 'found') {
      const where: Prisma.FoundReportWhereInput = statusFilter;
      const [total, items] = await Promise.all([
        this.prisma.foundReport.count({ where }),
        this.prisma.foundReport.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        items: items.map((item) => this.toListItem(item)),
        total,
        page,
        limit,
      };
    }

    const where: Prisma.LostReportWhereInput = statusFilter;
    const [total, items] = await Promise.all([
      this.prisma.lostReport.count({ where }),
      this.prisma.lostReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((item) => this.toListItem(item)),
      total,
      page,
      limit,
    };
  }

  private async findByIdAdmin(
    kind: ReportKind,
    id: string,
  ): Promise<ReportResponseDto> {
    const report = await this.findReportOrThrow(kind, id);
    const entityType =
      kind === 'found' ? ENTITY_TYPE_FOUND_REPORT : ENTITY_TYPE_LOST_REPORT;
    const media = await this.mediaService.findByEntity(entityType, id);
    return this.toResponse(kind, report, media);
  }

  private async updateStatus(
    kind: ReportKind,
    id: string,
    status: ReportStatus,
  ): Promise<ReportResponseDto> {
    if (
      status !== ReportStatus.ACTIVE &&
      status !== ReportStatus.HIDDEN &&
      status !== ReportStatus.VERIFIED
    ) {
      throw new BadRequestException('Invalid report status');
    }

    await this.findReportOrThrow(kind, id);

    const report =
      kind === 'found'
        ? await this.prisma.foundReport.update({
            where: { id },
            data: { status },
          })
        : await this.prisma.lostReport.update({
            where: { id },
            data: { status },
          });

    const entityType =
      kind === 'found' ? ENTITY_TYPE_FOUND_REPORT : ENTITY_TYPE_LOST_REPORT;
    const media = await this.mediaService.findByEntity(entityType, id);

    return this.toResponse(kind, report, media);
  }

  private mapCreateData(dto: CreateReportDto): Prisma.FoundReportCreateInput {
    return {
      reporterName: dto.reporterName.trim(),
      reporterPhone: dto.reporterPhone.trim(),
      reporterEmail: dto.reporterEmail?.trim() || null,
      description: dto.description.trim(),
      latitude:
        dto.latitude !== undefined ? new Prisma.Decimal(dto.latitude) : null,
      longitude:
        dto.longitude !== undefined ? new Prisma.Decimal(dto.longitude) : null,
      status: ReportStatus.ACTIVE,
    };
  }

  private async findReportOrThrow(
    kind: ReportKind,
    id: string,
  ): Promise<ReportRecord> {
    const report =
      kind === 'found'
        ? await this.prisma.foundReport.findUnique({ where: { id } })
        : await this.prisma.lostReport.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  private async toPublicListResponse(
    kind: ReportKind,
    items: ReportRecord[],
    total: number,
    page: number,
    limit: number,
  ): Promise<PaginatedReportsPublicResponseDto> {
    const entityType =
      kind === 'found' ? ENTITY_TYPE_FOUND_REPORT : ENTITY_TYPE_LOST_REPORT;

    const thumbnails = await this.mediaService.findFirstThumbnailUrls(
      items.map((item) => ({ entityType, entityId: item.id })),
    );

    const listItems: ReportPublicListItemDto[] = items.map((report) => ({
      id: report.id,
      description: report.description,
      createdAt: report.createdAt.toISOString(),
      thumbnailUrl: thumbnails.get(`${entityType}:${report.id}`) ?? null,
      hasLocation: report.latitude != null && report.longitude != null,
      verified: report.status === ReportStatus.VERIFIED,
    }));

    return { items: listItems, total, page, limit };
  }

  private toPublicDetail(
    report: ReportRecord,
    media: MediaResponseDto[],
  ): ReportPublicDetailDto {
    return {
      id: report.id,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      reporterEmail: report.reporterEmail,
      description: report.description,
      latitude: report.latitude?.toString() ?? null,
      longitude: report.longitude?.toString() ?? null,
      createdAt: report.createdAt.toISOString(),
      verified: report.status === ReportStatus.VERIFIED,
      media: media.map((item) => ({
        id: item.id,
        url: item.url,
        mimeType: item.mimeType,
      })),
    };
  }

  private toListItem(report: ReportRecord): ReportListItemDto {
    return {
      id: report.id,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      description: report.description,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      hasLocation: report.latitude != null && report.longitude != null,
      verified: report.status === ReportStatus.VERIFIED,
    };
  }

  private toResponse(
    kind: ReportKind,
    report: ReportRecord,
    media: MediaResponseDto[],
  ): ReportResponseDto {
    return {
      id: report.id,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      reporterEmail: report.reporterEmail,
      description: report.description,
      latitude: report.latitude?.toString() ?? null,
      longitude: report.longitude?.toString() ?? null,
      status: report.status,
      media,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  }
}
