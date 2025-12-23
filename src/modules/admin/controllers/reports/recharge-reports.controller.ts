import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { RechargeReportsService } from '../../services/recharge-reports.service';
import { UserManagementService } from '../../services/user-management.service';
import {
  ListRechargeReportDto,
  GetProviderDto,
  GetApisDto,
  ChangeOperatorIdDto,
  GetComplaintDto,
  UpdateComplaintDto,
  UpdateStatusDto,
  CheckApiLogsDto,
} from '../../dto/reports.dto';

@Controller('v1/admin/user-reports/recharge-report')
export class RechargeReportsController {
  constructor(
    private readonly rechargeReportsService: RechargeReportsService,
    private readonly userManagementService: UserManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listRechargeReports(@Body() dto: ListRechargeReportDto) {
    return this.rechargeReportsService.listRechargeReports(dto);
  }

  @Post('export')
  @UseGuards(AdminGuard)
  async exportRechargeReports(@Body() dto: ListRechargeReportDto) {
    return this.rechargeReportsService.exportRechargeReports(dto);
  }

  @Post('search_user')
  @UseGuards(AdminGuard)
  async searchUser(@Body() dto: { keyword: string }) {
    return this.userManagementService.parentListSearch(dto.keyword);
  }

  @Post('get-provider')
  @UseGuards(AdminGuard)
  async getProvider(@Body() dto: GetProviderDto) {
    return this.rechargeReportsService.getProviders(dto.service_id);
  }

  @Post('get-apis')
  @UseGuards(AdminGuard)
  async getApis(@Body() dto: GetApisDto) {
    return this.rechargeReportsService.getApis(dto.provider_id);
  }

  @Post('change-operator-id')
  @UseGuards(AdminGuard)
  async changeOperatorId(@Body() dto: ChangeOperatorIdDto) {
    return this.rechargeReportsService.changeOperatorId(dto);
  }

  @Post('get-complaint')
  @UseGuards(AdminGuard)
  async getComplaint(@Body() dto: GetComplaintDto) {
    return this.rechargeReportsService.getComplaint(dto.report_id);
  }

  @Post('update-complaint')
  @UseGuards(AdminGuard)
  async updateComplaint(@Body() dto: UpdateComplaintDto) {
    return this.rechargeReportsService.updateComplaint(
      dto.report_id,
      dto.complaint_status,
      dto.complaint_remark,
    );
  }

  @Post('update-status')
  @UseGuards(AdminGuard)
  async updateStatus(@Body() dto: UpdateStatusDto) {
    return this.rechargeReportsService.updateStatus(dto);
  }

  @Post('check-api-logs')
  @UseGuards(AdminGuard)
  async checkApiLogs(@Body() dto: CheckApiLogsDto) {
    return this.rechargeReportsService.checkApiLogs(dto.report_id);
  }
}
