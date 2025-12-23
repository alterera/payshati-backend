import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ApiManagementController } from './controllers/api-management.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { SchemeController } from './controllers/system/scheme.controller';
import { ProviderController } from './controllers/system/provider.controller';
import { ServiceController } from './controllers/system/service.controller';
import { StateController } from './controllers/system/state.controller';
import { BankController } from './controllers/system/bank.controller';
import { AmountBlockController } from './controllers/system/amount-block.controller';
import { AmountWizeSwitchController } from './controllers/system/amount-wise-switch.controller';
import { StateWizeSwitchController } from './controllers/system/state-wise-switch.controller';
import { UserWizeSwitchController } from './controllers/system/user-wise-switch.controller';
import { AnnouncementController } from './controllers/system/announcement.controller';
import { SliderController } from './controllers/system/slider.controller';
import { RoleController } from './controllers/system/role.controller';
import { UserListController } from './controllers/users/user-list.controller';
import { SendMessageController } from './controllers/users/send-message.controller';
import { FundRequestController } from './controllers/fund/fund-request.controller';
import { FundReportsController } from './controllers/fund/fund-reports.controller';
import { AccountReportsController } from './controllers/reports/account-reports.controller';
import { RechargeReportsController } from './controllers/reports/recharge-reports.controller';
import { AdminReportsController } from './controllers/reports/admin-reports.controller';
import { CompanyController } from './controllers/company/company.controller';
import { EmailTemplateController } from './controllers/company/email-template.controller';
import { SmsTemplateController } from './controllers/company/sms-template.controller';
import { RouteSettingsController } from './controllers/company/route-settings.controller';
import { ComplaintController } from './controllers/support/complaint.controller';
import { ProfileController } from './controllers/profile.controller';
import { AdminAuthService } from './services/admin-auth.service';
import { SchemeManagementService } from './services/scheme-management.service';
import { ProviderManagementService } from './services/provider-management.service';
import { ServiceManagementService } from './services/service-management.service';
import { StateManagementService } from './services/state-management.service';
import { BankManagementService } from './services/bank-management.service';
import { AmountBlockService } from './services/amount-block.service';
import { SwitchManagementService } from './services/switch-management.service';
import { AnnouncementSliderService } from './services/announcement-slider.service';
import { RoleManagementService } from './services/role-management.service';
import { UserManagementService } from './services/user-management.service';
import { SendMessageService } from './services/send-message.service';
import { FundManagementService } from './services/fund-management.service';
import { FundReportsService } from './services/fund-reports.service';
import { AccountReportsService } from './services/account-reports.service';
import { RechargeReportsService } from './services/recharge-reports.service';
import { AdminReportsService } from './services/admin-reports.service';
import { CompanyManagementService } from './services/company-management.service';
import { TemplateManagementService } from './services/template-management.service';
import { RouteSettingsService } from './services/route-settings.service';
import { ComplaintService } from './services/complaint.service';
import { ProfileService } from './services/profile.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { HttpHelper } from '../../common/helpers/http.helper';
import { ConfigService } from '@nestjs/config';
import {
  Api,
  User,
  ApiProviderCode,
  ApiStateCode,
  Provider,
  State,
  SmsTemplate,
  EmailTemplate,
  LoginHistory,
  Report,
  Complaint,
  Service,
  Scheme,
  SchemeCommission,
  Bank,
  AmountBlock,
  AmountWizeSwitch,
  StateWizeSwitch,
  UserWizeSwitch,
  Announcement,
  Slider,
  Role,
  FundRequest,
  Company,
  RouteSetting,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Api,
      User,
      ApiProviderCode,
      ApiStateCode,
      Provider,
      State,
      SmsTemplate,
      EmailTemplate,
      LoginHistory,
      Report,
      Complaint,
      Service,
      Scheme,
      SchemeCommission,
      Bank,
      AmountBlock,
      AmountWizeSwitch,
      StateWizeSwitch,
      UserWizeSwitch,
      Announcement,
      Slider,
      Role,
      FundRequest,
      Company,
      RouteSetting,
    ]),
    HttpModule.register({}),
  ],
  controllers: [
    ApiManagementController,
    AdminAuthController,
    AdminDashboardController,
    SchemeController,
    ProviderController,
    ServiceController,
    StateController,
    BankController,
    AmountBlockController,
    AmountWizeSwitchController,
    StateWizeSwitchController,
    UserWizeSwitchController,
    AnnouncementController,
    SliderController,
    RoleController,
    UserListController,
    SendMessageController,
    FundRequestController,
    FundReportsController,
    AccountReportsController,
    RechargeReportsController,
    AdminReportsController,
    CompanyController,
    EmailTemplateController,
    SmsTemplateController,
    RouteSettingsController,
    ComplaintController,
    ProfileController,
  ],
  providers: [
    AdminGuard,
    AdminAuthService,
    SchemeManagementService,
    ProviderManagementService,
    ServiceManagementService,
    StateManagementService,
    BankManagementService,
    AmountBlockService,
    SwitchManagementService,
    AnnouncementSliderService,
    RoleManagementService,
    UserManagementService,
    SendMessageService,
    FundManagementService,
    FundReportsService,
    AccountReportsService,
    RechargeReportsService,
    AdminReportsService,
    CompanyManagementService,
    TemplateManagementService,
    RouteSettingsService,
    ComplaintService,
    ProfileService,
    HttpHelper,
    ConfigService,
  ],
  exports: [AdminGuard, AdminAuthService],
})
export class AdminModule {}
