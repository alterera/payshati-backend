import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Report } from '../../../database/entities/report.entity';
import { TransactionHelper } from '../../../common/helpers/transaction.helper';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private transactionHelper: TransactionHelper,
    private dataSource: DataSource,
  ) {}

  async addMoney(userId: number, amount: number, orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new BadRequestException({
          type: 'error',
          message: 'User not found',
        });
      }

      const openingBalance = Number(user.walletBalance);
      const newBalance = openingBalance + Number(amount);

      user.walletBalance = newBalance;
      await queryRunner.manager.save(user);

      const report = this.reportRepository.create({
        userId: user.id,
        creditUserId: 0,
        debitUserId: 0,
        amount: amount,
        totalAmount: amount,
        fundType: 'Credit',
        transactionType: 'Upi Add Money',
        remark: `Add Money Rs. ${amount}`,
        status: 'Success',
        orderId: orderId,
        openingBalance: openingBalance,
        closingBalance: newBalance,
        transactionDate: new Date().toISOString(),
      });

      await queryRunner.manager.save(report);
      await queryRunner.commitTransaction();

      return {
        type: 'success',
        message: 'Money added successfully',
        data: {
          order_id: orderId,
          amount: amount,
          balance: newBalance,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transferFund(
    fromUserId: number,
    toUserId: number,
    amount: number,
    remark: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromUser = await queryRunner.manager.findOne(User, {
        where: { id: fromUserId },
        lock: { mode: 'pessimistic_write' },
      });

      const toUser = await queryRunner.manager.findOne(User, {
        where: { id: toUserId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromUser || !toUser) {
        throw new BadRequestException({
          type: 'error',
          message: 'User not found',
        });
      }

      if (Number(fromUser.walletBalance) < Number(amount)) {
        throw new BadRequestException({
          type: 'error',
          message: 'You Have Insufficient your Wallet Balance',
        });
      }

      const fromOpeningBalance = Number(fromUser.walletBalance);
      const toOpeningBalance = Number(toUser.walletBalance);

      fromUser.walletBalance = fromOpeningBalance - Number(amount);
      toUser.walletBalance = toOpeningBalance + Number(amount);

      await queryRunner.manager.save(fromUser);
      await queryRunner.manager.save(toUser);

      const orderId = `FND${Math.floor(10000000000 + Math.random() * 90000000000)}`;

      // Debit transaction for sender
      const debitReport = this.reportRepository.create({
        userId: fromUserId,
        creditUserId: 0,
        debitUserId: toUserId,
        amount: amount,
        totalAmount: amount,
        fundType: 'Debit',
        transactionType: 'Transfer Money',
        remark: remark,
        status: 'Success',
        orderId: orderId,
        openingBalance: fromOpeningBalance,
        closingBalance: fromUser.walletBalance,
        transactionDate: new Date().toISOString(),
      });

      // Credit transaction for receiver
      const creditReport = this.reportRepository.create({
        userId: toUserId,
        creditUserId: fromUserId,
        debitUserId: 0,
        amount: amount,
        totalAmount: amount,
        fundType: 'Credit',
        transactionType: 'Receive Money',
        remark: remark,
        status: 'Success',
        orderId: orderId,
        openingBalance: toOpeningBalance,
        closingBalance: toUser.walletBalance,
        transactionDate: new Date().toISOString(),
      });

      await queryRunner.manager.save(debitReport);
      await queryRunner.manager.save(creditReport);
      await queryRunner.commitTransaction();

      return {
        type: 'success',
        message: 'Fund transferred successfully',
        data: {
          order_id: orderId,
          amount: amount,
          from_balance: fromUser.walletBalance,
          to_balance: toUser.walletBalance,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWalletBalance(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    return {
      type: 'success',
      message: 'Balance fetched successfully',
      data: {
        wallet_balance: Number(user.walletBalance).toFixed(2),
      },
    };
  }
}
