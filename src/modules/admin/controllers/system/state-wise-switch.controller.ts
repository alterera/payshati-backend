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
  CreateStateWizeSwitchDto,
  UpdateStateWizeSwitchDto,
  DeleteSwitchDto,
} from '../../dto/switch-management.dto';

@Controller('v1/admin/system/state-wize-switch')
export class StateWizeSwitchController {
  constructor(
    private readonly switchManagementService: SwitchManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listSwitches(@Body() dto: ListSwitchDto) {
    return this.switchManagementService.listStateWizeSwitches(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getSwitch(@Body() dto: GetSwitchDto) {
    return this.switchManagementService.getStateWizeSwitch(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createSwitch(@Body() dto: CreateStateWizeSwitchDto) {
    return this.switchManagementService.createStateWizeSwitch(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateSwitch(@Body() dto: UpdateStateWizeSwitchDto) {
    return this.switchManagementService.updateStateWizeSwitch(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteSwitch(@Body() dto: DeleteSwitchDto) {
    return this.switchManagementService.deleteStateWizeSwitch(dto.id);
  }
}
