import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUserGuard } from '../guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import { Report } from '../../../database/entities/report.entity';
import { Company } from '../../../database/entities/company.entity';
import { Announcement } from '../../../database/entities/announcement.entity';
import { Slider } from '../../../database/entities/slider.entity';
import { Complaint } from '../../../database/entities/complaint.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { Service } from '../../../database/entities/service.entity';
import { SchemeCommission } from '../../../database/entities/scheme-commission.entity';
import { In, Between, IsNull } from 'typeorm';

@Controller('v1')
export class HomeController {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(SchemeCommission)
    private schemeCommissionRepository: Repository<SchemeCommission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('home')
  @UseGuards(AppUserGuard)
  async homeData(@CurrentUser() user: User, @Body() body: any) {
    const today = new Date();
    const fromDate = new Date(today.setHours(0, 0, 0, 0));
    const toDate = new Date(today.setHours(23, 59, 59, 999));

    const reportSuccess = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Recharge',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportPending = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Recharge',
        status: 'Pending',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportFailed = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Recharge',
        status: 'Failed',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportRefund = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Refund',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportReceiveMoney = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Receive Money',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportUpiAddMoney = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Upi Add Money',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const transactionReports = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Recharge',
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const fundReports = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: In(['Transfer Money', 'Receive Money', 'Self Money', 'Money Reverse', 'Reverse Money']),
      },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const reportSuccessCommission = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Recharge',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportPendingCommission = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Recharge',
        status: 'Pending',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportParentCommission = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Commission',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const reportParentReverseCommission = await this.reportRepository.find({
      where: {
        userId: user.id,
        transactionType: 'Reverse Commission',
        status: 'Success',
        createdAt: Between(fromDate, toDate),
      },
    });

    const totalComplaintsCount = await this.complaintRepository.count({
      where: {
        userId: user.id,
        status: In(['Open', 'Under Review']),
      },
    });

    const dayBook = {
      rc_success_amount: reportSuccess.reduce((sum, r) => sum + Number(r.totalAmount), 0),
      rc_success_hit: reportSuccess.length,
      rc_pending_amount: reportPending.reduce((sum, r) => sum + Number(r.totalAmount), 0),
      rc_pending_hit: reportPending.length,
      rc_failed_amount: reportFailed.reduce((sum, r) => sum + Number(r.totalAmount), 0),
      rc_failed_hit: reportFailed.length,
      rc_refund_amount: reportRefund.reduce((sum, r) => sum + Number(r.totalAmount), 0),
      rc_refund_hit: reportRefund.length,
      rc_receive_money: reportReceiveMoney.reduce((sum, r) => sum + Number(r.totalAmount), 0) +
        reportUpiAddMoney.reduce((sum, r) => sum + Number(r.totalAmount), 0),
      rc_commission:
        reportSuccessCommission.reduce((sum, r) => sum + Number(r.commission || 0), 0) +
        reportPendingCommission.reduce((sum, r) => sum + Number(r.commission || 0), 0) +
        reportParentCommission.reduce((sum, r) => sum + Number(r.amount || 0), 0) +
        reportParentReverseCommission.reduce((sum, r) => sum + Number(r.amount || 0), 0),
      rc_complaint_hit: totalComplaintsCount,
    };

    const company = await this.companyRepository.findOne({
      where: { status: 1 },
    });

    const companyData = company
      ? {
          domain: company.domain,
          company_name: company.companyName,
          support_number: company.supportNumber,
          support_number_2: company.supportNumber2,
          support_email: company.supportEmail,
          refund_policy: company.refundPolicy,
          terms_and_conditions: company.termsAndConditions,
          privacy_policy: company.privacyPolicy,
          company_address: company.companyAddress,
        }
      : {};

    // Parse ADMIN_HOST - take first value if multiple provided
    const adminHost = process.env.ADMIN_HOST
      ? process.env.ADMIN_HOST.split(',')[0].trim()
      : 'http://localhost:3000';

    return {
      name: `${user.firstName} ${user.lastName}`,
      admin_url: `${adminHost}/admin`,
      day_book: dayBook,
      company_data: companyData,
      type: 'success',
      message: 'Fetch Successfully',
      wallet_balance: Number(user.walletBalance).toFixed(2),
      shop_name: user.outletName,
      mobile: user.mobileNumber,
      email: user.emailAddress,
      profile: `${adminHost}/profile_pic/${user.profilePic}`,
      announcement: '', // TODO: Fetch from announcements table
      sliders: [], // TODO: Fetch from sliders table
      parent_id: user.parentId,
      whatsapp: 'whatsapp://send/?phone=+919337692413&text=Hii',
    };
  }

  @Post('my-profile')
  @UseGuards(AppUserGuard)
  async myProfile(@CurrentUser() user: User) {
    return {
      type: 'success',
      message: 'Fetch Successfully.',
      data: {
        user_id: user.id,
        first_name: user.firstName,
        middle_name: user.middleName,
        last_name: user.lastName,
        mobile_number: user.mobileNumber,
        email_address: user.emailAddress,
        profile_pic: user.profilePic,
        state: user.state,
        city: user.city,
        outlet_name: user.outletName,
      },
    };
  }

  @Post('my-commission')
  @UseGuards(AppUserGuard)
  async myCommission(
    @CurrentUser() user: User,
    @Body() body: { page?: number; limit?: number; service_id?: number },
  ) {
    const page = body.page || 1;
    const limit = Math.min(body.limit || 10, 50);
    const skip = (page - 1) * limit;

    const queryBuilder = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoin(
        'scheme_commissions',
        'sc',
        'sc.provider_id = provider.id AND sc.scheme_id = :schemeId',
        { schemeId: user.schemeId },
      )
      .leftJoin('services', 'service', 'service.id = provider.service_id')
      .select([
        'provider.id as provider_id',
        'provider.provider_name as provider_providerName',
        'provider.status as provider_status',
        'service.service_name as service_serviceName',
        'sc.rt_amount_type as sc_rtAmountType',
        'sc.rt_amount_value as sc_rtAmountValue',
        'sc.dt_amount_type as sc_dtAmountType',
        'sc.dt_amount_value as sc_dtAmountValue',
        'sc.md_amount_type as sc_mdAmountType',
        'sc.md_amount_value as sc_mdAmountValue',
        'sc.wt_amount_type as sc_wtAmountType',
        'sc.wt_amount_value as sc_wtAmountValue',
      ])
      .where('provider.deleted_at IS NULL')
      .andWhere('provider.status = :status', { status: 1 });

    if (body.service_id) {
      queryBuilder.andWhere('provider.service_id = :serviceId', {
        serviceId: body.service_id,
      });
    }

    const total = await queryBuilder.getCount();
    const providers = await queryBuilder
      .orderBy('provider.id', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany();

    const commissionData = providers.map((provider: any) => {
      let amountType = '';
      let amountValue = 0;

      if (user.roleId === 6 || user.roleId === 3) {
        amountType = provider.sc_rtAmountType || '';
        amountValue = Number(provider.sc_rtAmountValue || 0);
      } else if (user.roleId === 5) {
        amountType = provider.sc_dtAmountType || '';
        amountValue = Number(provider.sc_dtAmountValue || 0);
      } else if (user.roleId === 4) {
        amountType = provider.sc_mdAmountType || '';
        amountValue = Number(provider.sc_mdAmountValue || 0);
      } else if (user.roleId === 2) {
        amountType = provider.sc_wtAmountType || '';
        amountValue = Number(provider.sc_wtAmountValue || 0);
      }

      return {
        id: provider.provider_id,
        provider_name: provider.provider_providerName,
        service_name: provider.service_serviceName || '',
        provider_code: provider.provider_id,
        amount_type: amountType,
        amount_value: amountValue.toFixed(2),
        minium_amount: '0',
        maxium_amount: '999999',
        status: provider.provider_status === 1 ? 'ONLINE' : 'OFFLINE',
        status_color: provider.provider_status === 1 ? 'success' : 'danger',
      };
    });

    return {
      type: 'success',
      message: 'Commission fetched successfully',
      data: commissionData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Post('generate-api-key')
  @UseGuards(AppUserGuard)
  async generateApiKey(@CurrentUser() user: User) {
    const apiKey =
      Math.random().toString(36).substring(2, 17) +
      Math.floor(10000000 + Math.random() * 90000000) +
      user.id +
      Math.random().toString(36).substring(2, 17);

    user.apiKey = apiKey;
    await this.userRepository.save(user);

    return {
      type: 'success',
      message: 'Api Key Generate Successfully.',
      data: {
        api_key: apiKey,
      },
    };
  }
}
