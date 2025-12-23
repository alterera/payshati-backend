import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { CompanyManagementService } from '../../services/company-management.service';
import {
  ListCompanyDto,
  GetCompanyDto,
  UpdateCompanyDto,
} from '../../dto/company-management.dto';

@Controller('v1/admin/company/manage-company')
export class CompanyController {
  constructor(
    private readonly companyManagementService: CompanyManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listCompanies(@Body() dto: ListCompanyDto) {
    return this.companyManagementService.listCompanies(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getCompany(@Body() dto: GetCompanyDto) {
    return this.companyManagementService.getCompany(dto.id);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateCompany(@Body() dto: UpdateCompanyDto) {
    return this.companyManagementService.updateCompany(dto);
  }
}
