import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { ServiceManagementService } from '../../services/service-management.service';
import {
  ListServiceDto,
  GetServiceDto,
  CreateServiceDto,
  UpdateServiceDto,
  DeleteServiceDto,
} from '../../dto/service-management.dto';

@Controller('v1/admin/system/services')
export class ServiceController {
  constructor(
    private readonly serviceManagementService: ServiceManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listServices(@Body() dto: ListServiceDto) {
    return this.serviceManagementService.listServices(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getService(@Body() dto: GetServiceDto) {
    return this.serviceManagementService.getService(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createService(@Body() dto: CreateServiceDto) {
    return this.serviceManagementService.createService(dto.service_name, dto.status);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateService(@Body() dto: UpdateServiceDto) {
    return this.serviceManagementService.updateService(dto.edit_id, dto.service_name, dto.status);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteService(@Body() dto: DeleteServiceDto) {
    return this.serviceManagementService.deleteService(dto.id);
  }
}
