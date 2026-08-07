import { ApiProperty } from '@nestjs/swagger';

export class PageContentPublicDto {
  @ApiProperty()
  entityId!: string;

  @ApiProperty()
  locale!: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  fields!: Record<string, string>;
}
