import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { RoleManagementService } from '../../services/role-management.service';

@Controller('v1/admin/system/role')
export class RoleController {
  constructor(
    private readonly roleManagementService: RoleManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listRoles(@Body() body: any) {
    return this.roleManagementService.listRoles();
  }
}
