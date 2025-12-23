import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';

// Account Reports DTOs
export class ListAccountReportDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['All', 'Transfer Money', 'Receive Money', 'Upi Add Money', 'Self Money', 'Reverse Money', 'Money Reverse', 'Commission', 'Recharge', 'Reverse Commission', 'Refund', 'Money Transfer'])
  tr_type: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['All', 'Credit', 'Debit'])
  fund_type: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  tbl_type?: number;
}

// Recharge Reports DTOs
export class ListRechargeReportDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsOptional()
  order_id?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsNumber()
  @IsOptional()
  service_id?: number;

  @IsNumber()
  @IsOptional()
  provider_id?: number;

  @IsNumber()
  @IsOptional()
  api_id?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  complaint_id?: string;

  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  tbl_type?: number;
}

export class GetProviderDto {
  @IsNumber()
  @IsOptional()
  service_id?: number;
}

export class GetApisDto {
  @IsNumber()
  @IsOptional()
  provider_id?: number;
}

export class ChangeOperatorIdDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  operator_id: string;
}

export class GetComplaintDto {
  @IsNumber()
  @IsNotEmpty()
  report_id: number;
}

export class UpdateComplaintDto {
  @IsNumber()
  @IsNotEmpty()
  report_id: number;

  @IsString()
  @IsNotEmpty()
  complaint_status: string;

  @IsString()
  @IsOptional()
  complaint_remark?: string;
}

export class UpdateStatusDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Success', 'Failed', 'Pending', 'Refund'])
  status: string;
}

export class CheckApiLogsDto {
  @IsNumber()
  @IsNotEmpty()
  report_id: number;
}

// Admin Reports DTOs
export class LiveRechargeReportsDto {
  // No parameters needed, returns last 25 records
}

export class UserSaleReportDto {
  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;
}

export class MdDtSaleReportDto {
  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;
}

export class ProviderSaleReportDto {
  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  provider_id?: number;
}

export class ApiSaleReportDto {
  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  api_id?: number;
}

export class ApiLogReportDto {
  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsNumber()
  @IsOptional()
  api_id?: number;
}

export class SearchUserDto {
  @IsString()
  @IsNotEmpty()
  search: string;
}
