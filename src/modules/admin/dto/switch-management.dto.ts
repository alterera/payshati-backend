import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class ListSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;
}

export class GetSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

// Amount-wise Switch DTOs
export class CreateAmountWizeSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  service_id: number;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsString()
  @IsNotEmpty()
  amount_switch: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateAmountWizeSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsString()
  @IsNotEmpty()
  amount_switch: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

// State-wise Switch DTOs
export class CreateStateWizeSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  service_id: number;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsNumber()
  @IsNotEmpty()
  state_id: number;

  @IsString()
  @IsNotEmpty()
  amount_switch: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateStateWizeSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsString()
  @IsNotEmpty()
  amount_switch: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

// User-wise Switch DTOs
export class CreateUserWizeSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  id_value: number; // user_id

  @IsNumber()
  @IsNotEmpty()
  service_id: number;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsNumber()
  @IsNotEmpty()
  state_id: number;

  @IsString()
  @IsNotEmpty()
  amount_switch: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateUserWizeSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsNumber()
  @IsNotEmpty()
  api_id: number;

  @IsString()
  @IsNotEmpty()
  amount_switch: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class DeleteSwitchDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
