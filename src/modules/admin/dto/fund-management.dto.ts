import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class ListFundRequestDto {
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
  @IsIn(['All', 'Pending', 'Transferred', 'Rejected'])
  status: string;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsOptional()
  order_id?: string;

  @IsString()
  @IsOptional()
  path?: string;

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

export class SearchUserDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;
}

export class UpdateFundRequestDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  remark: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Approved', 'Rejected'])
  status: string;
}

export class ListFundReportDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

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
