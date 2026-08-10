import { Module } from '@nestjs/common';
import { CaptchaModule } from '../captcha/captcha.module';
import { ContentModule } from '../content/content.module';
import { BankDetailsAdminController } from './bank-details-admin.controller';
import { CryptoAddressesAdminController } from './crypto-addresses-admin.controller';
import { CryptoAddressesService } from './crypto-addresses.service';
import { DonatePublicController } from './donate-public.controller';
import { DonationsAdminController } from './donations-admin.controller';
import { DonationsRecordsService } from './donations-records.service';

@Module({
  imports: [CaptchaModule, ContentModule],
  controllers: [
    DonatePublicController,
    CryptoAddressesAdminController,
    BankDetailsAdminController,
    DonationsAdminController,
  ],
  providers: [CryptoAddressesService, DonationsRecordsService],
})
export class DonationsModule {}
