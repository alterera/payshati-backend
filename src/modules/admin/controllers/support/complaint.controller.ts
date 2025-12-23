import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { ComplaintService } from '../../services/complaint.service';
import {
  ListComplaintDto,
  GetComplaintReportDto,
} from '../../dto/complaint.dto';

@Controller('v1/admin/support/complaint')
export class ComplaintController {
  constructor(
    private readonly complaintService: ComplaintService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listComplaints(@Body() dto: ListComplaintDto) {
    return this.complaintService.listComplaints(dto);
  }

  @Post('get-report')
  @UseGuards(AdminGuard)
  async getComplaintReport(@Body() dto: GetComplaintReportDto) {
    return this.complaintService.getComplaintReport(dto.id);
  }
}
