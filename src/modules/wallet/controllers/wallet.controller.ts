import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { AppUserGuard } from '../../auth/guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import { AddMoneyDto, TransferFundDto } from '../dto/wallet.dto';

@Controller('v1')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('instant-add-money')
  @UseGuards(AppUserGuard)
  async addMoney(
    @CurrentUser() user: User,
    @Body() addMoneyDto: AddMoneyDto,
  ) {
    const orderId = `UPI${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    return this.walletService.addMoney(user.id, addMoneyDto.amount, orderId);
  }

  @Post('fund-transfer')
  @UseGuards(AppUserGuard)
  async transferFund(
    @CurrentUser() user: User,
    @Body() transferFundDto: TransferFundDto,
  ) {
    if (transferFundDto.type !== 'Transfer') {
      throw new Error('Invalid transfer type');
    }
    return this.walletService.transferFund(
      user.id,
      transferFundDto.id,
      transferFundDto.amount,
      transferFundDto.remark,
    );
  }
}
