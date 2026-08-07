import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { ContentService } from './content.service';
import {
  ContentPageSummaryDto,
  PageContentAdminDto,
} from './dto/page-content-admin.dto';
import { UpsertPageContentDto } from './dto/upsert-page-content.dto';

@ApiTags('admin-content')
@Controller('admin/content/pages')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ContentAdminController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'List CMS pages available for editing' })
  @ApiOkResponse({ type: [ContentPageSummaryDto] })
  listPages(): ContentPageSummaryDto[] {
    return this.contentService.listPages();
  }

  @Get(':entityId')
  @ApiOperation({ summary: 'Get all stored translations for a page' })
  @ApiOkResponse({ type: PageContentAdminDto })
  getPage(@Param('entityId') entityId: string): Promise<PageContentAdminDto> {
    return this.contentService.getAdminPage(entityId);
  }

  @Put(':entityId')
  @ApiOperation({ summary: 'Bulk upsert page translations' })
  @ApiOkResponse({ type: PageContentAdminDto })
  upsertPage(
    @Param('entityId') entityId: string,
    @Body() dto: UpsertPageContentDto,
  ): Promise<PageContentAdminDto> {
    return this.contentService.upsertPage(entityId, dto.items);
  }
}
