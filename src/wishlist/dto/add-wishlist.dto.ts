import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistDto {
  @ApiProperty({
    type: 'string',
    description: 'The ID of the product to add to wishlist',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  productId!: string;
}
