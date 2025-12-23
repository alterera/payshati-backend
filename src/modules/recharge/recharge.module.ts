import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargeController } from './controllers/recharge.controller';
import { CallbackController } from './controllers/callback.controller';
import { RechargeService } from './services/recharge.service';
import { User, Report, Provider, Api, ApiProviderCode, State } from '../../database/entities';
import { ApiIntegrationModule } from '../api-integration/api-integration.module';
import { CommissionModule } from '../commission/commission.module';
import { TransactionHelper } from '../../common/helpers/transaction.helper';
import { HttpModule } from '@nestjs/axios';
import { HttpHelper } from '../../common/helpers/http.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Report, Provider, Api, ApiProviderCode, State]),
    ApiIntegrationModule,
    CommissionModule,
    HttpModule.register({}),
  ],
  controllers: [RechargeController, CallbackController],
  providers: [RechargeService, TransactionHelper, HttpHelper],
  exports: [RechargeService],
})
export class RechargeModule {}
