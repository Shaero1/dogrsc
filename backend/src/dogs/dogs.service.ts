import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Dog, DogStatus, Prisma } from '@prisma/client';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  DogDescriptions,
  DogSeoFields,
  SupportedLocale,
  getLocalizedDogContent,
  parseAcceptLanguage,
} from './dog-descriptions.types';
import {
  CreateDogDto,
  UpdateDogDto,
} from './dto/create-dog.dto';
import {
  DogAdminResponseDto,
  DogListItemDto,
  PaginatedDogsAdminResponseDto,
} from './dto/dog-admin-response.dto';
import { DogListQueryDto } from './dto/dog-list-query.dto';
import {
  DogPublicResponseDto,
  PaginatedDogsPublicResponseDto,
} from './dto/dog-public-response.dto';
import { slugify } from './slug.util';

const PUBLIC_STATUSES: DogStatus[] = [DogStatus.AVAILABLE, DogStatus.IN_CARE];
const DOG_ENTITY_TYPE = 'dog';

@Injectable()
export class DogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(dto: CreateDogDto): Promise<DogAdminResponseDto> {
    const descriptions = this.normalizeDescriptions(
      dto.descriptions as DogDescriptions,
    );
    this.assertEnglishRequired(descriptions);

    let slug: string;
    if (dto.slug?.trim()) {
      slug = slugify(dto.slug.trim());
      const taken = await this.prisma.dog.findUnique({ where: { slug } });
      if (taken) {
        throw new ConflictException('Slug already exists');
      }
    } else {
      slug = await this.ensureUniqueSlug(slugify(descriptions.en!.name!));
    }

    if (dto.status === DogStatus.ARCHIVED) {
      throw new BadRequestException('Cannot create dog with ARCHIVED status');
    }

    const dog = await this.prisma.dog.create({
      data: {
        slug,
        status: dto.status ?? DogStatus.IN_CARE,
        isPublished: dto.isPublished ?? false,
        descriptions: descriptions as unknown as Prisma.InputJsonValue,
        seo: (dto.seo ?? {}) as Prisma.InputJsonValue,
      },
    });

    return this.toAdminResponse(dog);
  }

  async update(id: string, dto: UpdateDogDto): Promise<DogAdminResponseDto> {
    const existing = await this.findDogOrThrow(id);

    if (dto.descriptions) {
      const merged = this.mergeDescriptions(
        existing.descriptions as DogDescriptions,
        dto.descriptions as DogDescriptions,
      );
      this.assertEnglishRequired(merged);
      dto.descriptions = merged as UpdateDogDto['descriptions'];
    }

    if (dto.status === DogStatus.ARCHIVED) {
      throw new BadRequestException(
        'Use POST /admin/dogs/:id/archive to archive a dog',
      );
    }

    let slug = dto.slug?.trim();
    if (slug && slug !== existing.slug) {
      slug = slugify(slug);
      const taken = await this.prisma.dog.findUnique({ where: { slug } });
      if (taken && taken.id !== existing.id) {
        throw new ConflictException('Slug already exists');
      }
    }

    const dog = await this.prisma.dog.update({
      where: { id },
      data: {
        ...(dto.descriptions
          ? {
              descriptions: dto.descriptions as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.seo !== undefined
          ? { seo: dto.seo as Prisma.InputJsonValue }
          : {}),
        ...(slug ? { slug } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
      },
    });

    return this.toAdminResponse(dog);
  }

  async findAllAdmin(
    query: DogListQueryDto,
  ): Promise<PaginatedDogsAdminResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DogWhereInput = {
      ...(query.status
        ? { status: query.status }
        : query.excludeArchived
          ? { status: { not: DogStatus.ARCHIVED } }
          : {}),
      ...(query.isPublished !== undefined
        ? { isPublished: query.isPublished }
        : {}),
      ...(query.search?.trim()
        ? {
            slug: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [total, dogs] = await Promise.all([
      this.prisma.dog.count({ where }),
      this.prisma.dog.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: dogs.map((dog) => this.toListItem(dog)),
      total,
      page,
      limit,
    };
  }

  async findByIdAdmin(id: string): Promise<DogAdminResponseDto> {
    const dog = await this.findDogOrThrow(id);
    return this.toAdminResponse(dog);
  }

  async archive(id: string): Promise<DogAdminResponseDto> {
    const dog = await this.prisma.dog.update({
      where: { id },
      data: { status: DogStatus.ARCHIVED, isPublished: false },
    });

    return this.toAdminResponse(dog);
  }

  async findAllPublic(
    query: DogListQueryDto,
    acceptLanguage?: string,
  ): Promise<PaginatedDogsPublicResponseDto> {
    const locale = parseAcceptLanguage(acceptLanguage);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.publicDogsWhere();

    const [total, dogs] = await Promise.all([
      this.prisma.dog.count({ where }),
      this.prisma.dog.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items = await Promise.all(
      dogs.map((dog) => this.toPublicResponse(dog, locale)),
    );

    return { items, total, page, limit };
  }

  async findBySlugPublic(
    slug: string,
    acceptLanguage?: string,
  ): Promise<DogPublicResponseDto> {
    const locale = parseAcceptLanguage(acceptLanguage);

    const dog = await this.prisma.dog.findFirst({
      where: {
        slug,
        isPublished: true,
        status: { in: PUBLIC_STATUSES },
      },
    });

    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    return this.toPublicResponse(dog, locale);
  }

  /** All dogs ever in the rescue program (excludes ARCHIVED). */
  async countRescued(): Promise<number> {
    return this.prisma.dog.count({ where: this.rescuedDogsWhere() });
  }

  /** Same count as GET /dogs list `total` (Our Dogs page). */
  async countPublic(): Promise<number> {
    return this.prisma.dog.count({ where: this.publicDogsWhere() });
  }

  private rescuedDogsWhere(): Prisma.DogWhereInput {
    return {
      status: { in: [DogStatus.AVAILABLE, DogStatus.IN_CARE, DogStatus.ADOPTED] },
    };
  }

  private publicDogsWhere(): Prisma.DogWhereInput {
    return {
      isPublished: true,
      status: { in: PUBLIC_STATUSES },
    };
  }

  private async toAdminResponse(dog: Dog): Promise<DogAdminResponseDto> {
    const media = await this.mediaService.findByEntity(DOG_ENTITY_TYPE, dog.id);

    return {
      id: dog.id,
      slug: dog.slug,
      status: dog.status,
      isPublished: dog.isPublished,
      descriptions: dog.descriptions as Record<string, unknown>,
      seo: dog.seo as Record<string, unknown>,
      media,
      createdAt: dog.createdAt.toISOString(),
      updatedAt: dog.updatedAt.toISOString(),
    };
  }

  private toListItem(dog: Dog): DogListItemDto {
    const descriptions = dog.descriptions as DogDescriptions;

    return {
      id: dog.id,
      slug: dog.slug,
      status: dog.status,
      isPublished: dog.isPublished,
      nameEn: descriptions.en?.name,
      updatedAt: dog.updatedAt.toISOString(),
    };
  }

  private async toPublicResponse(
    dog: Dog,
    locale: SupportedLocale,
  ): Promise<DogPublicResponseDto> {
    const descriptions = dog.descriptions as DogDescriptions;
    const seo = dog.seo as DogSeoFields;
    const localized = getLocalizedDogContent(descriptions, seo, locale);
    const media = await this.mediaService.findByEntity(DOG_ENTITY_TYPE, dog.id);

    return {
      slug: dog.slug,
      status: dog.status,
      name: localized.name,
      description: localized.description,
      rescueStory: localized.rescueStory || undefined,
      seoTitle: localized.seoTitle || undefined,
      seoDescription: localized.seoDescription || undefined,
      media: media.map((item) => ({
        id: item.id,
        url: item.url,
        mimeType: item.mimeType,
      })),
      locale,
    };
  }

  private assertEnglishRequired(descriptions: DogDescriptions): void {
    if (!descriptions.en?.name?.trim()) {
      throw new BadRequestException('descriptions.en.name is required');
    }
    if (!descriptions.en?.description?.trim()) {
      throw new BadRequestException('descriptions.en.description is required');
    }
  }

  private localeBlockHasContent(
    block: NonNullable<DogDescriptions['th']>,
  ): boolean {
    return Boolean(
      block.name?.trim() ||
        block.description?.trim() ||
        block.rescueStory?.trim(),
    );
  }

  private normalizeDescriptions(descriptions: DogDescriptions): DogDescriptions {
    const result: DogDescriptions = {
      en: descriptions.en,
    };

    for (const locale of ['th', 'ru'] as const) {
      const block = descriptions[locale];
      if (block && this.localeBlockHasContent(block)) {
        result[locale] = block;
      }
    }

    return result;
  }

  private mergeDescriptions(
    existing: DogDescriptions,
    incoming: DogDescriptions,
  ): DogDescriptions {
    const merged: DogDescriptions = {
      en: {
        ...existing.en,
        ...incoming.en,
      },
    };

    for (const locale of ['th', 'ru'] as const) {
      if (locale in incoming) {
        const block = incoming[locale];
        if (block && this.localeBlockHasContent(block)) {
          merged[locale] = block;
        }
      } else if (existing[locale]) {
        merged[locale] = existing[locale];
      }
    }

    return merged;
  }

  private async findDogOrThrow(id: string): Promise<Dog> {
    const dog = await this.prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    return dog;
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = slugify(baseSlug);
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.dog.findUnique({ where: { slug } });

      if (!existing || existing.id === excludeId) {
        return slug;
      }

      slug = `${slugify(baseSlug)}-${suffix++}`;
    }
  }

  async assertDogExists(id: string): Promise<void> {
    await this.findDogOrThrow(id);
  }
}
