import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * Base DTO class for all admin endpoints
 * Includes optional login_key and user_id fields that are added by the frontend
 * but validated before the AdminGuard checks them
 */
export class BaseAdminDto {
  @IsString()
  @IsOptional()
  login_key?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;
}

