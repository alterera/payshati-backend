import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Report } from '../../../database/entities/report.entity';
import { ListAccountReportDto } from '../dto/reports.dto';

@Injectable()
export class AccountReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async listAccountReports(listDto: ListAccountReportDto) {
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

    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    queryBuilder.where('report.createdAt BETWEEN :fromDate AND :toDate', {
      fromDate,
      toDate,
    });

    if (listDto.user_id && listDto.user_id !== 0) {
      queryBuilder.andWhere('report.userId = :userId', { userId: listDto.user_id });
    }

    if (listDto.tr_type && listDto.tr_type !== 'All') {
      queryBuilder.andWhere('report.transactionType = :trType', {
        trType: listDto.tr_type,
      });
    }

    if (listDto.fund_type && listDto.fund_type !== 'All') {
      queryBuilder.andWhere('report.fundType = :fundType', {
        fundType: listDto.fund_type,
      });
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.id', 'DESC')
      .skip(skip)
      .take(listDto.limit)
      .getManyAndCount();

    return {
      type: 'success',
      message: 'Account reports fetched successfully',
      data: reports,
      pagination: {
        page: listDto.page,
        limit: listDto.limit,
        total,
        totalPages: Math.ceil(total / listDto.limit),
      },
    };
  }

  async exportAccountReports(listDto: ListAccountReportDto) {
    const result = await this.listAccountReports({ ...listDto, limit: 10000, page: 1 });
    return result;
  }
}
