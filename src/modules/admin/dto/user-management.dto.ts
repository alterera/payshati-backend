import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEmail,
  IsIn,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ListUserDto {
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
  role_id?: number;

  @IsNumber()
  @IsOptional()
  parent_id?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  kyc_status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class GetUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class ParentListSearchDto {
  @IsString()
  @IsNotEmpty()
  search: string;
}

export class CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
  parent_id: number;

  @IsNumber()
  @IsNotEmpty()
  role_id: number;

  @IsNumber()
  @IsNotEmpty()
  scheme_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  outlet_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  first_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(70)
  middle_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(70)
  last_name?: string;

  @IsString()
  @IsNotEmpty()
  date_of_birth: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10)
  mobile_number: string;

  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  login_type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  gender: string;

  @IsString()
  @IsOptional()
  flat_door_no?: string;

  @IsString()
  @IsOptional()
  road_street?: string;

  @IsString()
  @IsNotEmpty()
  area_locality: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsNumber()
  @IsNotEmpty()
  minium_balance: number;

  @IsString()
  @IsNotEmpty()
  kyc_status: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  bank_account_number: string;

  @IsString()
  @IsNotEmpty()
  branch_name: string;

  @IsString()
  @IsNotEmpty()
  ifsc_code: string;

  @IsString()
  @IsNotEmpty()
  bank_account_type: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  callback_url?: string;

  @IsString()
  @IsOptional()
  complaint_callback_url?: string;

  @IsString()
  @IsOptional()
  profile_pic?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateUserDto extends CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsOptional()
  old_profile_pic?: string;
}

export class DeleteUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class FundUpdateDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Transfer', 'Reverse'])
  type: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  remark: string;
}

export class ResetPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class ResetPinDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
