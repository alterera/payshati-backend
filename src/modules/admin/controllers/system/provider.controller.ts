import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { ProviderManagementService } from '../../services/provider-management.service';
import {
  ListProviderDto,
  GetProviderDto,
  CreateProviderDto,
  UpdateProviderDto,
  DeleteProviderDto,
} from '../../dto/provider-management.dto';

@Controller('v1/admin/system/providers')
export class ProviderController {
  constructor(
    private readonly providerManagementService: ProviderManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listProviders(@Body() dto: ListProviderDto) {
    return this.providerManagementService.listProviders(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getProvider(@Body() dto: GetProviderDto) {
    return this.providerManagementService.getProvider(dto.id);
  }

  @Post('api_and_service')
  @UseGuards(AdminGuard)
  async getApiAndService() {
    return this.providerManagementService.getApiAndService();
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createProvider(@Body() dto: CreateProviderDto) {
    return this.providerManagementService.createProvider(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateProvider(@Body() dto: UpdateProviderDto) {
    return this.providerManagementService.updateProvider(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteProvider(@Body() dto: DeleteProviderDto) {
    return this.providerManagementService.deleteProvider(dto.id);
  }
}
