import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CONTENT_ENTITY_TYPE,
  CONTENT_FALLBACK_LOCALE,
  CONTENT_LOCALES,
  CONTENT_PAGES,
  ContentLocale,
  findContentPage,
} from './content-pages.manifest';
import { ContentItemDto } from './dto/content-item.dto';
import {
  ContentPageSummaryDto,
  PageContentAdminDto,
} from './dto/page-content-admin.dto';
import { PageContentPublicDto } from './dto/page-content-public.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  listPages(): ContentPageSummaryDto[] {
    return CONTENT_PAGES.filter((page) => page.adminSection !== 'donations').map(
      (page) => ({
        id: page.id,
        label: page.label,
        fields: [...page.fields],
      }),
    );
  }

  async getPublicPage(
    entityId: string,
    locale: string,
  ): Promise<PageContentPublicDto> {
    const page = this.requirePage(entityId);
    const resolvedLocale = this.resolveLocale(locale);
    const rows = await this.prisma.contentTranslation.findMany({
      where: {
        entityType: CONTENT_ENTITY_TYPE,
        entityId,
        locale: { in: [resolvedLocale, CONTENT_FALLBACK_LOCALE] },
        field: { in: [...page.fields] },
      },
    });

    const byLocaleField = new Map<string, string>();
    for (const row of rows) {
      byLocaleField.set(`${row.locale}:${row.field}`, row.value);
    }

    const fields: Record<string, string> = {};
    for (const field of page.fields) {
      const value =
        byLocaleField.get(`${resolvedLocale}:${field}`) ??
        byLocaleField.get(`${CONTENT_FALLBACK_LOCALE}:${field}`);
      if (value !== undefined) {
        fields[field] = value;
      }
    }

    return {
      entityId,
      locale: resolvedLocale,
      fields,
    };
  }

  async getAdminPage(entityId: string): Promise<PageContentAdminDto> {
    const page = this.requirePage(entityId);
    const rows = await this.prisma.contentTranslation.findMany({
      where: {
        entityType: CONTENT_ENTITY_TYPE,
        entityId,
        field: { in: [...page.fields] },
      },
      orderBy: [{ locale: 'asc' }, { field: 'asc' }],
    });

    return {
      entityId,
      items: rows.map((row) => ({
        locale: row.locale,
        field: row.field,
        value: row.value,
      })),
    };
  }

  async upsertPage(
    entityId: string,
    items: ContentItemDto[],
  ): Promise<PageContentAdminDto> {
    const page = this.requirePage(entityId);
    const allowedFields = new Set(page.fields);

    for (const item of items) {
      if (!allowedFields.has(item.field)) {
        throw new BadRequestException(`Unknown field "${item.field}" for page "${entityId}"`);
      }
      this.resolveLocale(item.locale);
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.contentTranslation.upsert({
          where: {
            entityType_entityId_locale_field: {
              entityType: CONTENT_ENTITY_TYPE,
              entityId,
              locale: item.locale,
              field: item.field,
            },
          },
          create: {
            entityType: CONTENT_ENTITY_TYPE,
            entityId,
            locale: item.locale,
            field: item.field,
            value: item.value,
          },
          update: {
            value: item.value,
          },
        }),
      ),
    );

    return this.getAdminPage(entityId);
  }

  private requirePage(entityId: string) {
    const page = findContentPage(entityId);
    if (!page) {
      throw new NotFoundException(`Content page "${entityId}" not found`);
    }
    return page;
  }

  private resolveLocale(locale: string): ContentLocale {
    if (!CONTENT_LOCALES.includes(locale as ContentLocale)) {
      throw new BadRequestException(
        `Unsupported locale "${locale}". Expected one of: ${CONTENT_LOCALES.join(', ')}`,
      );
    }
    return locale as ContentLocale;
  }
}
