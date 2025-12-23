import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

// Email Template DTOs
export class ListEmailTemplateDto {
  // No pagination needed, returns all templates
}

export class GetEmailTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateEmailTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class DeleteEmailTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

// SMS Template DTOs
export class ListSmsTemplateDto {
  // No pagination needed, returns all templates
}

export class GetSmsTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateSmsTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  template_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class DeleteSmsTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
