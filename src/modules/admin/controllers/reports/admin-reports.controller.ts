import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { AdminReportsService } from '../../services/admin-reports.service';
import {
  LiveRechargeReportsDto,
  UserSaleReportDto,
  MdDtSaleReportDto,
  ProviderSaleReportDto,
  ApiSaleReportDto,
  ApiLogReportDto,
} from '../../dto/reports.dto';

@Controller('v1/admin/admin-reports')
export class AdminReportsController {
  constructor(
    private readonly adminReportsService: AdminReportsService,
  ) {}

  @Post('recharge-live-reports/list')
  @UseGuards(AdminGuard)
  async liveRechargeReports(@Body() dto: LiveRechargeReportsDto) {
    return this.adminReportsService.liveRechargeReports();
  }

  @Post('user-sale-report/list')
  @UseGuards(AdminGuard)
  async userSaleReport(@Body() dto: UserSaleReportDto) {
    return this.adminReportsService.userSaleReport(dto);
  }

  @Post('md-dt-sale-report/list')
  @UseGuards(AdminGuard)
  async mdDtSaleReport(@Body() dto: MdDtSaleReportDto) {
    return this.adminReportsService.mdDtSaleReport(dto);
  }

  @Post('provider-sale-report/list')
  @UseGuards(AdminGuard)
  async providerSaleReport(@Body() dto: ProviderSaleReportDto) {
    return this.adminReportsService.providerSaleReport(dto);
  }

  @Post('api-sale-report/list')
  @UseGuards(AdminGuard)
  async apiSaleReport(@Body() dto: ApiSaleReportDto) {
    return this.adminReportsService.apiSaleReport(dto);
  }

  @Post('api-list')
  @UseGuards(AdminGuard)
  async apiList() {
    return this.adminReportsService.apiList();
  }

  @Post('api-log-report/list')
  @UseGuards(AdminGuard)
  async apiLogReport(@Body() dto: ApiLogReportDto) {
    return this.adminReportsService.apiLogReport(dto);
  }
}
