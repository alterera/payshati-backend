import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * Base DTO class for all user-facing endpoints
 * Includes optional login_key and user_id fields that are added by the frontend
 * but validated before the AppUserGuard checks them
 */
export class BaseUserDto {
  @IsString()
  @IsOptional()
  login_key?: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;
}

