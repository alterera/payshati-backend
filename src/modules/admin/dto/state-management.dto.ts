import {
  IsNumber,
  IsNotEmpty,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';
import { BaseAdminDto } from './base-admin.dto';

export class ListStateDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  limit: number;
}

export class GetStateDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateStateDto extends BaseAdminDto {
  @IsString()
  @IsNotEmpty()
  state_name: string;

  @IsString()
  @IsOptional()
  plan_api_code?: string;

  @IsString()
  @IsOptional()
  mplan_state_code?: string;

  @IsNumber()
  @Min(0)
  status: number;
}

export class UpdateStateDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  state_name: string;

  @IsString()
  @IsOptional()
  plan_api_code?: string;

  @IsString()
  @IsOptional()
  mplan_state_code?: string;

  @IsNumber()
  @Min(0)
  status: number;
}

export class DeleteStateDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

