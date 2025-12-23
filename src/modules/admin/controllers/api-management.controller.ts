import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { Api } from '../../../database/entities/api.entity';
import { ApiProviderCode } from '../../../database/entities/api-provider-code.entity';
import { ApiStateCode } from '../../../database/entities/api-state-code.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { State } from '../../../database/entities/state.entity';
import { HttpHelper } from '../../../common/helpers/http.helper';
import {
  CreateApiDto,
  UpdateApiDto,
  GetApiDto,
  DeleteApiDto,
  GetProviderCodesDto,
  UpdateProviderCodeDto,
  BulkUpdateProviderCodeDto,
  GetStateCodesDto,
  UpdateStateCodeDto,
  BulkUpdateStateCodeDto,
  CheckBalanceDto,
} from '../dto/api-management.dto';

@Controller('v1/admin/system/apis')
export class ApiManagementController {
  constructor(
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    @InjectRepository(ApiProviderCode)
    private apiProviderCodeRepository: Repository<ApiProviderCode>,
    @InjectRepository(ApiStateCode)
    private apiStateCodeRepository: Repository<ApiStateCode>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    private httpHelper: HttpHelper,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async getApiList(@Body() body: { page?: number; limit?: number }) {
    const page = body.page || 1;
    const limit = Math.min(body.limit || 10, 50);
    const skip = (page - 1) * limit;

    const [apis, total] = await this.apiRepository.findAndCount({
      where: { deletedAt: IsNull() },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'APIs fetched successfully',
      data: {
        data: apis,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getApi(@Body() body: GetApiDto) {
    const api = await this.apiRepository.findOne({
      where: { id: body.id },
    });

    if (!api) {
      throw new BadRequestException({
        type: 'error',
        message: 'API not found',
      });
    }

    return {
      type: 'success',
      message: 'API fetched successfully',
      data: api,
    };
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createApi(@Body() createApiDto: CreateApiDto) {
    const api = this.apiRepository.create({
      apiName: createApiDto.apiName,
      apiUsername: createApiDto.api_username,
      apiPassword: createApiDto.api_password,
      apiKey: createApiDto.api_key,
      apiUrl: createApiDto.api_url,
      balanceCheckUrl: createApiDto.balance_check_url,
      complaintApiUrl: createApiDto.complaint_api_url,
      complaintApiMethod: createApiDto.complaint_api_method,
      complaintStatusValue: createApiDto.complaint_status_value,
      refundValue: createApiDto.refund_value,
      complaintSuccessValue: createApiDto.complaint_success_value,
      complaintFailedValue: createApiDto.complaint_failed_value,
      complaintCallbackStatusValue: createApiDto.complaint_callback_status_value,
      complaintCallbackSuccessValue: createApiDto.complaint_callback_success_value,
      complaintCallbackFailedValue: createApiDto.complaint_callback_failed_value,
      complaintCallbackRemark: createApiDto.complaint_callback_remark,
      complaintCallbackApiMethod: createApiDto.complaint_callback_api_method,
      callbackRefundValue: createApiDto.callback_refund_value,
      statusValue: createApiDto.status_value,
      successValue: createApiDto.success_value,
      failedValue: createApiDto.failed_value,
      pendingValue: createApiDto.pending_value,
      errorValue: createApiDto.error_value,
      errorValueResponse: createApiDto.error_value_response,
      orderIdValue: createApiDto.order_id_value,
      operatorIdValue: createApiDto.operator_id_value,
      apiMethod: createApiDto.api_method,
      apiFormat: createApiDto.api_format,
      callbackStatusValue: createApiDto.callback_status_value,
      callbackSuccessValue: createApiDto.callback_success_value,
      callbackFailedValue: createApiDto.callback_failed_value,
      callbackOrderIdValue: createApiDto.callback_order_id_value,
      callbackOperatorIdValue: createApiDto.callback_operator_id_value,
      callbackRemark: createApiDto.callback_remark,
      callbackApiMethod: createApiDto.callback_api_method,
      apiType: createApiDto.api_type,
      status: createApiDto.status,
    });

    const savedApi = await this.apiRepository.save(api);

    return {
      type: 'success',
      message: 'API created successfully',
      data: savedApi,
    };
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateApi(@Body() updateApiDto: UpdateApiDto) {
    const api = await this.apiRepository.findOne({
      where: { id: updateApiDto.id },
    });

    if (!api) {
      throw new BadRequestException({
        type: 'error',
        message: 'API not found',
      });
    }

    Object.assign(api, {
      apiName: updateApiDto.apiName,
      apiUsername: updateApiDto.api_username,
      apiPassword: updateApiDto.api_password,
      apiKey: updateApiDto.api_key,
      apiUrl: updateApiDto.api_url,
      balanceCheckUrl: updateApiDto.balance_check_url,
      complaintApiUrl: updateApiDto.complaint_api_url,
      complaintApiMethod: updateApiDto.complaint_api_method,
      complaintStatusValue: updateApiDto.complaint_status_value,
      refundValue: updateApiDto.refund_value,
      complaintSuccessValue: updateApiDto.complaint_success_value,
      complaintFailedValue: updateApiDto.complaint_failed_value,
      complaintCallbackStatusValue: updateApiDto.complaint_callback_status_value,
      complaintCallbackSuccessValue: updateApiDto.complaint_callback_success_value,
      complaintCallbackFailedValue: updateApiDto.complaint_callback_failed_value,
      complaintCallbackRemark: updateApiDto.complaint_callback_remark,
      complaintCallbackApiMethod: updateApiDto.complaint_callback_api_method,
      callbackRefundValue: updateApiDto.callback_refund_value,
      statusValue: updateApiDto.status_value,
      successValue: updateApiDto.success_value,
      failedValue: updateApiDto.failed_value,
      pendingValue: updateApiDto.pending_value,
      errorValue: updateApiDto.error_value,
      errorValueResponse: updateApiDto.error_value_response,
      orderIdValue: updateApiDto.order_id_value,
      operatorIdValue: updateApiDto.operator_id_value,
      apiMethod: updateApiDto.api_method,
      apiFormat: updateApiDto.api_format,
      callbackStatusValue: updateApiDto.callback_status_value,
      callbackSuccessValue: updateApiDto.callback_success_value,
      callbackFailedValue: updateApiDto.callback_failed_value,
      callbackOrderIdValue: updateApiDto.callback_order_id_value,
      callbackOperatorIdValue: updateApiDto.callback_operator_id_value,
      callbackRemark: updateApiDto.callback_remark,
      callbackApiMethod: updateApiDto.callback_api_method,
      apiType: updateApiDto.api_type,
      status: updateApiDto.status,
    });

    const updatedApi = await this.apiRepository.save(api);

    return {
      type: 'success',
      message: 'API updated successfully',
      data: updatedApi,
    };
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteApi(@Body() body: DeleteApiDto) {
    const api = await this.apiRepository.findOne({
      where: { id: body.id },
    });

    if (!api) {
      throw new BadRequestException({
        type: 'error',
        message: 'API not found',
      });
    }

    await this.apiRepository.update(body.id, {
      deletedAt: new Date(),
    });

    return {
      type: 'success',
      message: 'API deleted successfully',
    };
  }

  @Post('provider-codes')
  @UseGuards(AdminGuard)
  async getProviderCodes(@Body() body: GetProviderCodesDto) {
    const providers = await this.providerRepository.find({
      where: {
        serviceId: body.service,
        status: 1,
        deletedAt: IsNull(),
      },
    });

    const providersWithCodes = await Promise.all(
      providers.map(async (provider) => {
        const providerCode = await this.apiProviderCodeRepository.findOne({
          where: {
            apiId: body.id,
            providerId: provider.id,
          },
        });

        return {
          id: provider.id,
          provider_name: provider.providerName,
          provider_code: providerCode?.providerCode || '',
        };
      }),
    );

    return {
      type: 'success',
      message: 'Provider codes fetched successfully',
      data: providersWithCodes,
    };
  }

  @Post('provider-code/update')
  @UseGuards(AdminGuard)
  async updateProviderCode(@Body() body: UpdateProviderCodeDto) {
    await this.apiProviderCodeRepository.upsert(
      {
        apiId: body.api_id,
        providerId: body.provider_id,
        providerCode: body.provider_code,
      },
      ['apiId', 'providerId'],
    );

    return {
      type: 'success',
      message: 'Provider code updated successfully',
    };
  }

  @Post('provider-code/bulk-update')
  @UseGuards(AdminGuard)
  async bulkUpdateProviderCode(@Body() body: BulkUpdateProviderCodeDto) {
    for (let i = 0; i < body.provider_id.length; i++) {
      await this.apiProviderCodeRepository.upsert(
        {
          apiId: body.api_id,
          providerId: body.provider_id[i],
          providerCode: body.provider_code[i],
        },
        ['apiId', 'providerId'],
      );
    }

    return {
      type: 'success',
      message: 'Provider codes updated successfully',
    };
  }

  @Post('state-codes')
  @UseGuards(AdminGuard)
  async getStateCodes(@Body() body: GetStateCodesDto) {
    const states = await this.stateRepository.find({
      where: { status: 1 },
    });

    const statesWithCodes = await Promise.all(
      states.map(async (state) => {
        const stateCode = await this.apiStateCodeRepository.findOne({
          where: {
            apiId: body.id,
            stateId: state.id,
          },
        });

        return {
          id: state.id,
          state_name: state.stateName,
          state_code: stateCode?.stateCode || '',
        };
      }),
    );

    return {
      type: 'success',
      message: 'State codes fetched successfully',
      data: statesWithCodes,
    };
  }

  @Post('state-code/update')
  @UseGuards(AdminGuard)
  async updateStateCode(@Body() body: UpdateStateCodeDto) {
    await this.apiStateCodeRepository.upsert(
      {
        apiId: body.api_id,
        stateId: body.state_id,
        stateCode: body.state_code,
      },
      ['apiId', 'stateId'],
    );

    return {
      type: 'success',
      message: 'State code updated successfully',
    };
  }

  @Post('state-code/bulk-update')
  @UseGuards(AdminGuard)
  async bulkUpdateStateCode(@Body() body: BulkUpdateStateCodeDto) {
    for (let i = 0; i < body.state_id.length; i++) {
      await this.apiStateCodeRepository.upsert(
        {
          apiId: body.state_api_id,
          stateId: body.state_id[i],
          stateCode: body.state_code[i],
        },
        ['apiId', 'stateId'],
      );
    }

    return {
      type: 'success',
      message: 'State codes updated successfully',
    };
  }

  @Post('check-balance')
  @UseGuards(AdminGuard)
  async checkBalance(@Body() body: CheckBalanceDto) {
    const api = await this.apiRepository.findOne({
      where: { id: body.id },
    });

    if (!api) {
      throw new BadRequestException({
        type: 'error',
        message: 'API not found',
      });
    }

    if (!api.balanceCheckUrl) {
      throw new BadRequestException({
        type: 'error',
        message: 'Balance check URL not configured',
      });
    }

    // Validate required credentials
    if (!api.apiUsername) {
      throw new BadRequestException({
        type: 'error',
        message: 'API Username is not configured',
      });
    }

    if (!api.apiKey) {
      throw new BadRequestException({
        type: 'error',
        message: 'API Key/Token is not configured',
      });
    }

    // Replace placeholders in balance check URL (case-insensitive replacement)
    // URL encode the credentials to handle special characters
    const encodedUsername = encodeURIComponent(api.apiUsername);
    const encodedPassword = encodeURIComponent(api.apiPassword || '');
    const encodedApiKey = encodeURIComponent(api.apiKey);
    
    let balanceUrl = api.balanceCheckUrl;
    // Replace all variations of placeholders with URL-encoded values
    balanceUrl = balanceUrl.replace(/{API_USERNAME}/gi, encodedUsername);
    balanceUrl = balanceUrl.replace(/{API_USER}/gi, encodedUsername);
    balanceUrl = balanceUrl.replace(/{USERNAME}/gi, encodedUsername);
    balanceUrl = balanceUrl.replace(/{API_PASSWORD}/gi, encodedPassword);
    balanceUrl = balanceUrl.replace(/{API_KEY}/gi, encodedApiKey);
    balanceUrl = balanceUrl.replace(/{API_TOKEN}/gi, encodedApiKey);
    balanceUrl = balanceUrl.replace(/{TOKEN}/gi, encodedApiKey);
    balanceUrl = balanceUrl.replace(/{KEY}/gi, encodedApiKey);

    // Use GET method for balance check (most APIs use GET for balance)
    const method = 'GET';

    try {
      const result = await this.httpHelper.curl(
        balanceUrl,
        method,
        '',
        {},
        'no',
        'BALANCE_CHECK',
        `BAL-${Date.now()}`,
      );

      return {
        type: 'success',
        message: 'Balance checked successfully',
        data: {
          response: result.response,
          balance_url: balanceUrl, // Return the actual URL used (with placeholders replaced)
          original_url: api.balanceCheckUrl, // Also return the template URL
        },
      };
    } catch (error: any) {
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Failed to check balance',
        data: {
          error: error.message,
          balance_url: balanceUrl,
        },
      });
    }
  }
}
