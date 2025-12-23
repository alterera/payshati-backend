import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, IsNull } from 'typeorm';
import { Report } from '../../../database/entities/report.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { Api } from '../../../database/entities/api.entity';
import { Complaint } from '../../../database/entities/complaint.entity';
import {
  ListRechargeReportDto,
  ChangeOperatorIdDto,
  UpdateStatusDto,
} from '../dto/reports.dto';

@Injectable()
export class RechargeReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
  ) {}

  async listRechargeReports(listDto: ListRechargeReportDto) {
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

    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    queryBuilder.where('report.transactionType = :trType', { trType: 'Recharge' });
    queryBuilder.andWhere('report.createdAt BETWEEN :fromDate AND :toDate', {
      fromDate,
      toDate,
    });

    if (listDto.user_id && listDto.user_id !== 0) {
      queryBuilder.andWhere('report.userId = :userId', { userId: listDto.user_id });
    }

    if (listDto.order_id) {
      queryBuilder.andWhere('report.orderId LIKE :orderId', {
        orderId: `%${listDto.order_id}%`,
      });
    }

    if (listDto.number) {
      queryBuilder.andWhere('report.number LIKE :number', {
        number: `%${listDto.number}%`,
      });
    }

    if (listDto.service_id) {
      queryBuilder.andWhere('report.serviceId = :serviceId', {
        serviceId: listDto.service_id,
      });
    }

    if (listDto.provider_id) {
      queryBuilder.andWhere('report.providerId = :providerId', {
        providerId: listDto.provider_id,
      });
    }

    if (listDto.api_id) {
      queryBuilder.andWhere('report.apiId = :apiId', { apiId: listDto.api_id });
    }

    if (listDto.status && listDto.status !== 'All') {
      queryBuilder.andWhere('report.status = :status', { status: listDto.status });
    }

    if (listDto.complaint_id && listDto.complaint_id !== 'All') {
      if (listDto.complaint_id === '0') {
        queryBuilder.andWhere('report.id NOT IN (SELECT reportId FROM complaints)');
      } else {
        queryBuilder.andWhere('report.id IN (SELECT reportId FROM complaints WHERE id = :complaintId)', {
          complaintId: listDto.complaint_id,
        });
      }
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.id', 'DESC')
      .skip(skip)
      .take(listDto.limit)
      .getManyAndCount();

    // Calculate summary stats
    const allReports = await this.reportRepository.find({
      where: {
        transactionType: 'Recharge',
        createdAt: Between(fromDate, toDate),
      },
    });

    const success = allReports.filter((r) => r.status === 'Success');
    const pending = allReports.filter((r) => r.status === 'Pending');
    const failed = allReports.filter((r) => r.status === 'Failed');
    const refund = allReports.filter((r) => r.status === 'Refund' || r.status === 'Refunded');

    return {
      type: 'success',
      message: 'Recharge reports fetched successfully',
      data: reports,
      summary: {
        success: {
          amount: success.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: success.length,
        },
        pending: {
          amount: pending.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: pending.length,
        },
        failed: {
          amount: failed.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: failed.length,
        },
        refund: {
          amount: refund.reduce((sum, r) => sum + Number(r.totalAmount), 0),
          count: refund.length,
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

  async getProviders(serviceId?: number) {
    const where: any = { status: 1, deletedAt: IsNull() };
    if (serviceId) {
      where.serviceId = serviceId;
    }

    const providers = await this.providerRepository.find({
      where,
      select: ['id', 'providerName'],
    });

    return {
      type: 'success',
      message: 'Providers fetched successfully',
      data: providers,
    };
  }

  async getApis(providerId?: number) {
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

  async changeOperatorId(dto: ChangeOperatorIdDto) {
    const report = await this.reportRepository.findOne({
      where: { id: dto.id },
    });

    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Report not found',
      });
    }

    report.operatorId = dto.operator_id;
    await this.reportRepository.save(report);

    return {
      type: 'success',
      message: 'Operator ID updated successfully',
    };
  }

  async getComplaint(reportId: number) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });
    if (!report) {
      return {
        type: 'error',
        message: 'Report not found',
      };
    }
    const complaint = await this.complaintRepository.findOne({
      where: { orderId: report.orderId },
    });

    if (!complaint) {
      return {
        type: 'error',
        message: 'Complaint not found',
      };
    }

    return {
      type: 'success',
      message: 'Complaint fetched successfully',
      data: {
        complaint,
        report,
      },
    };
  }

  async updateComplaint(reportId: number, complaintStatus: string, complaintRemark?: string) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });
    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Report not found',
      });
    }
    let complaint = await this.complaintRepository.findOne({
      where: { orderId: report.orderId },
    });

    if (!complaint) {
      complaint = this.complaintRepository.create({
        userId: report.userId,
        orderId: report.orderId,
        status: complaintStatus,
        remark: complaintRemark,
      });
    } else {
      complaint.status = complaintStatus;
      if (complaintRemark) {
        complaint.remark = complaintRemark;
      }
    }

    await this.complaintRepository.save(complaint);

    return {
      type: 'success',
      message: 'Complaint updated successfully',
    };
  }

  async updateStatus(dto: UpdateStatusDto) {
    const report = await this.reportRepository.findOne({
      where: { id: dto.id },
    });

    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Report not found',
      });
    }

    report.status = dto.status;
    await this.reportRepository.save(report);

    return {
      type: 'success',
      message: 'Status updated successfully',
    };
  }

  async checkApiLogs(reportId: number) {
    // API logs would typically be stored in a separate table
    // For now, return a placeholder
    return {
      type: 'success',
      message: 'API logs fetched successfully',
      data: [],
      note: 'API logs table needs to be created if not exists',
    };
  }

  async exportRechargeReports(listDto: ListRechargeReportDto) {
    const result = await this.listRechargeReports({ ...listDto, limit: 10000, page: 1 });
    return result;
  }
}
