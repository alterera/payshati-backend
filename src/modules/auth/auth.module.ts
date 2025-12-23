import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './controllers/auth.controller';
import { HomeController } from './controllers/home.controller';
import { AuthService } from './services/auth.service';
import { AppUserGuard } from './guards/app-user.guard';
import { ApiPartnerGuard } from './guards/api-partner.guard';
import { AdminGuard } from './guards/admin.guard';
import {
  User,
  UserRegisterOtp,
  LoginHistory,
  SmsTemplate,
  EmailTemplate,
  Company,
  State,
  Provider,
  Report,
  Complaint,
  Announcement,
  Slider,
  Service,
  SchemeCommission,
} from '../../database/entities';
import { HttpHelper } from '../../common/helpers/http.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRegisterOtp,
      LoginHistory,
      SmsTemplate,
      EmailTemplate,
      Company,
      State,
      Provider,
      Report,
      Complaint,
      Announcement,
      Slider,
      Service,
      SchemeCommission,
    ]),
    HttpModule.register({}),
  ],
  controllers: [AuthController, HomeController],
  providers: [
    AuthService,
    AppUserGuard,
    ApiPartnerGuard,
    AdminGuard,
    HttpHelper,
  ],
  exports: [AuthService, AppUserGuard, ApiPartnerGuard, AdminGuard, HttpHelper],
})
export class AuthModule {}
