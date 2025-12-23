import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RechargeService } from '../services/recharge.service';
import { AppUserGuard } from '../../auth/guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import {
  RechargeDto,
  CheckMobileDto,
  CheckRofferDto,
  CheckViewPlanDto,
  DthInfoDto,
  DthHeavyRefreshDto,
  RechargeReceiptDto,
} from '../dto/recharge.dto';

@Controller('v1')
export class RechargeController {
  constructor(private readonly rechargeService: RechargeService) {}

  @Post('run-recharge-api')
  @UseGuards(AppUserGuard)
  async processRecharge(
    @CurrentUser() user: User,
    @Body() rechargeDto: RechargeDto,
  ) {
    return this.rechargeService.processRecharge(user.id, rechargeDto);
  }

  @Post('recharge-reciept')
  @UseGuards(AppUserGuard)
  async getRechargeReceipt(
    @CurrentUser() user: User,
    @Body() receiptDto: RechargeReceiptDto,
  ) {
    return this.rechargeService.getRechargeReceipt(receiptDto.order_id, user.id);
  }

  @Post('check-number')
  @UseGuards(AppUserGuard)
  async checkMobileNumber(@Body() checkMobileDto: CheckMobileDto) {
    return this.rechargeService.checkMobileNumber(checkMobileDto);
  }

  @Post('check-roffer')
  @UseGuards(AppUserGuard)
  async checkRoffer(@Body() checkRofferDto: CheckRofferDto) {
    return this.rechargeService.checkRoffer(checkRofferDto);
  }

  @Post('check-view-plan')
  @UseGuards(AppUserGuard)
  async checkViewPlan(@Body() checkViewPlanDto: CheckViewPlanDto) {
    return this.rechargeService.checkViewPlan(checkViewPlanDto);
  }

  @Post('dth-info')
  @UseGuards(AppUserGuard)
  async dthInfo(@Body() dthInfoDto: DthInfoDto) {
    return this.rechargeService.dthInfo(dthInfoDto);
  }

  @Post('dth-heavy-refresh')
  @UseGuards(AppUserGuard)
  async dthHeavyRefresh(@Body() dthHeavyRefreshDto: DthHeavyRefreshDto) {
    return this.rechargeService.dthHeavyRefresh(dthHeavyRefreshDto);
  }
}
