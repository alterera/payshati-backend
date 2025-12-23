import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class HomeDto extends BaseUserDto {
  // No additional fields required for home endpoint
}

export class MyCommissionDto extends BaseUserDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsNumber()
  @IsOptional()
  service_id?: number;
}

