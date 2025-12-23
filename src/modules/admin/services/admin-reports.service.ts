import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Report } from '../../../database/entities/report.entity';
import { User } from '../../../database/entities/user.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { Api } from '../../../database/entities/api.entity';
import {
  UserSaleReportDto,
  MdDtSaleReportDto,
  ProviderSaleReportDto,
  ApiSaleReportDto,
  ApiLogReportDto,
} from '../dto/reports.dto';

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
  ) {}

  async liveRechargeReports() {
    const reports = await this.reportRepository.find({
      where: {
        transactionType: 'Recharge',
      },
      order: { id: 'DESC' },
      take: 25,
      relations: ['user', 'provider', 'api'],
    });

    return {
      type: 'success',
      message: 'Live recharge reports fetched successfully',
      data: reports,
    };
  }

  async userSaleReport(dto: UserSaleReportDto) {
    let fromDate: Date;
    let toDate: Date;

    if (dto.from_date && dto.to_date) {
      fromDate = new Date(`${dto.from_date} 00:00:00`);
      toDate = new Date(`${dto.to_date} 23:59:59`);
    } else {
      const today = new Date();
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.user', 'user')
      .select('user.outletName', 'outlet_name')
      .addSelect('user.mobileNumber', 'mobile_number')
      .addSelect('report.userId', 'id')
      .addSelect(
        'SUM(CASE WHEN report.status = "Pending" THEN 1 ELSE 0 END)',
        'PendingHit',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Failed" THEN 1 ELSE 0 END)',
        'FailedHit',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN 1 ELSE 0 END)',
        'SuccessHit',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Refunded" THEN 1 ELSE 0 END)',
        'RefundedHit',
      )
      .addSelect('COUNT(report.id)', 'TotalHit')
      .addSelect(
        'SUM(CASE WHEN report.status = "Pending" THEN report.totalAmount ELSE 0 END)',
        'PendingAmt',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Failed" THEN report.totalAmount ELSE 0 END)',
        'FailedAmt',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.totalAmount ELSE 0 END)',
        'SuccessAmt',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Refunded" THEN report.totalAmount ELSE 0 END)',
        'RefundedAmt',
      )
      .addSelect('SUM(report.totalAmount)', 'TotalAmt')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.commission ELSE 0 END)',
        'Comm',
      )
      .where('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      })
      .andWhere('report.transactionType IN (:...types)', {
        types: ['Recharge', 'Bill Pay'],
      });

    if (dto.user_id && dto.user_id !== 0) {
      query.andWhere('report.userId = :userId', { userId: dto.user_id });
    }

    const results = await query.groupBy('report.userId').addGroupBy('user.outletName').addGroupBy('user.mobileNumber').getRawMany();

    return {
      type: 'success',
      message: 'User sale report fetched successfully',
      data: results,
    };
  }

  async mdDtSaleReport(dto: MdDtSaleReportDto) {
    // Similar to userSaleReport but filters by MD/DT roles
    // MD = role_id 4, DT = role_id 5
    let fromDate: Date;
    let toDate: Date;

    if (dto.from_date && dto.to_date) {
      fromDate = new Date(`${dto.from_date} 00:00:00`);
      toDate = new Date(`${dto.to_date} 23:59:59`);
    } else {
      const today = new Date();
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.user', 'user')
      .select('user.outletName', 'outlet_name')
      .addSelect('user.mobileNumber', 'mobile_number')
      .addSelect('user.roleId', 'role_id')
      .addSelect('report.userId', 'id')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.totalAmount ELSE 0 END)',
        'SuccessAmt',
      )
      .addSelect('COUNT(CASE WHEN report.status = "Success" THEN 1 END)', 'SuccessHit')
      .addSelect('SUM(CASE WHEN report.status = "Success" THEN report.commission ELSE 0 END)', 'Comm')
      .where('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      })
      .andWhere('report.transactionType IN (:...types)', {
        types: ['Recharge', 'Bill Pay'],
      })
      .andWhere('user.roleId IN (:...roles)', { roles: [4, 5] });

    if (dto.user_id && dto.user_id !== 0) {
      query.andWhere('report.userId = :userId', { userId: dto.user_id });
    }

    const results = await query
      .groupBy('report.userId')
      .addGroupBy('user.outletName')
      .addGroupBy('user.mobileNumber')
      .addGroupBy('user.roleId')
      .getRawMany();

    return {
      type: 'success',
      message: 'MD & DT sale report fetched successfully',
      data: results,
    };
  }

  async providerSaleReport(dto: ProviderSaleReportDto) {
    let fromDate: Date;
    let toDate: Date;

    if (dto.from_date && dto.to_date) {
      fromDate = new Date(`${dto.from_date} 00:00:00`);
      toDate = new Date(`${dto.to_date} 23:59:59`);
    } else {
      const today = new Date();
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.provider', 'provider')
      .select('provider.providerName', 'provider_name')
      .addSelect('report.providerId', 'id')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.totalAmount ELSE 0 END)',
        'SuccessAmt',
      )
      .addSelect('COUNT(CASE WHEN report.status = "Success" THEN 1 END)', 'SuccessHit')
      .addSelect('SUM(report.totalAmount)', 'TotalAmt')
      .addSelect('COUNT(report.id)', 'TotalHit')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.commission ELSE 0 END)',
        'Comm',
      )
      .where('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      })
      .andWhere('report.transactionType IN (:...types)', {
        types: ['Recharge', 'Bill Pay'],
      });

    if (dto.provider_id && dto.provider_id !== 0) {
      query.andWhere('report.providerId = :providerId', {
        providerId: dto.provider_id,
      });
    }

    const results = await query.groupBy('report.providerId').addGroupBy('provider.providerName').getRawMany();

    return {
      type: 'success',
      message: 'Provider sale report fetched successfully',
      data: results,
    };
  }

  async apiSaleReport(dto: ApiSaleReportDto) {
    let fromDate: Date;
    let toDate: Date;

    if (dto.from_date && dto.to_date) {
      fromDate = new Date(`${dto.from_date} 00:00:00`);
      toDate = new Date(`${dto.to_date} 23:59:59`);
    } else {
      const today = new Date();
      fromDate = new Date(today.setHours(0, 0, 0, 0));
      toDate = new Date(today.setHours(23, 59, 59, 999));
    }

    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.api', 'api')
      .select('api.apiName', 'api_name')
      .addSelect('report.apiId', 'id')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.totalAmount ELSE 0 END)',
        'SuccessAmt',
      )
      .addSelect('COUNT(CASE WHEN report.status = "Success" THEN 1 END)', 'SuccessHit')
      .addSelect('SUM(report.totalAmount)', 'TotalAmt')
      .addSelect('COUNT(report.id)', 'TotalHit')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.commission ELSE 0 END)',
        'Comm',
      )
      .where('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      })
      .andWhere('report.transactionType IN (:...types)', {
        types: ['Recharge', 'Bill Pay'],
      });

    if (dto.api_id && dto.api_id !== 0) {
      query.andWhere('report.apiId = :apiId', { apiId: dto.api_id });
    }

    const results = await query.groupBy('report.apiId').addGroupBy('api.apiName').getRawMany();

    return {
      type: 'success',
      message: 'API sale report fetched successfully',
      data: results,
    };
  }

  async apiList() {
    const apis = await this.apiRepository.find({
      where: { status: 1, deletedAt: IsNull() },
      select: ['id', 'apiName'],
    });

    return {
      type: 'success',
      message: 'APIs fetched successfully',
      data: apis,
    };
  }

  async apiLogReport(dto: ApiLogReportDto) {
    // API logs would typically be stored in a separate table
    // For now, return a placeholder
    return {
      type: 'success',
      message: 'API log report fetched successfully',
      data: [],
      note: 'API logs table needs to be created if not exists',
    };
  }
}
