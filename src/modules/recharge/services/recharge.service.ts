import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Report } from '../../../database/entities/report.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { Api } from '../../../database/entities/api.entity';
import { ApiProviderCode } from '../../../database/entities/api-provider-code.entity';
import { State } from '../../../database/entities/state.entity';
import { ApiRouterService } from '../../api-integration/services/api-router.service';
import { ApiExecutorService } from '../../api-integration/services/api-executor.service';
import { TransactionHelper } from '../../../common/helpers/transaction.helper';
import { CommissionService } from '../../commission/services/commission.service';
import { HttpHelper } from '../../../common/helpers/http.helper';
import {
  RechargeDto,
  CheckMobileDto,
  CheckRofferDto,
  CheckViewPlanDto,
  DthInfoDto,
  DthHeavyRefreshDto,
} from '../dto/recharge.dto';

@Injectable()
export class RechargeService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    @InjectRepository(ApiProviderCode)
    private apiProviderCodeRepository: Repository<ApiProviderCode>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    private apiRouterService: ApiRouterService,
    private apiExecutorService: ApiExecutorService,
    private transactionHelper: TransactionHelper,
    private commissionService: CommissionService,
    private httpHelper: HttpHelper,
    private dataSource: DataSource,
  ) {}

  async processRecharge(userId: number, rechargeDto: RechargeDto) {
    console.log('=== Recharge Process Started ===');
    console.log('User ID:', userId);
    console.log('Recharge DTO:', JSON.stringify(rechargeDto, null, 2));

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.error('User not found:', userId);
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    console.log('User found:', {
      id: user.id,
      walletBalance: user.walletBalance,
      status: user.status,
    });

    // Verify PIN
    if (user.tPin !== rechargeDto.pin) {
      console.error('Invalid PIN provided');
      throw new BadRequestException({
        status: 'Failed',
        type: 'error',
        message: 'Invalid PIN',
      });
    }

    // Check wallet balance
    if (Number(user.walletBalance) < Number(rechargeDto.amount)) {
      console.error('Insufficient balance:', {
        walletBalance: user.walletBalance,
        requiredAmount: rechargeDto.amount,
      });
      throw new BadRequestException({
        status: 'Failed',
        type: 'error',
        message: 'Insufficient wallet balance',
      });
    }

    const provider = await this.providerRepository.findOne({
      where: { id: rechargeDto.provider_id },
    });

    if (!provider) {
      console.error('Provider not found:', rechargeDto.provider_id);
      throw new BadRequestException({
        status: 'Failed',
        type: 'error',
        message: 'Provider not found',
      });
    }

    console.log('Provider found:', {
      id: provider.id,
      name: provider.providerName,
      status: provider.status,
    });

    const stateId = rechargeDto.state_id || 40; // Default state
    console.log('State ID:', stateId);

    // Determine which API to use
    const apiId = await this.apiRouterService.checkApis({
      providerId: rechargeDto.provider_id,
      amount: rechargeDto.amount,
      stateId: stateId,
      userId: userId,
    });

    console.log('Selected API ID:', apiId);

    if (!apiId || apiId === 0) {
      console.error('No API available for recharge');
      throw new BadRequestException({
        status: 'Failed',
        type: 'error',
        message: 'No API available for this recharge',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Debit wallet
      console.log('Debiting wallet...');
      const walletUpdate = await this.transactionHelper.updateWalletBalance(
        userId,
        rechargeDto.amount,
        'debit',
      );

      if (!walletUpdate.success) {
        console.error('Wallet debit failed');
        throw new BadRequestException({
          status: 'Failed',
          type: 'error',
          message: 'Failed to debit wallet',
        });
      }

      console.log('Wallet debited:', {
        oldBalance: Number(user.walletBalance),
        newBalance: walletUpdate.newBalance,
        amount: rechargeDto.amount,
      });

      // Generate unique order ID with timestamp to avoid duplicates
      let orderId: string;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        orderId = `RCH${timestamp}${random}`;
        
        // Check if order ID already exists
        const existingReport = await queryRunner.manager.findOne(Report, {
          where: { orderId },
        });
        
        if (!existingReport) {
          break; // Order ID is unique
        }
        
        attempts++;
        console.warn(`Order ID ${orderId} already exists, generating new one... (attempt ${attempts})`);
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new BadRequestException({
          status: 'Failed',
          type: 'error',
          message: 'Failed to generate unique order ID',
        });
      }

      console.log('Generated Order ID:', orderId);

      // Create report entry
      const report = this.reportRepository.create({
        userId: userId,
        providerId: rechargeDto.provider_id,
        serviceId: rechargeDto.service_id,
        stateId: stateId,
        apiId: apiId,
        number: rechargeDto.number,
        amount: rechargeDto.amount,
        totalAmount: rechargeDto.amount,
        fundType: 'Debit',
        transactionType: 'Recharge',
        status: 'Pending',
        orderId: orderId,
        openingBalance: Number(user.walletBalance),
        closingBalance: walletUpdate.newBalance,
        transactionDate: new Date().toISOString(),
      });

      console.log('Creating report entry...');
      const savedReport = await queryRunner.manager.save(report);
      console.log('Report created:', {
        id: savedReport.id,
        orderId: savedReport.orderId,
        status: savedReport.status,
      });

      await queryRunner.commitTransaction();
      console.log('Transaction committed');

      // Execute API call (outside transaction)
      console.log('Executing API call...');
      const apiResult = await this.executeApiWithFallback(
        apiId,
        provider,
        rechargeDto.provider_id,
        savedReport.id,
      );

      console.log('API Result:', {
        status: apiResult.status,
        operatorId: apiResult.operatorId,
        remark: apiResult.remark,
      });

      // Update report with API result
      await this.reportRepository.update(savedReport.id, {
        status: apiResult.status,
        operatorId: apiResult.operatorId,
        apiOperatorId: apiResult.apiOperatorId,
        remark: apiResult.remark,
        callbackStatus: apiResult.callbackStatus || 0,
      });

      console.log('Report updated with API result');

      // Set commission if successful
      if (apiResult.status === 'Success') {
        console.log('Setting commission...');
        await this.commissionService.setCommission(savedReport.id);
      }

      const response = {
        status: apiResult.status,
        type: apiResult.status === 'Success' ? 'success' : 'error',
        message: apiResult.remark,
        data: {
          order_id: orderId,
          number: rechargeDto.number,
          amount: rechargeDto.amount,
          operator_id: apiResult.operatorId,
        },
      };

      console.log('Recharge completed successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Recharge Error:', {
        errorType: error.constructor.name,
        message: error.message,
        stack: error.stack?.substring(0, 500),
      });
      
      await queryRunner.rollbackTransaction();
      console.log('Transaction rolled back');
      
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Wrap other errors
      throw new BadRequestException({
        status: 'Failed',
        type: 'error',
        message: error.message || 'An error occurred during recharge',
      });
    } finally {
      await queryRunner.release();
      console.log('Query runner released');
    }
  }

  private async executeApiWithFallback(
    initialApiId: number,
    provider: Provider,
    providerId: number,
    reportId: number,
  ) {
    let apiId = initialApiId;
    let apiResult = await this.apiExecutorService.runApi(
      apiId,
      providerId,
      reportId,
      'Recharge',
    );

    if (apiResult && apiResult.status === 'Success') {
      return apiResult;
    }

    // Try backup APIs
    const backupApis = [
      provider.backupApiId,
      provider.backupApi2Id,
      provider.backupApi3Id,
    ].filter((id) => id && id !== 0);

    for (const backupApiId of backupApis) {
      await this.reportRepository.update(reportId, { apiId: backupApiId });
      apiResult = await this.apiExecutorService.runApi(
        backupApiId,
        providerId,
        reportId,
        'Recharge',
      );

      if (apiResult && apiResult.status === 'Success') {
        return apiResult;
      }
    }

    // All APIs failed, process refund
    if (apiResult && apiResult.status === 'Failed') {
      await this.reportRepository.update(reportId, {
        callbackStatus: 1,
      });
      await this.transactionHelper.refundRow(reportId);
    }

    return apiResult || {
      status: 'Failed',
      operatorId: '',
      remark: 'Recharge Failed. All APIs failed',
      orderId: '',
    };
  }

  async getRechargeReceipt(orderId: string, userId: number) {
    const report = await this.reportRepository.findOne({
      where: {
        orderId,
        userId,
        transactionType: 'Recharge',
      },
      relations: ['provider'],
    });

    if (!report) {
      throw new BadRequestException({
        type: 'error',
        message: 'Receipt not found',
      });
    }

    return {
      type: 'success',
      message: 'Receipt fetched successfully',
      data: {
        order_id: report.orderId,
        number: report.number,
        amount: report.amount,
        total_amount: report.totalAmount,
        status: report.status,
        operator_id: report.operatorId,
        remark: report.remark,
        created_at: report.createdAt,
        provider: report.provider
          ? {
              id: report.provider.id,
              name: report.provider.providerName,
              logo: report.provider.providerLogo,
            }
          : null,
      },
    };
  }

  async checkMobileNumber(checkMobileDto: CheckMobileDto) {
    // Find active Operator Check API - try "Operator Check" type first, fallback to API ID 7 for backward compatibility
    // This matches Laravel: $api = DB::table('apis')->where('id', '7')->first();
    let api = await this.apiRepository.findOne({
      where: { apiType: 'Operator Check', status: 1 },
    });

    // Fallback to API ID 7 if no Operator Check type found (matches Laravel hardcoded ID 7)
    if (!api) {
      api = await this.apiRepository.findOne({
        where: { id: 7, status: 1 },
      });
    }

    if (!api) {
      throw new BadRequestException({
        type: 'error',
        message: 'Operator detection service is not available',
      });
    }

    // Build URL exactly like Laravel: $api->api_url.'Mobile/OperatorFetchNew?ApiUserID='.$api->api_username.'&ApiPassword='.$api->api_password.'&Mobileno='.$post->number;
    let url = api.apiUrl;
    
    // Check if URL contains placeholders, if not construct it like Laravel
    if (url.includes('{') || url.includes('}')) {
      // Has placeholders, replace them
      url = url.replace('{API_USERNAME}', api.apiUsername || '');
      url = url.replace('{API_PASSWORD}', api.apiPassword || '');
      url = url.replace('{API_KEY}', api.apiKey || '');
      url = url.replace('{API_USERID}', api.apiUsername || '');
      url = url.replace('{MOBILENO}', checkMobileDto.number);
      url = url.replace('{NUMBER}', checkMobileDto.number);
    } else {
      // No placeholders, construct URL exactly like Laravel
      // Laravel: $api->api_url.'Mobile/OperatorFetchNew?ApiUserID='.$api->api_username.'&ApiPassword='.$api->api_password.'&Mobileno='.$post->number;
      const baseUrl = api.apiUrl.endsWith('/') ? api.apiUrl.slice(0, -1) : api.apiUrl;
      url = `${baseUrl}Mobile/OperatorFetchNew?ApiUserID=${api.apiUsername}&ApiPassword=${api.apiPassword}&Mobileno=${checkMobileDto.number}`;
    }

    // Laravel order_id: "CMN".rand(1111111111, 9999999999);
    const orderId = `CMN${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    // Laravel: $result = \helpers::curl($url, "GET", "", $header, "yes", "CHECK_MOBILE", $order_id);
    const result = await this.httpHelper.curl(
      url,
      'GET',
      '',
      {},
      'yes',
      'CHECK_MOBILE',
      orderId,
    );

    // Laravel: if($result){
    if (!result || !result.response) {
      throw new BadRequestException({
        type: 'error',
        message: 'Something Went Wrong S',
      });
    }

    // Laravel: $data= json_decode($result['response'],true);
    let data: any;
    try {
      data = typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
      // Log the API response for debugging
      console.log('Operator Check API Response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      throw new BadRequestException({
        type: 'error',
        message: 'Something Went Wrong S',
      });
    }

    // Check for PlanAPI error format (ERROR: "3" means auth failed, but Laravel doesn't check this)
    // However, we should handle it to give better error messages
    if (data.ERROR === '3' || data.STATUS === '3') {
      throw new BadRequestException({
        type: 'error',
        message: data.Message || 'Authentication failed with operator check API',
      });
    }

    // Laravel: $provider = DB::table('api_provider_codes')->where('api_id', '7')->where('provider_code', $data['OpCode'])->first();
    // Laravel directly accesses $data['OpCode'] without checking if it exists first
    // If OpCode doesn't exist, the query will return null, which will cause an error when accessing ->provider_id
    // We'll add a check here to provide a better error message
    const opCode = data.OpCode || data.opCode || data.OPCODE;

    if (!opCode && opCode !== 0) {
      throw new BadRequestException({
        type: 'error',
        message: data.Message || data.message || 'Unable to detect operator for this number',
      });
    }

    // Convert opCode to string for comparison (provider codes are stored as strings)
    const opCodeStr = String(opCode);

    // Find provider by API provider code (exactly like Laravel)
    // Try exact match first
    let apiProviderCode = await this.apiProviderCodeRepository.findOne({
      where: {
        apiId: api.id,
        providerCode: opCodeStr,
      },
    });

    // If not found, try with trimmed value (in case of whitespace issues)
    if (!apiProviderCode) {
      apiProviderCode = await this.apiProviderCodeRepository.findOne({
        where: {
          apiId: api.id,
          providerCode: opCodeStr.trim(),
        },
      });
    }

    // If still not found, try numeric comparison (in case stored as number string)
    if (!apiProviderCode && !isNaN(Number(opCodeStr))) {
      const numericCode = Number(opCodeStr).toString();
      apiProviderCode = await this.apiProviderCodeRepository.findOne({
        where: {
          apiId: api.id,
          providerCode: numericCode,
        },
      });
    }

    if (!apiProviderCode) {
      throw new BadRequestException({
        type: 'error',
        message: `Provider not found for operator code: ${opCodeStr}. Please map this operator code in admin panel for the Operator Check API (ID: ${api.id}).`,
      });
    }

    // Laravel: $provider_data = DB::table('providers')->where('id', $provider->provider_id)->first();
    const provider = await this.providerRepository.findOne({
      where: { id: apiProviderCode.providerId },
    });

    if (!provider) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider not found',
      });
    }

    // Laravel: $state = DB::table('states')->where('plan_api_code', $data['CircleCode'])->first();
    const circleCode = data.CircleCode || data.circleCode || data.Circle_Code; // Laravel expects CircleCode directly
    let state: State | null = null;
    if (circleCode) {
      const foundState = await this.stateRepository.findOne({
        where: { planApiCode: String(circleCode) },
      });
      if (foundState) {
        state = foundState;
      }
    }

    // Get circle name from API response or state name as fallback
    const circleName = data.Circle || data.circle || state?.stateName || null;

    // Laravel response structure (flat, not nested):
    // return response()->json([
    //   'type' => 'success',
    //   'message'=>'Get Successfully',
    //   'provider_id' => $provider_data->id,
    //   'provider_name' => $provider_data->provider_name,
    //   'provider_logo' => $provider_data->provider_logo,
    //   'state_id' => $state->id,
    //   'state_name' => $state->state_name
    // ]);
    return {
      type: 'success',
      message: 'Get Successfully',
      provider_id: provider.id,
      provider_name: provider.providerName,
      provider_logo: provider.providerLogo,
      state_id: state?.id || null,
      state_name: state?.stateName || null,
      // Include circle information from API response
      circle: circleName,
      circle_code: circleCode || null,
      operator: data.Operator || data.operator || provider.providerName,
      operator_code: data.OpCode || data.opCode || data.OPCODE || null,
    };
  }

  async checkRoffer(checkRofferDto: CheckRofferDto) {
    // Use API ID 6 for recharge offers
    const api = await this.apiRepository.findOne({
      where: { id: 6 },
    });

    if (!api || api.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'Recharge offers service is not available',
      });
    }

    // Get provider code
    const apiProviderCode = await this.apiProviderCodeRepository.findOne({
      where: {
        apiId: 6,
        providerId: checkRofferDto.provider_id,
      },
    });

    if (!apiProviderCode || !apiProviderCode.providerCode) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider code not found',
      });
    }

    const url = `${api.apiUrl}plans.php?apikey=${api.apiKey}&operator=${apiProviderCode.providerCode}&offer=roffer&tel=${checkRofferDto.number}`;
    const orderId = `ROF${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    try {
      const result = await this.httpHelper.curl(
        url,
        'GET',
        '',
        {},
        'yes',
        'Roffer',
        orderId,
      );

      if (!result.response || result.code === 0) {
        throw new BadRequestException({
          type: 'error',
          message: 'Something went wrong',
        });
      }

      let data: any;
      try {
        data = typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
      } catch {
        throw new BadRequestException({
          type: 'error',
          message: 'Invalid response format',
        });
      }

      return {
        type: 'success',
        message: 'Fatch Successfully',
        data: data.records || [],
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Something went wrong',
      });
    }
  }

  async checkViewPlan(checkViewPlanDto: CheckViewPlanDto) {
    console.log('=== Plans API Debug - checkViewPlan ===');
    console.log('Request DTO:', JSON.stringify(checkViewPlanDto, null, 2));

    // Use API ID 6 for recharge plans
    const api = await this.apiRepository.findOne({
      where: { id: 6 },
    });

    console.log('API ID 6 Details:', {
      found: !!api,
      apiName: api?.apiName,
      apiUrl: api?.apiUrl,
      apiKey: api?.apiKey ? `${api.apiKey.substring(0, 10)}...` : 'NOT SET',
      status: api?.status,
    });

    if (!api || api.status !== 1) {
      console.error('API Error: API not found or not active');
      throw new BadRequestException({
        type: 'error',
        message: 'Recharge plans service is not available',
      });
    }

    // Get provider code
    const apiProviderCode = await this.apiProviderCodeRepository.findOne({
      where: {
        apiId: 6,
        providerId: checkViewPlanDto.provider_id,
      },
    });

    console.log('Provider Code Lookup:', {
      apiId: 6,
      providerId: checkViewPlanDto.provider_id,
      found: !!apiProviderCode,
      providerCode: apiProviderCode?.providerCode || 'NOT FOUND',
    });

    if (!apiProviderCode || !apiProviderCode.providerCode) {
      console.error('Provider Code Error: Not found for provider_id:', checkViewPlanDto.provider_id);
      throw new BadRequestException({
        type: 'error',
        message: 'Provider code not found',
      });
    }

    // Get state code (mplanStateCode for plans API)
    const state = await this.stateRepository.findOne({
      where: { id: checkViewPlanDto.state_id },
    });

    console.log('State Lookup:', {
      stateId: checkViewPlanDto.state_id,
      found: !!state,
      stateName: state?.stateName,
      planApiCode: state?.planApiCode,
      mplanStateCode: state?.mplanStateCode || 'NOT SET',
    });

    if (!state || !state.mplanStateCode) {
      console.error('State Code Error: mplan_state_code not found for state_id:', checkViewPlanDto.state_id);
      throw new BadRequestException({
        type: 'error',
        message: 'State code (mplan_state_code) not found. Please configure it in State Management.',
      });
    }

    const stateCode = state.mplanStateCode.replace(/\s/g, '%20');
    const url = `${api.apiUrl}plans.php?apikey=${api.apiKey}&operator=${apiProviderCode.providerCode}&cricle=${stateCode}`;
    const orderId = `ROP${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    console.log('Constructed URL:', url);
    console.log('Order ID:', orderId);

    try {
      const result = await this.httpHelper.curl(
        url,
        'GET',
        '',
        {},
        'yes',
        'Plans',
        orderId,
      );

      console.log('API Response:', {
        hasResponse: !!result.response,
        responseLength: result.response?.length || 0,
        httpCode: result.code,
        hasError: !!result.error,
        error: result.error || 'none',
      });

      if (!result.response || result.code === 0) {
        console.error('API Call Failed:', {
          code: result.code,
          error: result.error,
          response: result.response?.substring(0, 200) || 'NO RESPONSE',
        });
        throw new BadRequestException({
          type: 'error',
          message: 'Something went wrong',
        });
      }

      let data: any;
      try {
        data = typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
        console.log('Parsed Response Data:', JSON.stringify(data, null, 2));
        console.log('Records Count:', data?.records?.length || 0);
        console.log('Records:', data?.records || 'NO RECORDS');
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw Response:', result.response?.substring(0, 500));
        throw new BadRequestException({
          type: 'error',
          message: 'Invalid response format',
        });
      }

      return {
        type: 'success',
        message: 'Fatch Successfully',
        data: data.records || [],
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Something went wrong',
      });
    }
  }

  async dthInfo(dthInfoDto: DthInfoDto) {
    // Use API ID 6 for DTH info
    const api = await this.apiRepository.findOne({
      where: { id: 6 },
    });

    if (!api || api.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'DTH info service is not available',
      });
    }

    // Get provider code
    const apiProviderCode = await this.apiProviderCodeRepository.findOne({
      where: {
        apiId: 6,
        providerId: dthInfoDto.provider_id,
      },
    });

    if (!apiProviderCode || !apiProviderCode.providerCode) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider code not found',
      });
    }

    const url = `${api.apiUrl}Dthinfo.php?apikey=${api.apiKey}&operator=${apiProviderCode.providerCode}&offer=roffer&tel=${dthInfoDto.number}`;
    const orderId = `DTH${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    try {
      const result = await this.httpHelper.curl(
        url,
        'GET',
        '',
        {},
        'yes',
        'DTH INFO',
        orderId,
      );

      if (!result.response || result.code === 0) {
        throw new BadRequestException({
          type: 'error',
          message: 'Something went wrong',
        });
      }

      let data: any;
      try {
        data = typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
      } catch {
        throw new BadRequestException({
          type: 'error',
          message: 'Invalid response format',
        });
      }

      const records = data.records || [];
      console.log('Returning Plans:', {
        totalRecords: records.length,
        filteredRecords: records.filter((r: any) => r.rs && r.rs !== '0' && r.rs !== '').length,
      });

      return {
        type: 'success',
        message: 'Fatch Successfully',
        data: records,
      };
    } catch (error: any) {
      console.error('Plans API Exception:', {
        errorType: error.constructor.name,
        message: error.message,
        stack: error.stack?.substring(0, 500),
      });
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Something went wrong',
      });
    }
  }

  async dthHeavyRefresh(dthHeavyRefreshDto: DthHeavyRefreshDto) {
    // Use API ID 6 for DTH heavy refresh
    const api = await this.apiRepository.findOne({
      where: { id: 6 },
    });

    if (!api || api.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'DTH refresh service is not available',
      });
    }

    // Get provider code
    const apiProviderCode = await this.apiProviderCodeRepository.findOne({
      where: {
        apiId: 6,
        providerId: dthHeavyRefreshDto.provider_id,
      },
    });

    if (!apiProviderCode || !apiProviderCode.providerCode) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider code not found',
      });
    }

    const url = `${api.apiUrl}Dthheavy.php?apikey=${api.apiKey}&operator=${apiProviderCode.providerCode}&offer=roffer&tel=${dthHeavyRefreshDto.number}`;
    const orderId = `DTHR${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    try {
      const result = await this.httpHelper.curl(
        url,
        'GET',
        '',
        {},
        'yes',
        'DTH INFO',
        orderId,
      );

      if (!result.response || result.code === 0) {
        throw new BadRequestException({
          type: 'error',
          message: 'Something went wrong',
        });
      }

      let data: any;
      try {
        data = typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
      } catch {
        throw new BadRequestException({
          type: 'error',
          message: 'Invalid response format',
        });
      }

      return {
        type: 'success',
        message: 'Fatch Successfully',
        data: data.records || [],
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Something went wrong',
      });
    }
  }
}
