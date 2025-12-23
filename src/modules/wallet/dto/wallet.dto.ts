import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { BaseUserDto } from '../../auth/dto/base-user.dto';

export class AddMoneyDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;
}

export class TransferFundDto extends BaseUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number; // recipient user id

  @IsString()
  @IsNotEmpty()
  type: string; // Should be "Transfer"

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  remark: string;
}
