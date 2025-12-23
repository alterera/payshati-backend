import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionService } from './services/commission.service';
import {
  User,
  Report,
  Scheme,
  SchemeCommission,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Report, Scheme, SchemeCommission]),
  ],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
