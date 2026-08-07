import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CaptchaService } from '../captcha/captcha.service';
import { CryptoAddressesService } from './crypto-addresses.service';
import { CryptoAddressesPublicResponseDto } from './dto/crypto-address-response.dto';
import { CreateDonationPublicDto } from './dto/create-donation-public.dto';
import { DonationResponseDto } from './dto/donation-response.dto';
import { DonationsRecordsService } from './donations-records.service';

@ApiTags('donate')
@Controller('donate')
@Public()
export class DonatePublicController {
  constructor(
    private readonly cryptoAddressesService: CryptoAddressesService,
    private readonly donationsRecordsService: DonationsRecordsService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Get('crypto-addresses')
  @ApiOperation({ summary: 'List active crypto donation addresses' })
  @ApiOkResponse({ type: CryptoAddressesPublicResponseDto })
  findActive(): Promise<CryptoAddressesPublicResponseDto> {
    return this.cryptoAddressesService.findActivePublic();
  }

  @Post('donations')
  @ApiOperation({ summary: 'Report a bank or crypto donation' })
  @ApiCreatedResponse({ type: DonationResponseDto })
  async createDonation(
    @Body() dto: CreateDonationPublicDto,
  ): Promise<DonationResponseDto> {
    await this.captchaService.verify(dto.captchaToken);
    return this.donationsRecordsService.createPublic(dto);
  }
}
