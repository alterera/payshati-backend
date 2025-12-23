import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, Not, In } from 'typeorm';
import { Report } from '../../../database/entities/report.entity';
import { ListFundReportDto } from '../dto/fund-management.dto';

@Injectable()
export class FundReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async listFundReports(listDto: ListFundReportDto) {
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

    queryBuilder.andWhere(
      'report.transactionType NOT IN (:...excludedTypes)',
      {
        excludedTypes: ['Commission', 'Recharge', 'Reverse Commission', 'Refund', 'Money Transfer'],
      },
    );

    if (listDto.user_id && listDto.user_id !== 0) {
      queryBuilder.andWhere('report.userId = :userId', { userId: listDto.user_id });
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.id', 'DESC')
      .skip(skip)
      .take(listDto.limit)
      .getManyAndCount();

    // Calculate summary stats
    const allReports = await this.reportRepository.find({
      where: {
        createdAt: Between(fromDate, toDate),
        transactionType: Not(In(['Commission', 'Recharge', 'Reverse Commission', 'Refund', 'Money Transfer'])),
        userId: listDto.user_id && listDto.user_id !== 0 ? listDto.user_id : undefined,
      },
    });

    const transferMoney = allReports.filter((r) => r.transactionType === 'Transfer Money');
    const receiveMoney = allReports.filter((r) => r.transactionType === 'Receive Money');
    const credit = allReports.filter((r) => r.fundType === 'Credit');
    const debit = allReports.filter((r) => r.fundType === 'Debit');

    return {
      type: 'success',
      message: 'Fund reports fetched successfully',
      data: reports,
      summary: {
        transferMoney: {
          amount: transferMoney.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: transferMoney.length,
        },
        receiveMoney: {
          amount: receiveMoney.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: receiveMoney.length,
        },
        credit: {
          amount: credit.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: credit.length,
        },
        debit: {
          amount: debit.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: debit.length,
        },
        total: {
          amount: allReports.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: allReports.length,
        },
      },
      pagination: {
        page: listDto.page,
        limit: listDto.limit,
        total,
        totalPages: Math.ceil(total / listDto.limit),
      },
    };
  }

  async exportFundReports(listDto: ListFundReportDto) {
    // Similar to listFundReports but returns all records for export
    const result = await this.listFundReports({ ...listDto, limit: 10000, page: 1 });
    return result;
  }
}
