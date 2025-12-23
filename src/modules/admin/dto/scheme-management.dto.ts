import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { BaseAdminDto } from './base-admin.dto';

export class ListSchemeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  limit: number;
}

export class GetSchemeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateSchemeDto extends BaseAdminDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s\-]+$/, { message: 'Scheme name must contain only letters, spaces, and hyphens' })
  schemeName: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateSchemeDto extends CreateSchemeDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;
}

export class DeleteSchemeDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class GetCommissionDataDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  service: number;
}

export class SingleUpdateCommissionDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsNumber()
  @IsNotEmpty()
  scheme_id: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Commission Flat', 'Commission Percent', 'Charge Flat', 'Charge Percent'])
  wt_comtype: string;

  @IsString()
  @IsNotEmpty()
  wt_value: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Commission Flat', 'Commission Percent', 'Charge Flat', 'Charge Percent'])
  md_comtype: string;

  @IsString()
  @IsNotEmpty()
  md_value: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Commission Flat', 'Commission Percent', 'Charge Flat', 'Charge Percent'])
  dt_comtype: string;

  @IsString()
  @IsNotEmpty()
  dt_value: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Commission Flat', 'Commission Percent', 'Charge Flat', 'Charge Percent'])
  rt_comtype: string;

  @IsString()
  @IsNotEmpty()
  rt_value: string;
}

export class BulkUpdateCommissionDto extends BaseAdminDto {
  @IsNumber()
  @IsNotEmpty()
  scheme_id: number;

  @IsNumber({}, { each: true })
  @IsNotEmpty()
  provider_id: number[];

  @IsString({ each: true })
  @IsNotEmpty()
  wt_comtype: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  wt_value: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  md_comtype: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  md_value: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  dt_comtype: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  dt_value: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  rt_comtype: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  rt_value: string[];
}
