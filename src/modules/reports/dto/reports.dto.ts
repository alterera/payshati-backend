import { IsNumber, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';
import { BaseUserDto } from '../../auth/dto/base-user.dto';

export class RechargeReportsDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;

  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsString()
  @IsOptional()
  order_id?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  req_order_id?: string;

  @IsNumber()
  @IsOptional()
  tbl_type?: number;
}

export class FundReportsDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;

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

export class AccountReportsDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;

  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @IsString()
  @IsOptional()
  transaction_type?: string;

  @IsNumber()
  @IsOptional()
  tbl_type?: number;
}

