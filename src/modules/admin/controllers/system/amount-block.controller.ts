import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { AmountBlockService } from '../../services/amount-block.service';
import {
  ListAmountBlockDto,
  GetAmountBlockDto,
  CreateAmountBlockDto,
  UpdateAmountBlockDto,
  DeleteAmountBlockDto,
} from '../../dto/amount-block.dto';

@Controller('v1/admin/system/amount-block')
export class AmountBlockController {
  constructor(
    private readonly amountBlockService: AmountBlockService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listAmountBlocks(@Body() dto: ListAmountBlockDto) {
    return this.amountBlockService.listAmountBlocks(dto.page, dto.limit);
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getAmountBlock(@Body() dto: GetAmountBlockDto) {
    return this.amountBlockService.getAmountBlock(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createAmountBlock(@Body() dto: CreateAmountBlockDto) {
    return this.amountBlockService.createAmountBlock(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateAmountBlock(@Body() dto: UpdateAmountBlockDto) {
    return this.amountBlockService.updateAmountBlock(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteAmountBlock(@Body() dto: DeleteAmountBlockDto) {
    return this.amountBlockService.deleteAmountBlock(dto.id);
  }
}
