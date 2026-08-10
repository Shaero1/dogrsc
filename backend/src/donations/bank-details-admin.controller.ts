import { Body, Controller, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { DONATE_BANK_PAGE_ID } from '../content/content-pages.manifest';
import { ContentService } from '../content/content.service';
import { PageContentAdminDto } from '../content/dto/page-content-admin.dto';
import { UpsertPageContentDto } from '../content/dto/upsert-page-content.dto';

@ApiTags('admin-donations')
@Controller('admin/donations/bank-details')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class BankDetailsAdminController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get bank transfer details for the donate page' })
  @ApiOkResponse({ type: PageContentAdminDto })
  getBankDetails(): Promise<PageContentAdminDto> {
    return this.contentService.getAdminPage(DONATE_BANK_PAGE_ID);
  }

  @Put()
  @ApiOperation({ summary: 'Update bank transfer details for the donate page' })
  @ApiOkResponse({ type: PageContentAdminDto })
  upsertBankDetails(
    @Body() dto: UpsertPageContentDto,
  ): Promise<PageContentAdminDto> {
    return this.contentService.upsertPage(DONATE_BANK_PAGE_ID, dto.items);
  }
}
