import {
  IsNumber,
  IsNotEmpty,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { BaseAdminDto } from './base-admin.dto';

export class ListServiceDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  limit: number;
}

export class GetServiceDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateServiceDto extends BaseAdminDto {
  @IsString()
  @IsNotEmpty()
  service_name: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateServiceDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  service_name: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class DeleteServiceDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
