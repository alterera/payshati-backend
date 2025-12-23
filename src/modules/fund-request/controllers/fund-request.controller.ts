import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FundRequestService } from '../services/fund-request.service';
import { AppUserGuard } from '../../auth/guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import {
  SubmitFundRequestDto,
  ListFundRequestDto,
} from '../dto/fund-request.dto';

@Controller('v1/fund-request')
export class FundRequestController {
  constructor(private readonly fundRequestService: FundRequestService) {}

  @Post('submit')
  @UseGuards(AppUserGuard)
  async submitFundRequest(
    @CurrentUser() user: User,
    @Body() dto: SubmitFundRequestDto,
  ) {
    return this.fundRequestService.submitFundRequest(user.id, dto);
  }

  @Post('list')
  @UseGuards(AppUserGuard)
  async listFundRequests(
    @CurrentUser() user: User,
    @Body() dto: ListFundRequestDto,
  ) {
    return this.fundRequestService.listFundRequests(user.id, dto);
  }

  @Post('banks')
  @UseGuards(AppUserGuard)
  async getBanks(@CurrentUser() user: User) {
    return this.fundRequestService.getBanks(user.id);
  }
}

