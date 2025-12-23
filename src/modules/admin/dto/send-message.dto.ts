import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['SMS', 'EMAIL', 'WHATSAPP'])
  msg_source: string;

  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsNumber()
  @IsOptional()
  role_id?: number;

  @IsString()
  @IsNotEmpty()
  message_text: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  tmp_id?: string;
}
