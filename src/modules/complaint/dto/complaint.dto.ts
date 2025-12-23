import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { BaseUserDto } from '../../auth/dto/base-user.dto';

export class SubmitComplaintDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  subject: string;
}

export class ListComplaintDto extends BaseUserDto {
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

export class GetComplaintReportDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

