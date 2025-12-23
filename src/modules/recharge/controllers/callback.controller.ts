import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../../database/entities/report.entity';
import { Api } from '../../../database/entities/api.entity';
import { TransactionHelper } from '../../../common/helpers/transaction.helper';
import { CommissionService } from '../../commission/services/commission.service';

@Controller('callback')
export class CallbackController {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    private transactionHelper: TransactionHelper,
    private commissionService: CommissionService,
  ) {}

  /**
   * Handle recharge callback from API providers (like PDRS)
   * GET /callback/recharge?uniqueid={order_id}&status={status}&operator_id={operator_id}&transaction_id={txn_id}&number={number}&amount={amount}
   */
  @Get('recharge')
  async handleRechargeCallback(
    @Query('uniqueid') orderId: string,
    @Query('status') status: string,
    @Query('operator_id') operatorId: string,
    @Query('transaction_id') transactionId: string,
    @Query('number') number: string,
    @Query('amount') amount: string,
  ) {
    if (!orderId) {
      throw new BadRequestException({
        type: 'error',
        message: 'Order ID is required',
      });
    }

    // Find the report by order ID
    const report = await this.reportRepository.findOne({
      where: { orderId },
      relations: ['provider'],
    });

    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Transaction not found',
      });
    }

    // Get API configuration
    const api = await this.apiRepository.findOne({
      where: { id: report.apiId },
    });

    if (!api) {
      throw new BadRequestException({
        type: 'error',
        message: 'API configuration not found',
      });
    }

    // Determine status based on callback values
    let transactionStatus = 'Pending';
    let shouldRefund = false;

    if (status === api.callbackSuccessValue || status === 'Success') {
      transactionStatus = 'Success';
    } else if (
      status === api.callbackFailedValue ||
      status === 'Failure' ||
      status === 'Failed'
    ) {
      transactionStatus = 'Failed';
      shouldRefund = true;
    } else if (status === api.pendingValue || status === 'Pending') {
      transactionStatus = 'Pending';
    }

    // Update report
    const updateData: any = {
      status: transactionStatus,
      operatorId: operatorId || report.operatorId,
      callbackStatus: 1,
    };

    // Update apiOperatorId if transaction ID is provided
    if (transactionId) {
      updateData.apiOperatorId = transactionId;
    }

    await this.reportRepository.update(report.id, updateData);

    // Process refund if transaction failed
    if (shouldRefund && report.status !== 'Failed') {
      await this.reportRepository.update(report.id, {
        callbackStatus: 1,
      });
      await this.transactionHelper.refundRow(report.id);
    }

    // Set commission if transaction succeeded
    if (transactionStatus === 'Success' && report.status !== 'Success') {
      await this.commissionService.setCommission(report.id);
    }

    // Return success response (API providers expect this)
    return {
      status: 'success',
      message: 'Callback processed successfully',
      order_id: orderId,
    };
  }
}

