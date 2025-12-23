import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class ListAmountBlockDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;
}

export class GetAmountBlockDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateAmountBlockDto {
  @IsNumber()
  @IsNotEmpty()
  service_id: number;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsString()
  @IsNotEmpty()
  amount_block: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateAmountBlockDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  amount_block: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class DeleteAmountBlockDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
