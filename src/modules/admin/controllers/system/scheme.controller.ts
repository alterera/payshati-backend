import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { SchemeManagementService } from '../../services/scheme-management.service';
import {
  ListSchemeDto,
  GetSchemeDto,
  CreateSchemeDto,
  UpdateSchemeDto,
  DeleteSchemeDto,
  GetCommissionDataDto,
  SingleUpdateCommissionDto,
  BulkUpdateCommissionDto,
} from '../../dto/scheme-management.dto';

@Controller('v1/admin/system/scheme')
export class SchemeController {
  constructor(
    private readonly schemeManagementService: SchemeManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listSchemes(@Body() dto: ListSchemeDto) {
    return this.schemeManagementService.listSchemes(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getScheme(@Body() dto: GetSchemeDto) {
    return this.schemeManagementService.getScheme(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createScheme(@Body() dto: CreateSchemeDto) {
    return this.schemeManagementService.createScheme(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateScheme(@Body() dto: UpdateSchemeDto) {
    return this.schemeManagementService.updateScheme(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteScheme(@Body() dto: DeleteSchemeDto) {
    return this.schemeManagementService.deleteScheme(dto.id);
  }

  @Post('commission')
  @UseGuards(AdminGuard)
  async getCommissionData(@Body() dto: GetCommissionDataDto) {
    return this.schemeManagementService.getCommissionData(dto);
  }

  @Post('single_set_commission')
  @UseGuards(AdminGuard)
  async singleUpdateCommission(@Body() dto: SingleUpdateCommissionDto) {
    return this.schemeManagementService.singleUpdateCommission(dto);
  }

  @Post('bulk_set_commission')
  @UseGuards(AdminGuard)
  async bulkUpdateCommission(@Body() dto: BulkUpdateCommissionDto) {
    return this.schemeManagementService.bulkUpdateCommission(dto);
  }
}
