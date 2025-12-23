import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { AppUserGuard } from '../../auth/guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import {
  RechargeReportsDto,
  FundReportsDto,
  AccountReportsDto,
} from '../dto/reports.dto';

@Controller('v1')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('recharge-reports')
  @UseGuards(AppUserGuard)
  async getRechargeReports(
    @CurrentUser() user: User,
    @Body() dto: RechargeReportsDto,
  ) {
    return this.reportsService.getRechargeReports(user.id, dto);
  }

  @Post('fund-reports')
  @UseGuards(AppUserGuard)
  async getFundReports(
    @CurrentUser() user: User,
    @Body() dto: FundReportsDto,
  ) {
    return this.reportsService.getFundReports(user.id, dto);
  }

  @Post('account-reports')
  @UseGuards(AppUserGuard)
  async getAccountReports(
    @CurrentUser() user: User,
    @Body() dto: AccountReportsDto,
  ) {
    return this.reportsService.getAccountReports(user.id, dto);
  }
}

