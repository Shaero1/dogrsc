import { Injectable } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import {
  ENTITY_TYPE_FOUND_REPORT,
  ENTITY_TYPE_LOST_REPORT,
} from '../reports/reports.constants';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../prisma/prisma.service';
import { MapMarkerDto } from './dto/map-marker.dto';
import { MapMarkersQueryDto } from './dto/map-markers-query.dto';

type MapMarkerType = MapMarkerDto['type'];

const COORDINATES_FILTER = {
  latitude: { not: null },
  longitude: { not: null },
} as const;

const PUBLIC_VISIBLE_STATUSES: ReportStatus[] = [
  ReportStatus.ACTIVE,
  ReportStatus.VERIFIED,
];

@Injectable()
export class MapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async findMarkers(query: MapMarkersQueryDto): Promise<{ items: MapMarkerDto[] }> {
    const type = query.type ?? 'all';
    const items: MapMarkerDto[] = [];

    if (type === 'all' || type === 'found') {
      const found = await this.prisma.foundReport.findMany({
        where: {
          status: { in: PUBLIC_VISIBLE_STATUSES },
          ...COORDINATES_FILTER,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          description: true,
          latitude: true,
          longitude: true,
          createdAt: true,
        },
      });

      items.push(
        ...found.map((report) => this.toMarker('found', report)),
      );
    }

    if (type === 'all' || type === 'lost') {
      const lost = await this.prisma.lostReport.findMany({
        where: {
          status: { in: PUBLIC_VISIBLE_STATUSES },
          ...COORDINATES_FILTER,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          description: true,
          latitude: true,
          longitude: true,
          createdAt: true,
        },
      });

      items.push(...lost.map((report) => this.toMarker('lost', report)));
    }

    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const thumbnails = await this.mediaService.findFirstThumbnailUrls(
      items.map((item) => ({
        entityType:
          item.type === 'found'
            ? ENTITY_TYPE_FOUND_REPORT
            : ENTITY_TYPE_LOST_REPORT,
        entityId: item.id,
      })),
    );

    for (const item of items) {
      const entityType =
        item.type === 'found'
          ? ENTITY_TYPE_FOUND_REPORT
          : ENTITY_TYPE_LOST_REPORT;
      item.thumbnailUrl = thumbnails.get(`${entityType}:${item.id}`) ?? null;
    }

    return { items };
  }

  private toMarker(
    type: MapMarkerType,
    report: {
      id: string;
      description: string;
      latitude: { toString(): string } | null;
      longitude: { toString(): string } | null;
      createdAt: Date;
    },
  ): MapMarkerDto {
    return {
      id: report.id,
      type,
      description: report.description,
      latitude: report.latitude!.toString(),
      longitude: report.longitude!.toString(),
      createdAt: report.createdAt.toISOString(),
      thumbnailUrl: null,
    };
  }
}
