import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EstimateShipmentDto {
  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main St, City, Country',
  })
  @IsString()
  shippingAddress!: string;

  @ApiProperty({
    description: 'Courier ID',
    example: 'jne-reg',
  })
  @IsString()
  courierId!: string;
}
