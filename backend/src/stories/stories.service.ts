import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Dog, Prisma, Story } from '@prisma/client';
import { slugify } from '../dogs/slug.util';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto, StoryListQueryDto, UpdateStoryDto } from './dto/story.dto';
import {
  PaginatedStoriesAdminResponseDto,
  PaginatedStoriesPublicResponseDto,
  StoryAdminResponseDto,
  StoryPublicDetailDto,
  StoryPublicListItemDto,
} from './dto/story-response.dto';
import {
  StoryContent,
  buildExcerpt,
  getLocalizedStoryContent,
  parseAcceptLanguage,
  validateEnglishStoryRequired,
} from './story-content.types';

const STORY_ENTITY_TYPE = 'story';

type StoryWithDog = Story & { dog: Dog | null };

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(dto: CreateStoryDto): Promise<StoryAdminResponseDto> {
    const content = this.normalizeContent(dto.content);
    this.assertEnglishRequired(content);

    const slug = await this.resolveSlug(dto.slug, content.en!.title!);
    const isPublished = dto.isPublished ?? false;
    const publishedAt = isPublished ? new Date() : null;

    await this.validateDogLink(dto.dogId ?? null);

    const story = await this.prisma.story.create({
      data: {
        slug,
        content: content as unknown as Prisma.InputJsonValue,
        isPublished,
        publishedAt,
        dogId: dto.dogId ?? null,
      },
      include: { dog: true },
    });

    return this.toAdminResponse(story);
  }

  async update(id: string, dto: UpdateStoryDto): Promise<StoryAdminResponseDto> {
    const existing = await this.findStoryOrThrow(id);

    let content = existing.content as StoryContent;
    if (dto.content) {
      content = this.normalizeContent(dto.content);
      this.assertEnglishRequired(content);
    }

    let slug = existing.slug;
    if (dto.slug?.trim()) {
      slug = slugify(dto.slug.trim());
      if (slug !== existing.slug) {
        await this.assertSlugAvailable(slug);
      }
    }

    if (dto.dogId !== undefined) {
      await this.validateDogLink(dto.dogId);
    }

    const nextPublished =
      dto.isPublished !== undefined ? dto.isPublished : existing.isPublished;

    let publishedAt = existing.publishedAt;
    if (dto.isPublished === true && !existing.isPublished) {
      publishedAt = new Date();
    }
    if (dto.isPublished === false) {
      publishedAt = null;
    }

    const story = await this.prisma.story.update({
      where: { id },
      data: {
        ...(dto.content
          ? { content: content as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.slug !== undefined ? { slug } : {}),
        ...(dto.isPublished !== undefined ? { isPublished: nextPublished } : {}),
        publishedAt,
        ...(dto.dogId !== undefined ? { dogId: dto.dogId } : {}),
      },
      include: { dog: true },
    });

    return this.toAdminResponse(story);
  }

  async delete(id: string): Promise<void> {
    await this.findStoryOrThrow(id);
    await this.prisma.story.delete({ where: { id } });
  }

  async findByIdAdmin(id: string): Promise<StoryAdminResponseDto> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: { dog: true },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    return this.toAdminResponse(story);
  }

  async findAllAdmin(
    query: StoryListQueryDto,
  ): Promise<PaginatedStoriesAdminResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StoryWhereInput = {
      ...(query.isPublished !== undefined
        ? { isPublished: query.isPublished }
        : {}),
    };

    const [total, stories] = await Promise.all([
      this.prisma.story.count({ where }),
      this.prisma.story.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      items: stories.map((story) => {
        const content = story.content as StoryContent;
        const title = content.en?.title?.trim() || story.slug;
        return {
          id: story.id,
          slug: story.slug,
          title,
          isPublished: story.isPublished,
          publishedAt: story.publishedAt?.toISOString() ?? null,
          updatedAt: story.updatedAt.toISOString(),
        };
      }),
      total,
      page,
      limit,
    };
  }

  async findAllPublic(
    query: StoryListQueryDto,
    acceptLanguage?: string,
  ): Promise<PaginatedStoriesPublicResponseDto> {
    const locale = parseAcceptLanguage(acceptLanguage);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StoryWhereInput = { isPublished: true };

    const [total, stories] = await Promise.all([
      this.prisma.story.count({ where }),
      this.prisma.story.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        include: { dog: true },
      }),
    ]);

    const thumbnails = await this.mediaService.findFirstThumbnailUrls(
      stories.map((story) => ({
        entityType: STORY_ENTITY_TYPE,
        entityId: story.id,
      })),
    );

    const items = await Promise.all(
      stories.map(async (story) => {
        const coverUrl =
          thumbnails.get(`${STORY_ENTITY_TYPE}:${story.id}`) ?? null;
        const media = coverUrl
          ? [{ id: story.id, url: coverUrl, mimeType: 'image/jpeg' }]
          : [];
        return this.toPublicListItem(story, locale, media[0] ?? null);
      }),
    );

    return { items, total, page, limit };
  }

  async findBySlugPublic(
    slug: string,
    acceptLanguage?: string,
  ): Promise<StoryPublicDetailDto> {
    const locale = parseAcceptLanguage(acceptLanguage);

    const story = await this.prisma.story.findFirst({
      where: { slug, isPublished: true },
      include: { dog: true },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    const media = await this.mediaService.findByEntity(
      STORY_ENTITY_TYPE,
      story.id,
    );
    const cover = media[0]
      ? { id: media[0].id, url: media[0].url, mimeType: media[0].mimeType }
      : null;

    const { title, body } = getLocalizedStoryContent(
      story.content as StoryContent,
      locale,
    );

    return {
      slug: story.slug,
      title,
      excerpt: buildExcerpt(body),
      body,
      publishedAt:
        story.publishedAt?.toISOString() ?? story.createdAt.toISOString(),
      cover,
      dogSlug: story.dog && story.dog.isPublished ? story.dog.slug : null,
      locale,
    };
  }

  private toPublicListItem(
    story: StoryWithDog,
    locale: ReturnType<typeof parseAcceptLanguage>,
    cover: { id: string; url: string; mimeType: string } | null,
  ): StoryPublicListItemDto {
    const { title, body } = getLocalizedStoryContent(
      story.content as StoryContent,
      locale,
    );

    return {
      slug: story.slug,
      title,
      excerpt: buildExcerpt(body),
      publishedAt:
        story.publishedAt?.toISOString() ?? story.createdAt.toISOString(),
      cover,
      dogSlug: story.dog && story.dog.isPublished ? story.dog.slug : null,
      locale,
    };
  }

  private async toAdminResponse(story: StoryWithDog): Promise<StoryAdminResponseDto> {
    const media = await this.mediaService.findByEntity(
      STORY_ENTITY_TYPE,
      story.id,
    );

    return {
      id: story.id,
      slug: story.slug,
      isPublished: story.isPublished,
      publishedAt: story.publishedAt?.toISOString() ?? null,
      dogId: story.dogId,
      dogSlug: story.dog?.slug ?? null,
      content: story.content as Record<string, unknown>,
      media: media.map((item) => ({
        id: item.id,
        url: item.url,
        mimeType: item.mimeType,
      })),
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    };
  }

  private normalizeContent(raw: Record<string, unknown>): StoryContent {
    const content = raw as StoryContent;
    for (const locale of ['en', 'th', 'ru'] as const) {
      const entry = content[locale];
      if (!entry) continue;
      if (entry.title) entry.title = entry.title.trim();
      if (entry.body) entry.body = entry.body.trim();
    }
    return content;
  }

  private assertEnglishRequired(content: StoryContent): void {
    try {
      validateEnglishStoryRequired(content);
    } catch {
      throw new BadRequestException(
        'English title and body (content.en.title, content.en.body) are required',
      );
    }
  }

  private async resolveSlug(
    requested: string | undefined,
    englishTitle: string,
  ): Promise<string> {
    const base = requested?.trim()
      ? slugify(requested.trim())
      : slugify(englishTitle);

    let slug = base || 'story';
    let suffix = 0;

    while (true) {
      const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
      const existing = await this.prisma.story.findUnique({
        where: { slug: candidate },
      });
      if (!existing) {
        return candidate;
      }
      suffix += 1;
    }
  }

  private async assertSlugAvailable(slug: string): Promise<void> {
    const existing = await this.prisma.story.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }
  }

  private async validateDogLink(dogId: string | null): Promise<void> {
    if (!dogId) {
      return;
    }

    const dog = await this.prisma.dog.findUnique({ where: { id: dogId } });
    if (!dog) {
      throw new NotFoundException('Linked dog not found');
    }
  }

  private async findStoryOrThrow(id: string): Promise<StoryWithDog> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: { dog: true },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    return story;
  }
}
