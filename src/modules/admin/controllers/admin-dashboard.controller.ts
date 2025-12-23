import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { Report } from '../../../database/entities/report.entity';
import { User } from '../../../database/entities/user.entity';
import { Complaint } from '../../../database/entities/complaint.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { Service } from '../../../database/entities/service.entity';

@Controller('v1/admin/dashboard')
export class AdminDashboardController {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  @Post('stats')
  @UseGuards(AdminGuard)
  async getDashboardStats(@Body() body: { from_date?: string; to_date?: string }) {
    const fromDate = body.from_date
      ? new Date(`${body.from_date} 00:00:00`)
      : new Date(new Date().setHours(0, 0, 0, 0));
    const toDate = body.to_date
      ? new Date(`${body.to_date} 23:59:59`)
      : new Date(new Date().setHours(23, 59, 59, 999));

    // Recharge stats
    const [successReports, pendingReports, failedReports, refundReports] =
      await Promise.all([
        this.reportRepository.find({
          where: {
            transactionType: 'Recharge',
            status: 'Success',
            createdAt: Between(fromDate, toDate),
          },
        }),
        this.reportRepository.find({
          where: {
            transactionType: 'Recharge',
            status: 'Pending',
            createdAt: Between(fromDate, toDate),
          },
        }),
        this.reportRepository.find({
          where: {
            transactionType: 'Recharge',
            status: 'Failed',
            createdAt: Between(fromDate, toDate),
          },
        }),
        this.reportRepository.find({
          where: {
            transactionType: 'Refund',
            status: 'Success',
            createdAt: Between(fromDate, toDate),
          },
        }),
      ]);

    // Commission stats
    const commissionReports = await this.reportRepository.find({
      where: {
        transactionType: 'Commission',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reverseCommissionReports = await this.reportRepository.find({
      where: {
        transactionType: 'Reverse Commission',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    // Complaints
    const complaints = await this.complaintRepository.find({
      where: {
        status: In(['Open', 'Under Review']),
      },
    });

    // User counts (User entity doesn't have deletedAt column, so we just check status)
    const retailerCount = await this.userRepository.count({
      where: { roleId: 6, status: 1 },
    });

    const retailerBalance = await this.userRepository
      .createQueryBuilder('user')
      .select('SUM(user.walletBalance)', 'total')
      .where('user.roleId = :roleId', { roleId: 6 })
      .andWhere('user.status = :status', { status: 1 })
      .getRawOne();

    const apiPartnerCount = await this.userRepository.count({
      where: { roleId: 3, status: 1 },
    });

    const apiPartnerBalance = await this.userRepository
      .createQueryBuilder('user')
      .select('SUM(user.walletBalance)', 'total')
      .where('user.roleId = :roleId', { roleId: 3 })
      .andWhere('user.status = :status', { status: 1 })
      .getRawOne();

    // Provider-wise sales - simplified query
    const providerSalesRaw = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoin(Provider, 'provider', 'provider.id = report.providerId')
      .leftJoin(Service, 'service', 'service.id = report.serviceId')
      .select('provider.providerName', 'provider_name')
      .addSelect('service.serviceName', 'service_name')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.totalAmount ELSE 0 END)',
        'success_amount',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Failed" THEN report.totalAmount ELSE 0 END)',
        'failed_amount',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Pending" THEN report.totalAmount ELSE 0 END)',
        'pending_amount',
      )
      .addSelect('SUM(report.totalAmount)', 'total_amount')
      .addSelect('COUNT(report.id)', 'total_hit')
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN 1 ELSE 0 END)',
        'success_hit',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Failed" THEN 1 ELSE 0 END)',
        'failed_hit',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Pending" THEN 1 ELSE 0 END)',
        'pending_hit',
      )
      .addSelect(
        'SUM(CASE WHEN report.status = "Success" THEN report.commission ELSE 0 END)',
        'commission',
      )
      .where('report.transactionType IN (:...types)', {
        types: ['Recharge', 'Bill Pay'],
      })
      .andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      })
      .groupBy('report.providerId')
      .addGroupBy('report.serviceId')
      .getRawMany();

    const providerSales = providerSalesRaw.map((sale) => ({
      provider_name: sale.provider_name || 'Unknown',
      service_name: sale.service_name || 'Unknown',
      success_amount: sale.success_amount || '0',
      failed_amount: sale.failed_amount || '0',
      pending_amount: sale.pending_amount || '0',
      total_amount: sale.total_amount || '0',
      total_hit: sale.total_hit || '0',
      success_hit: sale.success_hit || '0',
      failed_hit: sale.failed_hit || '0',
      pending_hit: sale.pending_hit || '0',
      commission: sale.commission || '0',
    }));

    return {
      type: 'success',
      message: 'Dashboard stats fetched successfully',
      data: {
        recharge: {
          success: {
            amount: successReports.reduce((sum, r) => sum + Number(r.totalAmount), 0),
            hit: successReports.length,
          },
          pending: {
            amount: pendingReports.reduce((sum, r) => sum + Number(r.totalAmount), 0),
            hit: pendingReports.length,
          },
          failed: {
            amount: failedReports.reduce((sum, r) => sum + Number(r.totalAmount), 0),
            hit: failedReports.length,
          },
          refund: {
            amount: refundReports.reduce((sum, r) => sum + Number(r.totalAmount), 0),
            hit: refundReports.length,
          },
        },
        commission: {
          total:
            commissionReports.reduce((sum, r) => sum + Number(r.amount || 0), 0) -
            reverseCommissionReports.reduce((sum, r) => sum + Number(r.amount || 0), 0),
        },
        complaints: {
          count: complaints.length,
        },
        users: {
          retailer: {
            count: retailerCount,
            total_balance: parseFloat(retailerBalance?.total || '0'),
          },
          api_partner: {
            count: apiPartnerCount,
            total_balance: parseFloat(apiPartnerBalance?.total || '0'),
          },
        },
        provider_sales: providerSales,
      },
    };
  }

  @Post('load-wallet')
  @UseGuards(AdminGuard)
  async loadWallet(@Body() body: { amount: number; remark: string }) {
    // Load wallet for admin user (id: 1)
    const admin = await this.userRepository.findOne({
      where: { id: 1, roleId: 1 },
    });

    if (!admin) {
      return {
        type: 'error',
        message: 'Admin user not found',
      };
    }

    const orderId = `FND${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create report entry
    const report = this.reportRepository.create({
      userId: admin.id,
      creditUserId: 1,
      debitUserId: 0,
      amount: body.amount,
      totalAmount: body.amount,
      fundType: 'Credit',
      transactionType: 'Self Money',
      remark: body.remark,
      orderId,
      status: 'Success',
      openingBalance: admin.walletBalance,
      closingBalance: admin.walletBalance + body.amount,
      transactionDate: new Date().toISOString(),
    });

    await this.reportRepository.save(report);

    // Update admin wallet
    admin.walletBalance = admin.walletBalance + body.amount;
    await this.userRepository.save(admin);

    return {
      type: 'success',
      message: 'Wallet loaded successfully',
      data: {
        order_id: orderId,
        new_balance: admin.walletBalance,
      },
    };
  }

  @Post('topbar-count')
  @UseGuards(AdminGuard)
  async getTopbarCount() {
    const pendingRecharges = await this.reportRepository.count({
      where: {
        transactionType: 'Recharge',
        status: 'Pending',
      },
    });

    const complaints = await this.complaintRepository.count({
      where: {
        status: In(['Open', 'Under Review']),
      },
    });

    return {
      type: 'success',
      message: 'Topbar count fetched successfully',
      data: {
        pending: pendingRecharges,
        complaint: complaints,
      },
    };
  }
}
