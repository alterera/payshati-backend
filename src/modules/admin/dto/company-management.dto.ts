import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEmail,
  Min,
  Max,
} from 'class-validator';

export class ListCompanyDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;
}

export class GetCompanyDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateCompanyDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsNotEmpty()
  company_name: string;

  @IsString()
  @IsNotEmpty()
  support_number: string;

  @IsString()
  @IsOptional()
  support_number_2?: string;

  @IsEmail()
  @IsNotEmpty()
  support_email: string;

  @IsString()
  @IsNotEmpty()
  company_address: string;

  @IsNumber()
  @IsOptional()
  self_register?: number;

  @IsNumber()
  @IsOptional()
  email_message?: number;

  @IsString()
  @IsOptional()
  company_logo?: string;

  @IsString()
  @IsOptional()
  company_icon?: string;

  @IsString()
  @IsOptional()
  invoice_logo?: string;

  @IsString()
  @IsOptional()
  old_company_logo?: string;

  @IsString()
  @IsOptional()
  old_company_icon?: string;

  @IsString()
  @IsOptional()
  old_invoice_logo?: string;

  @IsString()
  @IsOptional()
  apk_file_name?: string;

  @IsString()
  @IsOptional()
  payment_gateway?: string;

  @IsString()
  @IsOptional()
  payment_gateway_min?: string;

  @IsString()
  @IsOptional()
  payment_gateway_max?: string;

  @IsString()
  @IsOptional()
  payment_gateway_key?: string;

  @IsString()
  @IsOptional()
  payment_gateway2?: string;

  @IsString()
  @IsOptional()
  payment_gateway2_min?: string;

  @IsString()
  @IsOptional()
  payment_gateway2_max?: string;

  @IsString()
  @IsOptional()
  payment_gateway2_key?: string;

  @IsString()
  @IsNotEmpty()
  sms_api_method: string;

  @IsString()
  @IsNotEmpty()
  sms_request_url: string;

  @IsString()
  @IsNotEmpty()
  whatsapp_api_method: string;

  @IsString()
  @IsNotEmpty()
  whatsapp_request_url: string;

  @IsString()
  @IsNotEmpty()
  meta_kewords: string;

  @IsString()
  @IsNotEmpty()
  refund_policy: string;

  @IsString()
  @IsNotEmpty()
  privacy_policy: string;

  @IsString()
  @IsNotEmpty()
  terms_and_conditions: string;

  @IsString()
  @IsNotEmpty()
  header_value: string;

  @IsString()
  @IsNotEmpty()
  footer_value: string;
}
