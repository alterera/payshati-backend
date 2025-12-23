import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like } from 'typeorm';
import { Report } from '../../../database/entities/report.entity';
import { User } from '../../../database/entities/user.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { Service } from '../../../database/entities/service.entity';
import { State } from '../../../database/entities/state.entity';
import {
  RechargeReportsDto,
  FundReportsDto,
  AccountReportsDto,
} from '../dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) {}

  async getRechargeReports(userId: number, dto: RechargeReportsDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    const skip = (dto.page - 1) * dto.limit;

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

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.provider', 'provider')
      .leftJoinAndSelect('report.service', 'service')
      .where('report.userId = :userId', { userId })
      .andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });

    // Filter by transaction type based on user role
    if (user.roleId === 6 || user.roleId === 3) {
      queryBuilder.andWhere('report.transactionType IN (:...types)', {
        types: ['Recharge'],
      });
    } else {
      queryBuilder.andWhere('report.transactionType IN (:...types)', {
        types: ['Commission'],
      });
    }

    if (dto.order_id) {
      queryBuilder.andWhere('report.orderId = :orderId', {
        orderId: dto.order_id,
      });
    }

    if (dto.number) {
      queryBuilder.andWhere('report.number = :number', { number: dto.number });
    }

    if (dto.req_order_id) {
      queryBuilder.andWhere('report.apiPartnerOrderId = :reqOrderId', {
        reqOrderId: dto.req_order_id,
      });
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.id', 'DESC')
      .skip(skip)
      .take(dto.limit)
      .getManyAndCount();

    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        let stateName = 'No State';
        if (report.stateId) {
          const state = await this.stateRepository.findOne({
            where: { id: report.stateId },
          });
          if (state) {
            stateName = state.stateName;
          }
        }

        return {
          id: report.id,
          transaction_date: report.transactionDate,
          number: report.number,
          provider_name: (report as any).provider?.providerName || '',
          state_name: stateName,
          service_name: (report as any).service?.serviceName || '',
          path: report.path,
          order_id: report.orderId,
          request_order_id: report.apiPartnerOrderId || '',
          operator_id: report.operatorId || '',
          status: report.status,
          total_amount: Number(report.totalAmount).toFixed(2),
          amount: Number(report.amount).toFixed(2),
          commission: Number(report.commission || 0).toFixed(2),
        };
      }),
    );

    return {
      type: 'success',
      message: 'Recharge reports fetched successfully',
      data: reportsWithDetails,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getFundReports(userId: number, dto: FundReportsDto) {
    const skip = (dto.page - 1) * dto.limit;

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

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .where('report.userId = :userId', { userId })
      .andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      })
      .andWhere('report.transactionType IN (:...types)', {
        types: [
          'Transfer Money',
          'Receive Money',
          'Self Money',
          'Money Reverse',
          'Reverse Money',
          'Upi Add Money',
        ],
      });

    const [reports, total] = await queryBuilder
      .orderBy('report.id', 'DESC')
      .skip(skip)
      .take(dto.limit)
      .getManyAndCount();

    const reportsWithDetails = reports.map((report) => {
      let statusColor = 'warning';
      if (report.status === 'Success') {
        statusColor = 'success';
      } else if (report.status === 'Failed') {
        statusColor = 'danger';
      }

      return {
        id: report.id,
        transaction_date: report.transactionDate,
        order_id: report.orderId,
        transaction_type: report.transactionType,
        fund_type: report.fundType,
        amount: Number(report.amount).toFixed(2),
        total_amount: Number(report.totalAmount).toFixed(2),
        remark: report.remark,
        status: report.status,
        status_color: statusColor,
        opening_balance: Number(report.openingBalance || 0).toFixed(2),
        closing_balance: Number(report.closingBalance || 0).toFixed(2),
        credit_user_id: report.creditUserId,
        debit_user_id: report.debitUserId,
      };
    });

    return {
      type: 'success',
      message: 'Fund reports fetched successfully',
      data: reportsWithDetails,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getAccountReports(userId: number, dto: AccountReportsDto) {
    const skip = (dto.page - 1) * dto.limit;

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

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.provider', 'provider')
      .leftJoinAndSelect('report.service', 'service')
      .where('report.userId = :userId', { userId })
      .andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });

    if (dto.transaction_type) {
      queryBuilder.andWhere('report.transactionType = :transactionType', {
        transactionType: dto.transaction_type,
      });
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.id', 'DESC')
      .skip(skip)
      .take(dto.limit)
      .getManyAndCount();

    const reportsWithDetails = reports.map((report) => {
      let statusColor = 'warning';
      if (report.status === 'Success') {
        statusColor = 'success';
      } else if (report.status === 'Failed') {
        statusColor = 'danger';
      } else if (report.status === 'Refunded') {
        statusColor = 'secondary';
      }

      return {
        id: report.id,
        transaction_date: report.transactionDate,
        transaction_type: report.transactionType,
        provider_name: (report as any).provider?.providerName || '',
        service_name: (report as any).service?.serviceName || '',
        number: report.number || '',
        order_id: report.orderId,
        amount: Number(report.amount).toFixed(2),
        total_amount: Number(report.totalAmount).toFixed(2),
        commission: Number(report.commission || 0).toFixed(2),
        fund_type: report.fundType,
        status: report.status,
        status_color: statusColor,
        remark: report.remark,
        opening_balance: Number(report.openingBalance || 0).toFixed(2),
        closing_balance: Number(report.closingBalance || 0).toFixed(2),
      };
    });

    return {
      type: 'success',
      message: 'Account reports fetched successfully',
      data: reportsWithDetails,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }
}

