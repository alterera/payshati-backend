import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { BaseUserDto } from '../../auth/dto/base-user.dto';

export class SubmitFundRequestDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  bank_id: number;

  @IsString()
  @IsNotEmpty()
  transfer_mode: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  transaction_number: string;

  @IsString()
  @IsNotEmpty()
  remark: string;

  @IsString()
  @IsOptional()
  slip_image?: string;
}

export class ListFundRequestDto extends BaseUserDto {
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

