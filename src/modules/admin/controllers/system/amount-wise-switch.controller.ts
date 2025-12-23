import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { SwitchManagementService } from '../../services/switch-management.service';
import {
  ListSwitchDto,
  GetSwitchDto,
  CreateAmountWizeSwitchDto,
  UpdateAmountWizeSwitchDto,
  DeleteSwitchDto,
} from '../../dto/switch-management.dto';

@Controller('v1/admin/system/amount-wize-switch')
export class AmountWizeSwitchController {
  constructor(
    private readonly switchManagementService: SwitchManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listSwitches(@Body() dto: ListSwitchDto) {
    return this.switchManagementService.listAmountWizeSwitches(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getSwitch(@Body() dto: GetSwitchDto) {
    return this.switchManagementService.getAmountWizeSwitch(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createSwitch(@Body() dto: CreateAmountWizeSwitchDto) {
    return this.switchManagementService.createAmountWizeSwitch(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateSwitch(@Body() dto: UpdateAmountWizeSwitchDto) {
    return this.switchManagementService.updateAmountWizeSwitch(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteSwitch(@Body() dto: DeleteSwitchDto) {
    return this.switchManagementService.deleteAmountWizeSwitch(dto.id);
  }
}
