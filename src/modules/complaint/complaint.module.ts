import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintController } from './controllers/complaint.controller';
import { ComplaintService } from './services/complaint.service';
import { Complaint } from '../../database/entities/complaint.entity';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { Service } from '../../database/entities/service.entity';
import { Provider } from '../../database/entities/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Complaint,
      Report,
      User,
      Service,
      Provider,
    ]),
  ],
  controllers: [ComplaintController],
  providers: [ComplaintService],
})
export class ComplaintModule {}

