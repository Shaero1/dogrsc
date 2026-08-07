import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { StoryListQueryDto } from './dto/story.dto';
import {
  PaginatedStoriesPublicResponseDto,
  StoryPublicDetailDto,
} from './dto/story-response.dto';
import { StoriesService } from './stories.service';

@ApiTags('stories')
@Controller('stories')
@Public()
export class StoriesPublicController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List published rescue stories' })
  @ApiOkResponse({ type: PaginatedStoriesPublicResponseDto })
  findAll(
    @Query() query: StoryListQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedStoriesPublicResponseDto> {
    return this.storiesService.findAllPublic(query, acceptLanguage);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get published story by slug' })
  @ApiOkResponse({ type: StoryPublicDetailDto })
  findBySlug(
    @Param('slug') slug: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<StoryPublicDetailDto> {
    return this.storiesService.findBySlugPublic(slug, acceptLanguage);
  }
}
