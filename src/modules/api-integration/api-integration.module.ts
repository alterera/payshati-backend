import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '@nestjs/axios';
import { ApiRouterService } from './services/api-router.service';
import { ApiExecutorService } from './services/api-executor.service';
import {
  RouteSetting,
  AmountWizeSwitch,
  StateWizeSwitch,
  UserWizeSwitch,
  Provider,
  Api,
  ApiProviderCode,
  Report,
  State,
  User,
} from '../../database/entities';
import { HttpHelper } from '../../common/helpers/http.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RouteSetting,
      AmountWizeSwitch,
      StateWizeSwitch,
      UserWizeSwitch,
      Provider,
      Api,
      ApiProviderCode,
      Report,
      State,
      User,
    ]),
    HttpModule.register({}),
  ],
  providers: [
    ApiRouterService,
    ApiExecutorService,
    HttpHelper,
  ],
  exports: [ApiRouterService, ApiExecutorService],
})
export class ApiIntegrationModule {}
