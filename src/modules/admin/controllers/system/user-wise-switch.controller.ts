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
  CreateUserWizeSwitchDto,
  UpdateUserWizeSwitchDto,
  DeleteSwitchDto,
} from '../../dto/switch-management.dto';

@Controller('v1/admin/system/user-wize-switch')
export class UserWizeSwitchController {
  constructor(
    private readonly switchManagementService: SwitchManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listSwitches(@Body() dto: ListSwitchDto) {
    return this.switchManagementService.listUserWizeSwitches(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getSwitch(@Body() dto: GetSwitchDto) {
    return this.switchManagementService.getUserWizeSwitch(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createSwitch(@Body() dto: CreateUserWizeSwitchDto) {
    return this.switchManagementService.createUserWizeSwitch(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateSwitch(@Body() dto: UpdateUserWizeSwitchDto) {
    return this.switchManagementService.updateUserWizeSwitch(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteSwitch(@Body() dto: DeleteSwitchDto) {
    return this.switchManagementService.deleteUserWizeSwitch(dto.id);
  }
}
