import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class TransactionHelper {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Process refund for a failed transaction
   * Creates a credit transaction and updates user wallet balance
   */
  async refundRow(reportId: number): Promise<number> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: report.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const openingBalance = user.walletBalance;

    // Create refund transaction
    const refundReport = this.reportRepository.create({
      userId: user.id,
      parentId: report.id,
      orderId: report.orderId,
      number: report.number,
      amount: report.amount,
      totalAmount: report.totalAmount,
      adminCommission: report.adminCommission,
      apiCommission: report.apiCommission,
      commission: report.commission,
      fundType: 'Credit',
      transactionType: 'Refund',
      providerId: report.providerId,
      serviceId: report.serviceId,
      apiId: report.apiId,
      remark: `Refund For Rs. ${report.totalAmount} Number ${report.number}`,
      status: 'Success',
      path: report.path,
      ipAddress: report.ipAddress,
      openingBalance: openingBalance,
    });

    // Update user wallet balance
    user.walletBalance = Number(user.walletBalance) + Number(report.amount);
    await this.userRepository.save(user);

    refundReport.closingBalance = user.walletBalance;
    refundReport.transactionDate = `${new Date().toISOString()}:${Math.floor(111 + Math.random() * 888)}`;

    const savedReport = await this.reportRepository.save(refundReport);
    return savedReport.id;
  }

  /**
   * Update user wallet balance atomically
   */
  async updateWalletBalance(
    userId: number,
    amount: number,
    operation: 'credit' | 'debit',
  ): Promise<{ success: boolean; newBalance: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const currentBalance = Number(user.walletBalance);
      const newBalance =
        operation === 'credit'
          ? currentBalance + Number(amount)
          : currentBalance - Number(amount);

      if (operation === 'debit' && newBalance < 0) {
        throw new Error('Insufficient wallet balance');
      }

      user.walletBalance = newBalance;
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      return { success: true, newBalance };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
