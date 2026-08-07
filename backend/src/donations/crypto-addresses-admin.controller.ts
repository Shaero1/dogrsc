import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CryptoAddressesService } from './crypto-addresses.service';
import { CreateCryptoAddressDto } from './dto/create-crypto-address.dto';
import {
  CryptoAddressAdminDto,
  CryptoAddressesAdminResponseDto,
} from './dto/crypto-address-response.dto';
import { UpdateCryptoAddressDto } from './dto/update-crypto-address.dto';

@ApiTags('admin-crypto-addresses')
@Controller('admin/crypto-addresses')
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class CryptoAddressesAdminController {
  constructor(private readonly cryptoAddressesService: CryptoAddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List crypto donation addresses' })
  @ApiOkResponse({ type: CryptoAddressesAdminResponseDto })
  findAll(): Promise<CryptoAddressesAdminResponseDto> {
    return this.cryptoAddressesService.findAllAdmin();
  }

  @Post()
  @ApiOperation({ summary: 'Create crypto donation address' })
  @ApiCreatedResponse({ type: CryptoAddressAdminDto })
  create(@Body() dto: CreateCryptoAddressDto): Promise<CryptoAddressAdminDto> {
    return this.cryptoAddressesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update crypto donation address' })
  @ApiOkResponse({ type: CryptoAddressAdminDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCryptoAddressDto,
  ): Promise<CryptoAddressAdminDto> {
    return this.cryptoAddressesService.update(id, dto);
  }
}
