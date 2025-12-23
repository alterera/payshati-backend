import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { AccountReportsService } from '../../services/account-reports.service';
import { UserManagementService } from '../../services/user-management.service';
import {
  ListAccountReportDto,
  SearchUserDto,
} from '../../dto/reports.dto';

@Controller('v1/admin/user-reports/account-report')
export class AccountReportsController {
  constructor(
    private readonly accountReportsService: AccountReportsService,
    private readonly userManagementService: UserManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listAccountReports(@Body() dto: ListAccountReportDto) {
    return this.accountReportsService.listAccountReports(dto);
  }

  @Post('export')
  @UseGuards(AdminGuard)
  async exportAccountReports(@Body() dto: ListAccountReportDto) {
    return this.accountReportsService.exportAccountReports(dto);
  }

  @Post('search_user')
  @UseGuards(AdminGuard)
  async searchUser(@Body() dto: SearchUserDto) {
    return this.userManagementService.parentListSearch(dto.search);
  }
}
