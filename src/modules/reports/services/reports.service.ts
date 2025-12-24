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
    console.log('=== getRechargeReports Started ===');
    console.log('User ID:', userId);
    console.log('DTO:', JSON.stringify(dto, null, 2));

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        console.error('User not found:', userId);
        throw new BadRequestException({
          type: 'error',
          message: 'User not found',
        });
      }

      console.log('User found:', { id: user.id, roleId: user.roleId });

      const skip = (dto.page - 1) * dto.limit;

      let fromDate: Date;
      let toDate: Date;

      if (dto.from_date && dto.to_date) {
        fromDate = new Date(`${dto.from_date} 00:00:00`);
        toDate = new Date(`${dto.to_date} 23:59:59`);
      } else {
        const today = new Date();
        fromDate = new Date(today);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
      }

      console.log('Date Range:', { fromDate, toDate });

      const queryBuilder = this.reportRepository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.provider', 'provider')
        .leftJoinAndSelect('report.service', 'service')
        .where('report.userId = :userId', { userId })
        .andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
          fromDate,
          toDate,
        });

      // Filter by transaction type based on user role (matching Laravel logic)
      if (user.roleId === 6 || user.roleId === 3) {
        queryBuilder.andWhere('report.transactionType IN (:...types)', {
          types: ['Recharge'],
        });
        console.log('Filtering for Recharge transactions (role 6 or 3)');
      } else {
        queryBuilder.andWhere('report.transactionType IN (:...types)', {
          types: ['Commission'],
        });
        console.log('Filtering for Commission transactions (other roles)');
      }

      if (dto.order_id) {
        queryBuilder.andWhere('report.orderId = :orderId', {
          orderId: dto.order_id,
        });
        console.log('Filtering by order_id:', dto.order_id);
      }

      if (dto.number) {
        queryBuilder.andWhere('report.number = :number', { number: dto.number });
        console.log('Filtering by number:', dto.number);
      }

      if (dto.req_order_id) {
        queryBuilder.andWhere('report.apiPartnerOrderId = :reqOrderId', {
          reqOrderId: dto.req_order_id,
        });
        console.log('Filtering by req_order_id:', dto.req_order_id);
      }

      console.log('Executing query...');
      const [reports, total] = await queryBuilder
        .orderBy('report.id', 'DESC')
        .skip(skip)
        .take(dto.limit)
        .getManyAndCount();

      console.log('Query executed. Found:', { reportsCount: reports.length, total });

      console.log('Processing reports with details...');
      const reportsWithDetails = await Promise.all(
        reports.map(async (report) => {
          let stateName = 'No State';
          if (report.stateId) {
            try {
              const state = await this.stateRepository.findOne({
                where: { id: report.stateId },
              });
              if (state) {
                stateName = state.stateName;
              }
            } catch (error) {
              console.error('Error fetching state:', error);
            }
          }

          // For recharge reports, get amount from the original recharge transaction
          // (not from commission transaction)
          let amount = Number(report.amount).toFixed(2);
          if (user.roleId !== 6 && user.roleId !== 3) {
            // For commission transactions, get the original recharge amount
            const originalReport = await this.reportRepository.findOne({
              where: { orderId: report.orderId, transactionType: 'Recharge' },
            });
            if (originalReport) {
              amount = Number(originalReport.amount).toFixed(2);
            }
          }

          return {
            id: report.id,
            transaction_date: report.transactionDate || report.createdAt?.toISOString() || '',
            number: report.number || '',
            provider_name: (report as any).provider?.providerName || '',
            state_name: stateName,
            service_name: (report as any).service?.serviceName || '',
            path: report.path || '',
            order_id: report.orderId || '',
            request_order_id: report.apiPartnerOrderId || '',
            operator_id: report.operatorId || '',
            status: report.status || 'Pending',
            total_amount: Number(report.totalAmount).toFixed(2),
            amount: amount,
            commission: Number(report.commission || 0).toFixed(2),
          };
        }),
      );

      console.log('Reports processed. Returning response.');
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
    } catch (error: any) {
      console.error('Error in getRechargeReports:', error);
      console.error('Error stack:', error.stack);
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Failed to fetch recharge reports',
      });
    }
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
    console.log('=== getAccountReports Started ===');
    console.log('User ID:', userId);
    console.log('DTO:', JSON.stringify(dto, null, 2));

    try {
      const skip = (dto.page - 1) * dto.limit;

      let fromDate: Date;
      let toDate: Date;

      if (dto.from_date && dto.to_date) {
        fromDate = new Date(`${dto.from_date} 00:00:00`);
        toDate = new Date(`${dto.to_date} 23:59:59`);
      } else {
        const today = new Date();
        fromDate = new Date(today);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
      }

      console.log('Date Range:', { fromDate, toDate });

      const queryBuilder = this.reportRepository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.provider', 'provider')
        .leftJoinAndSelect('report.service', 'service')
        .where('report.userId = :userId', { userId })
        .andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
          fromDate,
          toDate,
        });

      // Match Laravel logic: use LIKE for partial matching
      if (dto.transaction_type) {
        queryBuilder.andWhere('report.transactionType LIKE :transactionType', {
          transactionType: `%${dto.transaction_type}%`,
        });
        console.log('Filtering by transaction_type:', dto.transaction_type);
      }

      console.log('Executing query...');
      const [reports, total] = await queryBuilder
        .orderBy('report.id', 'DESC')
        .skip(skip)
        .take(dto.limit)
        .getManyAndCount();

      console.log('Query executed. Found:', { reportsCount: reports.length, total });

      console.log('Processing reports with details...');
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
          transaction_date: report.transactionDate || report.createdAt?.toISOString() || '',
          transaction_type: report.transactionType || '',
          provider_name: (report as any).provider?.providerName || '',
          service_name: (report as any).service?.serviceName || '',
          number: report.number || '',
          order_id: report.orderId || '',
          amount: Number(report.amount).toFixed(2),
          total_amount: Number(report.totalAmount).toFixed(2),
          commission: Number(report.commission || 0).toFixed(2),
          fund_type: report.fundType || '',
          status: report.status || 'Pending',
          status_color: statusColor,
          remark: report.remark || '',
          opening_balance: Number(report.openingBalance || 0).toFixed(2),
          closing_balance: Number(report.closingBalance || 0).toFixed(2),
        };
      });

      console.log('Reports processed. Returning response.');
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
    } catch (error: any) {
      console.error('Error in getAccountReports:', error);
      console.error('Error stack:', error.stack);
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Failed to fetch account reports',
      });
    }
  }
}

