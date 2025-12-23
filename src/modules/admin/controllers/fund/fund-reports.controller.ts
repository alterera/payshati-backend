import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { FundReportsService } from '../../services/fund-reports.service';
import {
  ListFundReportDto,
  SearchUserDto,
} from '../../dto/fund-management.dto';
import { FundManagementService } from '../../services/fund-management.service';

@Controller('v1/admin/fund/fund-report')
export class FundReportsController {
  constructor(
    private readonly fundReportsService: FundReportsService,
    private readonly fundManagementService: FundManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listFundReports(@Body() dto: ListFundReportDto) {
    return this.fundReportsService.listFundReports(dto);
  }

  @Post('export')
  @UseGuards(AdminGuard)
  async exportFundReports(@Body() dto: ListFundReportDto) {
    return this.fundReportsService.exportFundReports(dto);
  }

  @Post('search_user')
  @UseGuards(AdminGuard)
  async searchUser(@Body() dto: SearchUserDto) {
    return this.fundManagementService.searchUser(dto);
  }
}
