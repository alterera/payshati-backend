import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { BankManagementService } from '../../services/bank-management.service';
import {
  ListBankDto,
  GetBankDto,
  CreateBankDto,
  UpdateBankDto,
  DeleteBankDto,
} from '../../dto/bank-management.dto';

@Controller('v1/admin/system/banks')
export class BankController {
  constructor(
    private readonly bankManagementService: BankManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listBanks(@Body() dto: ListBankDto, @Request() req: any) {
    const userId = req.user?.id || 1; // Admin user_id is typically 1
    return this.bankManagementService.listBanks(dto.page, dto.limit, userId);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getBank(@Body() dto: GetBankDto) {
    return this.bankManagementService.getBank(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createBank(@Body() dto: CreateBankDto, @Request() req: any) {
    const userId = req.user?.id || 1;
    return this.bankManagementService.createBank(dto, userId);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateBank(@Body() dto: UpdateBankDto) {
    return this.bankManagementService.updateBank(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteBank(@Body() dto: DeleteBankDto) {
    return this.bankManagementService.deleteBank(dto.id);
  }
}
