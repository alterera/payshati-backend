import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { User, Report } from '../../database/entities';
import { TransactionHelper } from '../../common/helpers/transaction.helper';

@Module({
  imports: [TypeOrmModule.forFeature([User, Report])],
  controllers: [WalletController],
  providers: [WalletService, TransactionHelper],
  exports: [WalletService],
})
export class WalletModule {}
