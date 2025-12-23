import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { FundManagementService } from '../../services/fund-management.service';
import {
  ListFundRequestDto,
  UpdateFundRequestDto,
  SearchUserDto,
} from '../../dto/fund-management.dto';

@Controller('v1/admin/fund/fund-request')
export class FundRequestController {
  constructor(
    private readonly fundManagementService: FundManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listFundRequests(@Body() dto: ListFundRequestDto) {
    return this.fundManagementService.listFundRequests(dto);
  }

  @Post('search_user')
  @UseGuards(AdminGuard)
  async searchUser(@Body() dto: SearchUserDto) {
    return this.fundManagementService.searchUser(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateFundRequest(@Body() dto: UpdateFundRequestDto, @Request() req: any) {
    const adminUserId = req.user?.id;
    return this.fundManagementService.updateFundRequest(dto, adminUserId);
  }
}
