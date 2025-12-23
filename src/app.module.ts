import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import databaseConfig from './config/database.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FundRequestModule } from './modules/fund-request/fund-request.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { RechargeModule } from './modules/recharge/recharge.module';
import { ApiIntegrationModule } from './modules/api-integration/api-integration.module';
import { CommissionModule } from './modules/commission/commission.module';
import { AdminModule } from './modules/admin/admin.module';
import * as entities from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    WalletModule,
    RechargeModule,
    ApiIntegrationModule,
    CommissionModule,
    AdminModule,
    ReportsModule,
    FundRequestModule,
    ComplaintModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}