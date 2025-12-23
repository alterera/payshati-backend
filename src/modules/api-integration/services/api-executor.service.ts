import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Api } from '../../../database/entities/api.entity';
import { ApiProviderCode } from '../../../database/entities/api-provider-code.entity';
import { Report } from '../../../database/entities/report.entity';
import { State } from '../../../database/entities/state.entity';
import { HttpHelper } from '../../../common/helpers/http.helper';

export interface ApiExecutionResult {
  status: string;
  operatorId?: string;
  apiOperatorId?: string;
  remark: string;
  apiPartnerOrderId?: string;
  orderId: string;
  callbackStatus?: number;
}

@Injectable()
export class ApiExecutorService {
  constructor(
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    @InjectRepository(ApiProviderCode)
    private apiProviderCodeRepository: Repository<ApiProviderCode>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    private httpHelper: HttpHelper,
  ) {}

  /**
   * Replaces helpers::RunApi function
   * Executes API call to third-party provider
   */
  async runApi(
    apiId: number,
    providerId: number,
    reportId: number,
    service: string,
  ): Promise<ApiExecutionResult | null> {
    const api = await this.apiRepository.findOne({
      where: { id: apiId },
    });

    if (!api) {
      return {
        status: 'Failed',
        operatorId: '',
        remark: `${service} Failed. API not found`,
        orderId: '',
      };
    }

    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      return {
        status: 'Failed',
        operatorId: '',
        remark: `${service} Failed. Report not found`,
        orderId: '',
      };
    }

    // Get provider code
    const providerCode = await this.getProviderCode(apiId, providerId);
    if (!providerCode) {
      return {
        status: 'Failed',
        operatorId: '',
        remark: `${service} Failed. Provider code not found`,
        orderId: report.orderId,
      };
    }

    // Get state code
    const stateCode = await this.getStateCode(apiId, report.stateId);

    // Build URL with replacements
    let url = api.apiUrl;
    url = url.replace('{API_USERNAME}', api.apiUsername);
    url = url.replace('{API_PASSWORD}', api.apiPassword);
    url = url.replace('{API_KEY}', api.apiKey);
    url = url.replace('{NUMBER}', report.number);
    url = url.replace('{PROVIDER_CODE}', providerCode);
    url = url.replace('{STATE_CODE}', stateCode || '');
    url = url.replace('{AMOUNT}', String(report.totalAmount));
    url = url.replace('{ORDER_ID}', report.orderId);

    const method = api.apiMethod;
    const headers: Record<string, string> = {};

    try {
      const result = await this.httpHelper.curl(
        url,
        method,
        '',
        headers,
        'yes',
        service,
        report.orderId,
      );

      if (result.code === 0) {
        return {
          status: 'Failed',
          operatorId: '',
          remark: `${service} Failed. Server under maintenance`,
          orderId: report.orderId,
        };
      }

      if (api.apiFormat === 'JSON' && result.response) {
        return this.parseJsonResponse(result.response, api, report, service);
      } else {
        return {
          status: 'Failed',
          operatorId: '',
          remark: `${service} Failed. Invalid API format`,
          orderId: report.orderId,
        };
      }
    } catch (error) {
      return {
        status: 'Failed',
        operatorId: '',
        remark: `${service} Failed. ${error.message}`,
        orderId: report.orderId,
      };
    }
  }

  private parseJsonResponse(
    response: string,
    api: Api,
    report: Report,
    service: string,
  ): ApiExecutionResult {
    try {
      const data = JSON.parse(response);
      const status = api.statusValue;
      const errorStatus = api.errorValue;

      if (!data[status]) {
        return {
          status: 'Pending',
          operatorId: '',
          remark: `${service} Pending For Rs. ${report.totalAmount} Number ${report.number}`,
          orderId: report.orderId,
          apiPartnerOrderId: report.apiPartnerOrderId,
        };
      }

      if (data[status] === api.successValue) {
        return {
          status: 'Success',
          operatorId: data[api.operatorIdValue] || '',
          apiOperatorId: data[api.orderIdValue] || '',
          remark: `${service} Successful For Rs. ${report.totalAmount} Number ${report.number}`,
          orderId: report.orderId,
          apiPartnerOrderId: report.apiPartnerOrderId,
          callbackStatus: 1,
        };
      } else if (
        data[status] === api.failedValue ||
        data[status] === api.refundValue
      ) {
        return {
          status: 'Failed',
          operatorId: data[api.operatorIdValue] || '',
          apiOperatorId: data[api.orderIdValue] || '',
          remark: `${service} Failed For Rs. ${report.totalAmount} Number ${report.number}`,
          orderId: report.orderId,
          apiPartnerOrderId: report.apiPartnerOrderId,
        };
      } else if (data[errorStatus] === api.errorValueResponse) {
        return {
          status: 'Failed',
          operatorId: '',
          remark: `${service} Failed For Rs. ${report.totalAmount} Number ${report.number}`,
          orderId: report.orderId,
          apiPartnerOrderId: report.apiPartnerOrderId,
        };
      } else {
        return {
          status: 'Pending',
          operatorId: '',
          remark: `${service} Pending For Rs. ${report.totalAmount} Number ${report.number}`,
          orderId: report.orderId,
          apiPartnerOrderId: report.apiPartnerOrderId,
        };
      }
    } catch (error) {
      return {
        status: 'Pending',
        operatorId: '',
        remark: `${service} Pending For Rs. ${report.totalAmount} Number ${report.number}`,
        orderId: report.orderId,
        apiPartnerOrderId: report.apiPartnerOrderId,
      };
    }
  }

  private async getProviderCode(
    apiId: number,
    providerId: number,
  ): Promise<string | null> {
    const apiProviderCode = await this.apiProviderCodeRepository.findOne({
      where: {
        apiId,
        providerId,
      },
    });

    return apiProviderCode?.providerCode || null;
  }

  private async getStateCode(
    apiId: number,
    stateId: number | null,
  ): Promise<string | null> {
    if (!stateId) {
      return null;
    }

    const state = await this.stateRepository.findOne({
      where: { id: stateId },
    });

    return state?.planApiCode || null;
  }
}
