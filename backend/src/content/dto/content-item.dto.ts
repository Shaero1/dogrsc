import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';
import { CONTENT_LOCALES } from '../content-pages.manifest';

export class ContentItemDto {
  @ApiProperty({ enum: CONTENT_LOCALES })
  @IsIn([...CONTENT_LOCALES])
  locale!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  field!: string;

  @ApiProperty()
  @IsString()
  value!: string;
}
