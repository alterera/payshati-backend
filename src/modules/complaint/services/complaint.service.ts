import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from '../../../database/entities/complaint.entity';
import { Report } from '../../../database/entities/report.entity';
import { User } from '../../../database/entities/user.entity';
import { Service } from '../../../database/entities/service.entity';
import { Provider } from '../../../database/entities/provider.entity';
import {
  SubmitComplaintDto,
  ListComplaintDto,
  GetComplaintReportDto,
} from '../dto/complaint.dto';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async submitComplaint(userId: number, dto: SubmitComplaintDto) {
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

    const report = await this.reportRepository.findOne({
      where: { id: dto.id, userId: userId },
    });

    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Record not found',
      });
    }

    if (report.status !== 'Success') {
      throw new BadRequestException({
        type: 'error',
        message: 'Complaint can only be submitted for successful transactions',
      });
    }

    // Check if complaint already exists
    const existingComplaint = await this.complaintRepository.findOne({
      where: { reportId: report.id, status: 'Open' },
    });

    if (existingComplaint) {
      throw new BadRequestException({
        type: 'error',
        message: 'Complaint Already Submit Contact Service provider.',
      });
    }

    const requestId = `SR${Date.now()}${Math.floor(Math.random() * 1000000)}`;

    const path = user.roleId === 3 ? 'Api' : 'Web';

    const complaint = this.complaintRepository.create({
      userId: user.id,
      serviceId: report.serviceId,
      orderId: report.orderId,
      reportId: report.id,
      requestId: requestId,
      subject: dto.subject,
      status: 'Open',
      path: path,
      callbackStatus: 0,
    });

    await this.complaintRepository.save(complaint);

    // Update report with complaint_id (if field exists)
    // Note: Report entity doesn't have complaintId field, so we skip this

    return {
      type: 'success',
      message: 'Complaint Submit Successfully up to 3 Working Day Any Response.',
      data: {
        request_id: requestId,
        complaint_id: complaint.id,
      },
    };
  }

  async listComplaints(userId: number, dto: ListComplaintDto) {
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

    const queryBuilder = this.complaintRepository
      .createQueryBuilder('complaint')
      .where('complaint.userId = :userId', { userId })
      .andWhere('complaint.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });

    const [complaints, total] = await queryBuilder
      .orderBy('complaint.id', 'DESC')
      .skip(skip)
      .take(dto.limit)
      .getManyAndCount();

    const complaintsWithDetails = await Promise.all(
      complaints.map(async (complaint) => {
        const service = complaint.serviceId
          ? await this.serviceRepository.findOne({
              where: { id: complaint.serviceId },
            })
          : null;

        const decisionByUser = complaint.decisionBy
          ? await this.userRepository.findOne({
              where: { id: complaint.decisionBy },
            })
          : null;

        let statusColor = 'warning';
        if (complaint.status === 'Sloved') {
          statusColor = 'success';
        } else if (complaint.status === 'Closed') {
          statusColor = 'danger';
        } else if (complaint.status === 'Open') {
          statusColor = 'warning';
        } else {
          statusColor = 'primary';
        }

        return {
          id: complaint.id,
          request_id: complaint.requestId,
          created_at: complaint.createdAt,
          service_name: service?.serviceName || '',
          report_id: complaint.reportId,
          subject: complaint.subject,
          decision_name: decisionByUser
            ? `${decisionByUser.firstName || ''} ${decisionByUser.middleName || ''} ${decisionByUser.lastName || ''}`.trim()
            : '',
          decision_date: complaint.decisionDate || '',
          decision_remark: complaint.decisionRemark || '',
          status: complaint.status,
          status_color: statusColor,
        };
      }),
    );

    return {
      type: 'success',
      message: 'Complaints fetched successfully',
      data: complaintsWithDetails,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getComplaintReport(userId: number, dto: GetComplaintReportDto) {
    const report = await this.reportRepository.findOne({
      where: { id: dto.id, userId: userId },
    });

    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Record not found',
      });
    }

    const provider = report.providerId
      ? await this.providerRepository.findOne({
          where: { id: report.providerId },
        })
      : null;

    const service = report.serviceId
      ? await this.serviceRepository.findOne({
          where: { id: report.serviceId },
        })
      : null;

    let statusColor = 'warning';
    if (report.status === 'Success') {
      statusColor = 'success';
    } else if (report.status === 'Failed') {
      statusColor = 'danger';
    } else if (report.status === 'Refunded') {
      statusColor = 'secondary';
    }

    return {
      type: 'success',
      message: 'Report fetched successfully',
      data: {
        transaction_date: report.transactionDate,
        number: report.number,
        provider_name: provider?.providerName || '',
        service_name: service?.serviceName || '',
        path: report.path,
        order_id: report.orderId,
        operator_id: report.operatorId || '',
        status: report.status,
        status_color: statusColor,
        total_amount: Number(report.totalAmount).toFixed(2),
        amount: Number(report.amount).toFixed(2),
        commission: Number(report.commission || 0).toFixed(2),
      },
    };
  }
}

