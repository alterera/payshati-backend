import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ComplaintService } from '../services/complaint.service';
import { AppUserGuard } from '../../auth/guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import {
  SubmitComplaintDto,
  ListComplaintDto,
  GetComplaintReportDto,
} from '../dto/complaint.dto';

@Controller('v1/complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post('submit')
  @UseGuards(AppUserGuard)
  async submitComplaint(
    @CurrentUser() user: User,
    @Body() dto: SubmitComplaintDto,
  ) {
    return this.complaintService.submitComplaint(user.id, dto);
  }

  @Post('list')
  @UseGuards(AppUserGuard)
  async listComplaints(
    @CurrentUser() user: User,
    @Body() dto: ListComplaintDto,
  ) {
    return this.complaintService.listComplaints(user.id, dto);
  }

  @Post('report')
  @UseGuards(AppUserGuard)
  async getComplaintReport(
    @CurrentUser() user: User,
    @Body() dto: GetComplaintReportDto,
  ) {
    return this.complaintService.getComplaintReport(user.id, dto);
  }
}

