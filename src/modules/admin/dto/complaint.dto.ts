import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class ListComplaintDto {
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
  @IsIn(['All', 'Open', 'Closed', 'Sloved', 'Under Review'])
  status: string;

  @IsString()
  @IsOptional()
  request_id?: string;

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

export class GetComplaintReportDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
