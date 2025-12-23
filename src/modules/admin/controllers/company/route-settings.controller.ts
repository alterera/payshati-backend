import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { RouteSettingsService } from '../../services/route-settings.service';
import {
  ListRouteSettingsDto,
  UpdatePriorityDto,
} from '../../dto/route-settings.dto';

@Controller('v1/admin/company/routes-settings')
export class RouteSettingsController {
  constructor(
    private readonly routeSettingsService: RouteSettingsService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listRouteSettings(@Body() dto: ListRouteSettingsDto) {
    return this.routeSettingsService.listRouteSettings();
  }

  @Post('update-priority')
  @UseGuards(AdminGuard)
  async updatePriority(@Body() dto: UpdatePriorityDto) {
    return this.routeSettingsService.updatePriority(dto);
  }
}
