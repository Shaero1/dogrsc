import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreateDonationAdminDto } from './dto/create-donation-admin.dto';
import {
  DonationResponseDto,
  PaginatedDonationsResponseDto,
} from './dto/donation-response.dto';
import { DonationListQueryDto } from './dto/donation-list-query.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';
import { DonationsRecordsService } from './donations-records.service';

@ApiTags('admin-donations')
@Controller('admin/donations')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class DonationsAdminController {
  constructor(private readonly donationsRecordsService: DonationsRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'List donation records' })
  @ApiOkResponse({ type: PaginatedDonationsResponseDto })
  findAll(
    @Query() query: DonationListQueryDto,
  ): Promise<PaginatedDonationsResponseDto> {
    return this.donationsRecordsService.findAllAdmin(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create donation record manually' })
  @ApiCreatedResponse({ type: DonationResponseDto })
  create(@Body() dto: CreateDonationAdminDto): Promise<DonationResponseDto> {
    return this.donationsRecordsService.createAdmin(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Confirm or reject pending donation' })
  @ApiOkResponse({ type: DonationResponseDto })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDonationStatusDto,
  ): Promise<DonationResponseDto> {
    return this.donationsRecordsService.updateStatus(id, dto.status);
  }
}
