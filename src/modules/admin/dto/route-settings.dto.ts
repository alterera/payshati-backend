import {
  IsNumber,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class ListRouteSettingsDto {
  // No parameters needed
}

export class UpdatePriorityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  _route_id: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  edit_priority: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  edit_status: number[];
}
