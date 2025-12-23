import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { FundRequest } from '../../../database/entities/fund-request.entity';
import { User } from '../../../database/entities/user.entity';
import { Bank } from '../../../database/entities/bank.entity';
import {
  SubmitFundRequestDto,
  ListFundRequestDto,
} from '../dto/fund-request.dto';

@Injectable()
export class FundRequestService {
  constructor(
    @InjectRepository(FundRequest)
    private fundRequestRepository: Repository<FundRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
  ) {}

  async submitFundRequest(userId: number, dto: SubmitFundRequestDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    if (user.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'Account Not Active. Contact To Admin',
      });
    }

    const bank = await this.bankRepository.findOne({
      where: { id: dto.bank_id, userId: user.parentId },
    });

    if (!bank) {
      throw new BadRequestException({
        type: 'error',
        message: 'Bank not found',
      });
    }

    const orderId = `FND${Date.now()}${Math.floor(Math.random() * 1000000)}`;

    const fundRequest = this.fundRequestRepository.create({
      userId: user.id,
      requestTo: user.parentId,
      bankId: dto.bank_id,
      amount: dto.amount,
      requestDate: new Date().toISOString(),
      status: 'Pending',
      transferMode: dto.transfer_mode,
      transactionNumber: dto.transaction_number,
      remark: dto.remark,
      slipImage: dto.slip_image || 'slip_image.png',
      orderId: orderId,
      upi: dto.transfer_mode === 'UPI' ? 2 : 1,
    });

    await this.fundRequestRepository.save(fundRequest);

    return {
      type: 'success',
      message: 'Fund request submitted successfully',
      data: {
        order_id: orderId,
        amount: dto.amount,
      },
    };
  }

  async listFundRequests(userId: number, dto: ListFundRequestDto) {
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

    const queryBuilder = this.fundRequestRepository
      .createQueryBuilder('fundRequest')
      .where('fundRequest.userId = :userId', { userId })
      .andWhere('fundRequest.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });

    const [fundRequests, total] = await queryBuilder
      .orderBy('fundRequest.id', 'DESC')
      .skip(skip)
      .take(dto.limit)
      .getManyAndCount();

    const requestsWithDetails = await Promise.all(
      fundRequests.map(async (request) => {
        let statusColor = 'warning';
        if (request.status === 'Transferred') {
          statusColor = 'success';
        } else if (request.status === 'Rejected') {
          statusColor = 'danger';
        }

        const user = await this.userRepository.findOne({
          where: { id: request.userId },
        });

        const bank = request.bankId
          ? await this.bankRepository.findOne({
              where: { id: request.bankId },
            })
          : null;

        const decisionByUser = request.decisionBy
          ? await this.userRepository.findOne({
              where: { id: request.decisionBy },
            })
          : null;

        return {
          id: request.id,
          request_date: request.requestDate,
          order_id: request.orderId,
          transaction_number: request.transactionNumber,
          transfer_mode: request.transferMode,
          slip_image: request.slipImage,
          user_name: user
            ? `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim()
            : '',
          outlet_name: user?.outletName || '',
          mobile_number: user?.mobileNumber || '',
          account_name: bank?.accountName || '',
          account_number: bank?.accountNumber || '',
          bank_name: bank?.bankName || '',
          account_type: bank?.accountType || '',
          decision_name: decisionByUser
            ? `${decisionByUser.firstName || ''} ${decisionByUser.middleName || ''} ${decisionByUser.lastName || ''}`.trim()
            : '',
          decision_remark: request.decisionRemark || '',
          decision_date: request.decisionDate || '',
          remark: request.remark,
          amount: Number(request.amount).toFixed(2),
          status: request.status,
          status_color: statusColor,
        };
      }),
    );

    return {
      type: 'success',
      message: 'Fund requests fetched successfully',
      data: requestsWithDetails,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getBanks(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    if (user.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'Account Not Active. Contact To Admin',
      });
    }

    const banks = await this.bankRepository.find({
      where: { userId: user.parentId, deletedAt: IsNull() },
      order: { id: 'DESC' },
    });

    return {
      type: 'success',
      message: 'Banks fetched successfully',
      data: banks.map((bank) => ({
        id: bank.id,
        bank_name: bank.bankName,
        account_name: bank.accountName,
        account_number: bank.accountNumber,
        bank_branch: bank.bankBranch,
        ifsc_code: bank.ifscCode,
        account_type: bank.accountType,
        bank_logo: bank.bankLogo,
      })),
    };
  }
}

