import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

// Announcement DTOs
export class GetAnnouncementDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  announcement: string;
}

// Slider DTOs
export class ListSliderDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  limit: number;
}

export class GetSliderDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class CreateSliderDto {
  @IsString()
  @IsNotEmpty()
  slider_title: string;

  @IsString()
  @IsOptional()
  slider_image?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateSliderDto {
  @IsNumber()
  @IsNotEmpty()
  edit_id: number;

  @IsString()
  @IsNotEmpty()
  slider_title: string;

  @IsString()
  @IsOptional()
  slider_image?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  status: number;
}

export class DeleteSliderDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
