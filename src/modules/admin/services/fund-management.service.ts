import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, IsNull } from 'typeorm';
import { DataSource } from 'typeorm';
import { FundRequest } from '../../../database/entities/fund-request.entity';
import { User } from '../../../database/entities/user.entity';
import { Report } from '../../../database/entities/report.entity';
import { Bank } from '../../../database/entities/bank.entity';
import {
  ListFundRequestDto,
  UpdateFundRequestDto,
  SearchUserDto,
} from '../dto/fund-management.dto';

@Injectable()
export class FundManagementService {
  constructor(
    @InjectRepository(FundRequest)
    private fundRequestRepository: Repository<FundRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
    private dataSource: DataSource,
  ) {}

  async listFundRequests(listDto: ListFundRequestDto) {
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

    const queryBuilder = this.fundRequestRepository.createQueryBuilder('fr');

    queryBuilder.where('fr.requestTo = :requestTo', { requestTo: 1 });
    queryBuilder.andWhere('fr.createdAt BETWEEN :fromDate AND :toDate', {
      fromDate,
      toDate,
    });

    if (listDto.user_id && listDto.user_id !== 0) {
      queryBuilder.andWhere('fr.userId = :userId', { userId: listDto.user_id });
    }

    if (listDto.order_id) {
      queryBuilder.andWhere('fr.orderId LIKE :orderId', {
        orderId: `%${listDto.order_id}%`,
      });
    }

    if (listDto.status && listDto.status !== 'All') {
      queryBuilder.andWhere('fr.status = :status', { status: listDto.status });
    }

    if (listDto.path) {
      queryBuilder.andWhere('fr.upi LIKE :upi', { upi: `%${listDto.path}%` });
    }

    const [requests, total] = await queryBuilder
      .orderBy('fr.id', 'DESC')
      .skip(skip)
      .take(listDto.limit)
      .getManyAndCount();

    // Calculate summary stats
    const whereCondition: any = {
      requestTo: 1,
      createdAt: Between(fromDate, toDate),
    };
    if (listDto.path) {
      whereCondition.upi = Like(`%${listDto.path}%`);
    }
    const allRequests = await this.fundRequestRepository.find({
      where: whereCondition,
    });

    const transferred = allRequests.filter((r) => r.status === 'Transferred');
    const pending = allRequests.filter((r) => r.status === 'Pending');
    const rejected = allRequests.filter((r) => r.status === 'Rejected');

    return {
      type: 'success',
      message: 'Fund requests fetched successfully',
      data: requests,
      summary: {
        transferred: {
          amount: transferred.reduce((sum, r) => sum + Number(r.amount), 0),
          count: transferred.length,
        },
        pending: {
          amount: pending.reduce((sum, r) => sum + Number(r.amount), 0),
          count: pending.length,
        },
        rejected: {
          amount: rejected.reduce((sum, r) => sum + Number(r.amount), 0),
          count: rejected.length,
        },
        total: {
          amount: allRequests.reduce((sum, r) => sum + Number(r.amount), 0),
          count: allRequests.length,
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

  async searchUser(searchDto: SearchUserDto) {
    const users = await this.userRepository.find({
      where: {
        mobileNumber: Like(`%${searchDto.keyword}%`),
      },
      select: ['id', 'firstName', 'middleName', 'lastName', 'outletName', 'mobileNumber'],
      take: 10,
    });

    return {
      type: 'success',
      message: 'Users fetched successfully',
      data: { users },
    };
  }

  async updateFundRequest(updateDto: UpdateFundRequestDto, adminUserId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const adminUser = await this.userRepository.findOne({
        where: { id: adminUserId },
      });

      if (!adminUser) {
        throw new BadRequestException({
          type: 'error',
          message: 'Admin user not found',
        });
      }

      const fundRequest = await this.fundRequestRepository.findOne({
        where: { id: updateDto.edit_id },
      });

      if (!fundRequest) {
        throw new BadRequestException({
          type: 'error',
          message: 'Fund request not found',
        });
      }

      if (updateDto.status === 'Approved') {
        if (Number(adminUser.walletBalance) < Number(fundRequest.amount)) {
          throw new BadRequestException({
            type: 'error',
            message: 'You have insufficient wallet balance',
          });
        }

        const targetUser = await this.userRepository.findOne({
          where: { id: fundRequest.userId },
        });

        if (!targetUser) {
          throw new BadRequestException({
            type: 'error',
            message: 'Target user not found',
          });
        }

        const orderId = fundRequest.orderId;

        // Debit from admin
        const adminOpeningBalance = Number(adminUser.walletBalance);
        adminUser.walletBalance = adminOpeningBalance - Number(fundRequest.amount);
        await queryRunner.manager.save(adminUser);

        const adminReport = this.reportRepository.create({
          userId: adminUser.id,
          creditUserId: 0,
          debitUserId: fundRequest.userId,
          amount: fundRequest.amount,
          totalAmount: fundRequest.amount,
          fundType: 'Debit',
          transactionType: 'Transfer Money',
          remark: updateDto.remark,
          status: 'Success',
          orderId,
          openingBalance: adminOpeningBalance,
          closingBalance: adminUser.walletBalance,
          transactionDate: new Date().toISOString(),
        });
        await queryRunner.manager.save(adminReport);

        // Credit to target user
        const targetOpeningBalance = Number(targetUser.walletBalance);
        targetUser.walletBalance = targetOpeningBalance + Number(fundRequest.amount);
        await queryRunner.manager.save(targetUser);

        const targetReport = this.reportRepository.create({
          userId: targetUser.id,
          creditUserId: adminUser.id,
          debitUserId: 0,
          amount: fundRequest.amount,
          totalAmount: fundRequest.amount,
          fundType: 'Credit',
          transactionType: 'Receive Money',
          remark: updateDto.remark,
          status: 'Success',
          orderId,
          openingBalance: targetOpeningBalance,
          closingBalance: targetUser.walletBalance,
          transactionDate: new Date().toISOString(),
        });
        await queryRunner.manager.save(targetReport);

        // Update fund request status
        fundRequest.status = 'Transferred';
        fundRequest.decisionBy = adminUserId;
        fundRequest.decisionRemark = updateDto.remark;
        fundRequest.decisionDate = new Date().toISOString();
        await queryRunner.manager.save(fundRequest);

        await queryRunner.commitTransaction();

        return {
          type: 'success',
          message: 'Fund request approved successfully',
        };
      } else {
        // Rejected
        fundRequest.status = 'Rejected';
        fundRequest.decisionBy = adminUserId;
        fundRequest.decisionRemark = updateDto.remark;
        fundRequest.decisionDate = new Date().toISOString();
        await queryRunner.manager.save(fundRequest);

        await queryRunner.commitTransaction();

        return {
          type: 'success',
          message: 'Fund request rejected successfully',
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Failed to update fund request',
      });
    } finally {
      await queryRunner.release();
    }
  }
}
