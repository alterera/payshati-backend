import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { BaseAdminDto } from './base-admin.dto';

export class CreateApiDto extends BaseAdminDto {
  @IsString()
  @IsNotEmpty()
  apiName: string;

  @IsString()
  @IsNotEmpty()
  api_username: string;

  @IsString()
  @IsNotEmpty()
  api_password: string;

  @IsString()
  @IsNotEmpty()
  api_key: string;

  @IsString()
  @IsNotEmpty()
  api_url: string;

  @IsString()
  @IsNotEmpty()
  balance_check_url: string;

  @IsString()
  @IsOptional()
  complaint_api_url?: string;

  @IsString()
  @IsOptional()
  complaint_api_method?: string;

  @IsString()
  @IsOptional()
  complaint_status_value?: string;

  @IsString()
  @IsOptional()
  refund_value?: string;

  @IsString()
  @IsOptional()
  complaint_success_value?: string;

  @IsString()
  @IsOptional()
  complaint_failed_value?: string;

  @IsString()
  @IsOptional()
  complaint_callback_status_value?: string;

  @IsString()
  @IsOptional()
  complaint_callback_success_value?: string;

  @IsString()
  @IsOptional()
  complaint_callback_failed_value?: string;

  @IsString()
  @IsOptional()
  complaint_callback_remark?: string;

  @IsString()
  @IsOptional()
  complaint_callback_api_method?: string;

  @IsString()
  @IsOptional()
  callback_refund_value?: string;

  @IsString()
  @IsNotEmpty()
  status_value: string;

  @IsString()
  @IsNotEmpty()
  success_value: string;

  @IsString()
  @IsNotEmpty()
  failed_value: string;

  @IsString()
  @IsOptional()
  pending_value?: string;

  @IsString()
  @IsOptional()
  error_value?: string;

  @IsString()
  @IsOptional()
  error_value_response?: string;

  @IsString()
  @IsNotEmpty()
  order_id_value: string;

  @IsString()
  @IsNotEmpty()
  operator_id_value: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'DELETE'])
  api_method: string;

  @IsString()
  @IsNotEmpty()
  api_format: string;

  @IsString()
  @IsNotEmpty()
  callback_status_value: string;

  @IsString()
  @IsNotEmpty()
  callback_success_value: string;

  @IsString()
  @IsNotEmpty()
  callback_failed_value: string;

  @IsString()
  @IsNotEmpty()
  callback_order_id_value: string;

  @IsString()
  @IsNotEmpty()
  callback_operator_id_value: string;

  @IsString()
  @IsNotEmpty()
  callback_remark: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'DELETE'])
  callback_api_method: string;

  @IsString()
  @IsNotEmpty()
  api_type: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateApiDto extends CreateApiDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class GetApiDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class DeleteApiDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class GetProviderCodesDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  service: number;
}

export class UpdateProviderCodeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsString()
  @IsNotEmpty()
  provider_code: string;
}

export class BulkUpdateProviderCodeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsNumber({}, { each: true })
  @IsNotEmpty()
  provider_id: number[];

  @IsString({ each: true })
  @IsNotEmpty()
  provider_code: string[];
}

export class GetStateCodesDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateStateCodeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsNumber()
  @IsNotEmpty()
  state_id: number;

  @IsString()
  @IsNotEmpty()
  state_code: string;
}

export class BulkUpdateStateCodeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  state_api_id: number;

  @IsNumber({}, { each: true })
  @IsNotEmpty()
  state_id: number[];

  @IsString({ each: true })
  @IsNotEmpty()
  state_code: string[];
}

export class CheckBalanceDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
