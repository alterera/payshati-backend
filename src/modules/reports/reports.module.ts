import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { Provider } from '../../database/entities/provider.entity';
import { Service } from '../../database/entities/service.entity';
import { State } from '../../database/entities/state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, User, Provider, Service, State]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

