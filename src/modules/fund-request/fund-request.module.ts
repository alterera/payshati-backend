import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundRequestController } from './controllers/fund-request.controller';
import { FundRequestService } from './services/fund-request.service';
import { FundRequest } from '../../database/entities/fund-request.entity';
import { User } from '../../database/entities/user.entity';
import { Bank } from '../../database/entities/bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundRequest, User, Bank])],
  controllers: [FundRequestController],
  providers: [FundRequestService],
})
export class FundRequestModule {}

