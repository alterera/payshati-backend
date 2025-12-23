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

export class ListProviderDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  limit: number;
}

export class GetProviderDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateProviderDto extends BaseAdminDto {
  @IsString()
  @IsNotEmpty()
  provider_name: string;

  @IsNumber()
  @IsNotEmpty()
  service_name: number;

  @IsNumber()
  @IsNotEmpty()
  api_name: number;

  @IsNumber()
  @IsOptional()
  backup_api_name?: number;

  @IsNumber()
  @IsOptional()
  backup_api2_name?: number;

  @IsNumber()
  @IsOptional()
  backup_api3_name?: number;

  @IsString()
  @IsOptional()
  minium_amount?: string;

  @IsString()
  @IsOptional()
  maxium_amount?: string;

  @IsNumber()
  @IsOptional()
  provider_down?: number;

  @IsString()
  @IsOptional()
  amount_type?: string;

  @IsString()
  @IsOptional()
  amount_value?: string;

  @IsString()
  @IsOptional()
  provider_logo?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateProviderDto extends CreateProviderDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsOptional()
  old_provider_logo?: string;
}

export class DeleteProviderDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
