import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { ContentService } from './content.service';
import { PageContentPublicDto } from './dto/page-content-public.dto';

@ApiTags('content')
@Controller('content/pages')
@Public()
export class ContentPublicController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':entityId')
  @ApiOperation({ summary: 'Get CMS page content for a locale (fallback en)' })
  @ApiQuery({ name: 'locale', required: false, example: 'en' })
  @ApiOkResponse({ type: PageContentPublicDto })
  getPage(
    @Param('entityId') entityId: string,
    @Query('locale') locale = 'en',
  ): Promise<PageContentPublicDto> {
    return this.contentService.getPublicPage(entityId, locale);
  }
}
