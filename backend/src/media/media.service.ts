import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MediaResponseDto } from './dto/media-response.dto';
import {
  DEFAULT_MEDIA_MAX_BYTES,
  DEFAULT_REPORT_MEDIA_UPLOAD_WINDOW_MINUTES,
  isAllowedMediaMimeType,
} from './media.constants';
import { canDeleteMedia } from './media.permissions';
import { S3Service } from './s3.service';

export type UploadFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

export type AuthenticatedMediaUser = {
  id: string;
  role: UserRole;
};

@Injectable()
export class MediaService {
  private readonly maxBytes: number;
  private readonly config: ConfigService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    config: ConfigService,
  ) {
    this.config = config;
    this.maxBytes = config.get<number>(
      'MEDIA_MAX_BYTES',
      DEFAULT_MEDIA_MAX_BYTES,
    );
  }

  getMaxBytes(): number {
    return this.maxBytes;
  }

  async createForPublicReport(
    file: UploadFile,
    entityType: 'found_report' | 'lost_report',
    entityId: string,
    systemUserId: string,
  ): Promise<MediaResponseDto> {
    await this.validatePublicReportMediaUpload(entityType, entityId);
    return this.create(file, systemUserId, entityType, entityId);
  }

  async create(
    file: UploadFile,
    userId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<MediaResponseDto> {
    this.validateUpload(file);
    await this.validateEntityLink(entityType, entityId);

    const mediaId = randomUUID();
    const safeName = this.sanitizeFilename(file.originalname);
    const s3Key = `media/${mediaId}/${safeName}`;

    await this.s3.putObject(s3Key, file.buffer, file.mimetype);

    const media = await this.prisma.media.create({
      data: {
        id: mediaId,
        s3Key,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedById: userId,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
      },
    });

    const url = await this.s3.getPresignedGetUrl(media.s3Key);

    return this.toResponse(media, url);
  }

  async findById(id: string): Promise<MediaResponseDto> {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const url = await this.s3.getPresignedGetUrl(media.s3Key);
    return this.toResponse(media, url);
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<MediaResponseDto[]> {
    const items = await this.prisma.media.findMany({
      where: { entityType, entityId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return Promise.all(
      items.map(async (media) =>
        this.toResponse(media, await this.s3.getPresignedGetUrl(media.s3Key)),
      ),
    );
  }

  async findFirstThumbnailUrls(
    entities: Array<{ entityType: string; entityId: string }>,
  ): Promise<Map<string, string>> {
    if (entities.length === 0) {
      return new Map();
    }

    const byType = new Map<string, string[]>();
    for (const entity of entities) {
      const ids = byType.get(entity.entityType) ?? [];
      ids.push(entity.entityId);
      byType.set(entity.entityType, ids);
    }

    const orConditions = [...byType.entries()].map(([entityType, entityIds]) => ({
      entityType,
      entityId: { in: entityIds },
    }));

    const mediaList = await this.prisma.media.findMany({
      where: { deletedAt: null, OR: orConditions },
      orderBy: { createdAt: 'asc' },
    });

    const result = new Map<string, string>();

    for (const media of mediaList) {
      if (!media.entityType || !media.entityId) {
        continue;
      }

      const key = `${media.entityType}:${media.entityId}`;
      if (result.has(key)) {
        continue;
      }

      const url = await this.s3.getPresignedGetUrl(media.s3Key);
      result.set(key, url);
    }

    return result;
  }

  async softDelete(id: string, user: AuthenticatedMediaUser): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (
      !canDeleteMedia(user, {
        uploadedById: media.uploadedById,
        entityType: media.entityType,
        entityId: media.entityId,
      })
    ) {
      throw new ForbiddenException('Not allowed to delete this media');
    }

    await this.prisma.media.update({
      where: { id: media.id },
      data: { deletedAt: new Date() },
    });
  }

  private validateUpload(file: UploadFile): void {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    if (file.size > this.maxBytes) {
      throw new PayloadTooLargeException(
        `File exceeds maximum size of ${this.maxBytes} bytes`,
      );
    }

    if (!isAllowedMediaMimeType(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: image/jpeg, image/png, image/webp',
      );
    }
  }

  private sanitizeFilename(name: string): string {
    const base = name.split(/[/\\]/).pop() ?? 'upload';
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    return cleaned || 'upload';
  }

  private async validateEntityLink(
    entityType?: string,
    entityId?: string,
  ): Promise<void> {
    if (!entityType && !entityId) {
      return;
    }

    if (!entityType || !entityId) {
      throw new BadRequestException(
        'entityType and entityId must be provided together',
      );
    }

    if (entityType === 'dog') {
      const dog = await this.prisma.dog.findUnique({ where: { id: entityId } });

      if (!dog) {
        throw new NotFoundException('Dog not found');
      }

      return;
    }

    if (entityType === 'found_report') {
      const report = await this.prisma.foundReport.findUnique({
        where: { id: entityId },
      });

      if (!report) {
        throw new NotFoundException('Found report not found');
      }

      return;
    }

    if (entityType === 'lost_report') {
      const report = await this.prisma.lostReport.findUnique({
        where: { id: entityId },
      });

      if (!report) {
        throw new NotFoundException('Lost report not found');
      }

      return;
    }

    if (entityType === 'story') {
      const story = await this.prisma.story.findUnique({
        where: { id: entityId },
      });

      if (!story) {
        throw new NotFoundException('Story not found');
      }

      return;
    }

    throw new BadRequestException(`Unsupported entityType: ${entityType}`);
  }

  private async validatePublicReportMediaUpload(
    entityType: 'found_report' | 'lost_report',
    entityId: string,
  ): Promise<void> {
    const windowMinutes = this.config.get<number>(
      'REPORT_MEDIA_UPLOAD_WINDOW_MINUTES',
      DEFAULT_REPORT_MEDIA_UPLOAD_WINDOW_MINUTES,
    );
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const report =
      entityType === 'found_report'
        ? await this.prisma.foundReport.findUnique({ where: { id: entityId } })
        : await this.prisma.lostReport.findUnique({ where: { id: entityId } });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.createdAt < since) {
      throw new BadRequestException('Media upload window has expired');
    }
  }

  private toResponse(
    media: {
      id: string;
      mimeType: string;
      sizeBytes: number;
      createdAt: Date;
    },
    url: string,
  ): MediaResponseDto {
    return {
      id: media.id,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      url,
      createdAt: media.createdAt.toISOString(),
    };
  }
}
