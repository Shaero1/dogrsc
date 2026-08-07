import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ContentItemDto } from './content-item.dto';

export class UpsertPageContentDto {
  @ApiProperty({ type: [ContentItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  items!: ContentItemDto[];
}
