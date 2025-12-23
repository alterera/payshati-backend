import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Complaint } from '../../../database/entities/complaint.entity';
import { Report } from '../../../database/entities/report.entity';
import { Service } from '../../../database/entities/service.entity';
import { User } from '../../../database/entities/user.entity';
import { ListComplaintDto } from '../dto/complaint.dto';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async listComplaints(listDto: ListComplaintDto) {
    const skip = (listDto.page - 1) * listDto.limit;

    let fromDate: Date;
    let toDate: Date;

    if (listDto.from_date && listDto.to_date) {
      fromDate = new Date(`${listDto.from_date} 00:00:00`);
      toDate = new Date(`${listDto.to_date} 23:59:59`);
    } else {
      const today = new Date();
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const queryBuilder = this.complaintRepository.createQueryBuilder('complaint');

    queryBuilder.where('complaint.createdAt BETWEEN :fromDate AND :toDate', {
      fromDate,
      toDate,
    });

    if (listDto.request_id) {
      queryBuilder.andWhere('complaint.requestId LIKE :requestId', {
        requestId: `%${listDto.request_id}%`,
      });
    }

    if (listDto.status && listDto.status !== 'All') {
      queryBuilder.andWhere('complaint.status = :status', { status: listDto.status });
    }

    const [complaints, total] = await queryBuilder
      .orderBy('complaint.id', 'DESC')
      .skip(skip)
      .take(listDto.limit)
      .getManyAndCount();

    return {
      type: 'success',
      message: 'Complaints fetched successfully',
      data: complaints,
      pagination: {
        page: listDto.page,
        limit: listDto.limit,
        total,
        totalPages: Math.ceil(total / listDto.limit),
      },
    };
  }

  async getComplaintReport(id: number) {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!complaint) {
      throw new BadRequestException({
        type: 'error',
        message: 'Complaint not found',
      });
    }

    const report = await this.reportRepository.findOne({
      where: { orderId: complaint.orderId },
      relations: ['provider', 'service'],
    });

    return {
      type: 'success',
      message: 'Complaint report fetched successfully',
      data: {
        complaint,
        report,
      },
    };
  }
}
