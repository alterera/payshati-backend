import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { BaseAdminDto } from './base-admin.dto';

export class ListBankDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;
}

export class GetBankDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateBankDto extends BaseAdminDto {
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  account_number: string;

  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @IsString()
  @IsNotEmpty()
  bank_branch: string;

  @IsString()
  @IsNotEmpty()
  ifsc_code: string;

  @IsString()
  @IsNotEmpty()
  account_type: string;

  @IsString()
  @IsOptional()
  bank_logo?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateBankDto extends CreateBankDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsOptional()
  old_bank_logo?: string;
}

export class DeleteBankDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
