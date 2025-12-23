import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { StateManagementService } from '../../services/state-management.service';
import {
  ListStateDto,
  GetStateDto,
  CreateStateDto,
  UpdateStateDto,
  DeleteStateDto,
} from '../../dto/state-management.dto';

@Controller('v1/admin/system/states')
export class StateController {
  constructor(
    private readonly stateManagementService: StateManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listStates(@Body() dto: ListStateDto) {
    return this.stateManagementService.listStates(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getState(@Body() dto: GetStateDto) {
    return this.stateManagementService.getState(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createState(@Body() dto: CreateStateDto) {
    return this.stateManagementService.createState(
      dto.state_name,
      dto.plan_api_code,
      dto.mplan_state_code,
      dto.status,
    );
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateState(@Body() dto: UpdateStateDto) {
    return this.stateManagementService.updateState(
      dto.edit_id,
      dto.state_name,
      dto.plan_api_code,
      dto.mplan_state_code,
      dto.status,
    );
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteState(@Body() dto: DeleteStateDto) {
    return this.stateManagementService.deleteState(dto.id);
  }
}

