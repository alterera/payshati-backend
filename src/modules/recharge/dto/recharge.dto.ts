import {
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { BaseUserDto } from '../../auth/dto/base-user.dto';

export class RechargeDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsNumber()
  @IsNotEmpty()
  service_id: number;

  @IsNumber()
  @IsOptional()
  state_id?: number;

  @IsString()
  @IsNotEmpty()
  @Length(8, 12)
  number: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'pin must be 4 digits' })
  pin: string;
}

export class CheckMobileDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'number must be 10 digits' })
  number: string;
}

export class CheckRofferDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsString()
  @IsNotEmpty()
  @Length(8, 12)
  number: string;
}

export class CheckViewPlanDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsNumber()
  @IsNotEmpty()
  state_id: number;
}

export class DthInfoDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsString()
  @IsNotEmpty()
  number: string;
}

export class DthHeavyRefreshDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsString()
  @IsNotEmpty()
  number: string;
}

export class RechargeReceiptDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;
}
