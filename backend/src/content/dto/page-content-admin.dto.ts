import { ApiProperty } from '@nestjs/swagger';
import { ContentItemDto } from './content-item.dto';

export class ContentPageSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ type: [String] })
  fields!: string[];
}

export class PageContentAdminDto {
  @ApiProperty()
  entityId!: string;

  @ApiProperty({ type: [ContentItemDto] })
  items!: ContentItemDto[];
}
