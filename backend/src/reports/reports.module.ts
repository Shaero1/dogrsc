import { Module } from '@nestjs/common';
import { CaptchaModule } from '../captcha/captcha.module';
import { MediaModule } from '../media/media.module';
import {
  FoundReportsAdminController,
  FoundReportsPublicController,
} from './found-reports.controller';
import {
  LostReportsAdminController,
  LostReportsPublicController,
} from './lost-reports.controller';
import { ReportsService } from './reports.service';
import { SystemUserService } from './system-user.service';

@Module({
  imports: [MediaModule, CaptchaModule],
  controllers: [
    FoundReportsPublicController,
    FoundReportsAdminController,
    LostReportsPublicController,
    LostReportsAdminController,
  ],
  providers: [ReportsService, SystemUserService],
})
export class ReportsModule {}
