import {
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  current_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirm_password: string;
}
