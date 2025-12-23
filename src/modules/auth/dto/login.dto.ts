import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'mobile_number must be 10 digits' })
  mobile_number: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  password: string;
}

export class LoginOtpDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
  otp: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'mobile_number must be 10 digits' })
  mobile_number: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' })
  email_address: string;

  @IsString()
  @IsNotEmpty()
  city_name: string;
}

export class VerifyOtpRegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'mobile_number must be 10 digits' })
  mobile_number: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
  otp: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, { message: 'mobile_number must be 10 digits' })
  mobile_number: string;
}

export class ResetPasswordOtpDto extends ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
  otp: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(8)
  current_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  new_password: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  confirm_password: string;
}

export class ChangePinDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'current_pin must be 4 digits' })
  current_pin: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'new_pin must be 4 digits' })
  new_pin: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'confirm_pin must be 4 digits' })
  confirm_pin: string;
}
