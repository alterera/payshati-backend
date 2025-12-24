import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Report } from '../../../database/entities/report.entity';
import { Scheme } from '../../../database/entities/scheme.entity';
import { SchemeCommission } from '../../../database/entities/scheme-commission.entity';

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Scheme)
    private schemeRepository: Repository<Scheme>,
    @InjectRepository(SchemeCommission)
    private schemeCommissionRepository: Repository<SchemeCommission>,
    private dataSource: DataSource,
  ) {}

  /**
   * Replaces helpers::SetCommission
   * Calculates and distributes multi-level commission
   * Matches Laravel logic: Uses child's scheme_id for all parent commission calculations
   */
  async setCommission(reportId: number): Promise<void> {
    console.log('=== setCommission Started ===');
    console.log('Report ID:', reportId);

    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });

      if (!report) {
        console.error('Report not found:', reportId);
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: report.userId },
      });

      if (!user) {
        console.error('User not found for report:', reportId);
        return;
      }

      // Use child's scheme_id for all parent commission calculations (matches Laravel)
      const schemeId = user.schemeId;
      const reportIdCom = reportId;

      console.log('Commission setup:', {
        userId: user.id,
        parentId: user.parentId,
        schemeId: schemeId,
        reportAmount: report.totalAmount,
        providerId: report.providerId,
      });

      // Level 1 Commission (Direct Parent) - dt_commission
      if (user.parentId !== 0 && user.parentId !== 1) {
        console.log('Processing Level 1 Commission (dt_commission)');
        await this.processCommissionLevel(
          user.parentId,
          report,
          schemeId,
          reportIdCom,
          'dt_commission',
        );
      } else {
        console.log('No parent found or parent is admin (ID 1). Skipping commission.');
      }
    } catch (error: any) {
      console.error('Error in setCommission:', error);
      console.error('Error stack:', error.stack);
      // Don't throw - commission failure shouldn't break the recharge
    }
  }

  private async processCommissionLevel(
    parentId: number,
    report: Report,
    schemeId: number,
    reportIdCom: number,
    commissionField: string,
  ): Promise<void> {
    console.log(`Processing commission level: ${commissionField} for parent: ${parentId}`);

    const parent = await this.userRepository.findOne({
      where: { id: parentId },
    });

    if (!parent || parentId === 1) {
      console.log(`Parent not found or is admin. Skipping ${commissionField}`);
      return;
    }

    // Use child's scheme_id (not parent's) - matches Laravel logic
    const commission = await this.getCommission(
      report.totalAmount,
      schemeId, // Child's scheme_id
      report.providerId,
      parent.roleId,
    );

    console.log(`Commission calculated:`, {
      amount: report.totalAmount,
      schemeId: schemeId,
      providerId: report.providerId,
      parentRoleId: parent.roleId,
      commission: commission,
      field: commissionField,
    });

    if (commission > 0) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const openingBalance = Number(parent.walletBalance);

        // Create commission report
        const commissionReport = this.reportRepository.create({
          userId: parent.id,
          parentId: reportIdCom,
          orderId: report.orderId,
          number: report.number,
          amount: commission,
          totalAmount: report.totalAmount,
          commission: commission,
          fundType: 'Credit',
          transactionType: 'Commission',
          providerId: report.providerId,
          serviceId: report.serviceId,
          apiId: report.apiId,
          remark: `Commission For Rs. ${report.totalAmount} Number ${report.number}`,
          status: 'Success',
          path: report.path,
          ipAddress: report.ipAddress,
          openingBalance: openingBalance,
          transactionDate: new Date().toISOString(),
        });

        // Update parent wallet
        parent.walletBalance = openingBalance + commission;
        await queryRunner.manager.save(parent);

        commissionReport.closingBalance = parent.walletBalance;
        const savedCommissionReport = await queryRunner.manager.save(
          commissionReport,
        );

        // Update original report with commission amount
        await queryRunner.manager.update(
          Report,
          { id: reportIdCom },
          { [commissionField]: commission },
        );

        await queryRunner.commitTransaction();
        console.log(`Level ${commissionField} commission saved successfully. Commission: ${commission}`);

        // Process next level if exists (matches Laravel 4-level hierarchy)
        if (parent.parentId !== 0 && parent.parentId !== 1) {
          if (commissionField === 'dt_commission') {
            console.log('Processing Level 2 Commission (md_commission)');
            await this.processCommissionLevel(
              parent.parentId,
              report,
              schemeId, // Still use child's scheme_id
              savedCommissionReport.id,
              'md_commission',
            );
          } else if (commissionField === 'md_commission') {
            console.log('Processing Level 3 Commission (wt_commission)');
            await this.processCommissionLevel(
              parent.parentId,
              report,
              schemeId, // Still use child's scheme_id
              savedCommissionReport.id,
              'wt_commission',
            );
          }
        } else {
          console.log(`No more parent levels. Commission chain complete for ${commissionField}`);
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }

  /**
   * Replaces helpers::getCommission
   * Calculates commission based on scheme and role
   */
  async getCommission(
    amount: number,
    schemeId: number,
    providerId: number,
    roleId: number,
  ): Promise<number> {
    const scheme = await this.schemeRepository.findOne({
      where: { id: schemeId },
    });

    if (!scheme || scheme.status !== 1) {
      return 0;
    }

    const commissionData = await this.schemeCommissionRepository.findOne({
      where: {
        providerId,
        schemeId,
      },
    });

    if (!commissionData) {
      return 0;
    }

    let commission = 0;

    // Role-based commission calculation
    if (roleId === 3 || roleId === 6) {
      // Retailer
      if (commissionData.rtAmountType === 'Commission Percent') {
        commission = (amount * commissionData.rtAmountValue) / 100;
      } else {
        commission = commissionData.rtAmountValue;
      }
    } else if (roleId === 5) {
      // Distributor
      if (commissionData.dtAmountType === 'Commission Percent') {
        commission = (amount * commissionData.dtAmountValue) / 100;
      } else {
        commission = commissionData.dtAmountValue;
      }
    } else if (roleId === 4) {
      // Master Distributor
      if (commissionData.mdAmountType === 'Commission Percent') {
        commission = (amount * commissionData.mdAmountValue) / 100;
      } else {
        commission = commissionData.mdAmountValue;
      }
    } else if (roleId === 2) {
      // Wholesaler
      if (commissionData.wtAmountType === 'Commission Percent') {
        commission = (amount * commissionData.wtAmountValue) / 100;
      } else {
        commission = commissionData.wtAmountValue;
      }
    }

    return commission || 0;
  }

  /**
   * Replaces helpers::ReverseCommission
   * Reverses commission when a transaction is refunded
   */
  async reverseCommission(reportId: number): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return;
    }

    // Find all commission reports for this order
    const commissionReports = await this.reportRepository.find({
      where: {
        orderId: report.orderId,
        totalAmount: report.totalAmount,
        transactionType: 'Commission',
      },
    });

    for (const commissionReport of commissionReports) {
      const user = await this.userRepository.findOne({
        where: { id: commissionReport.userId },
      });

      if (!user) {
        continue;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const openingBalance = Number(user.walletBalance);

        // Create reverse commission report
        const reverseReport = this.reportRepository.create({
          userId: user.id,
          parentId: commissionReport.id,
          orderId: commissionReport.orderId,
          number: commissionReport.number,
          amount: commissionReport.commission,
          totalAmount: commissionReport.totalAmount,
          commission: commissionReport.commission,
          fundType: 'Debit',
          transactionType: 'Reverse Commission',
          providerId: commissionReport.providerId,
          serviceId: commissionReport.serviceId,
          apiId: commissionReport.apiId,
          remark: `Reverse Commission For Rs. ${commissionReport.totalAmount} Number ${commissionReport.number} Recharge Refunded`,
          status: 'Success',
          path: commissionReport.path,
          ipAddress: commissionReport.ipAddress,
          openingBalance: openingBalance,
          transactionDate: new Date().toISOString(),
        });

        // Debit wallet
        user.walletBalance = openingBalance - Number(commissionReport.commission);
        await queryRunner.manager.save(user);

        reverseReport.closingBalance = user.walletBalance;
        await queryRunner.manager.save(reverseReport);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }
}
