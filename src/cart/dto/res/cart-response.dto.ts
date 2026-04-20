import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: 'cart-item-uuid' })
  id!: string;

  @ApiProperty({ example: 'product-uuid' })
  productId!: string;

  @ApiProperty({ example: 'Winter Hiking Jacket' })
  productName!: string;

  @ApiProperty({ example: 'https://example.com/jacket-1.jpg' })
  productImage!: string;

  @ApiProperty({ example: 'M' })
  size!: string;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: '2024-12-25' })
  startDate!: string;

  @ApiProperty({ example: 3 })
  rentalDays!: number;

  @ApiProperty({ example: '2024-12-27' })
  endDate!: string;

  @ApiProperty({ example: 35000 })
  pricePerDay!: number;

  @ApiProperty({ example: 105000 })
  subtotal!: number;
}

export class CartDataDto {
  @ApiProperty({ type: [CartItemDto] })
  items!: CartItemDto[];

  @ApiProperty({ example: 105000 })
  total!: number;
}

export class GetCartResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: CartDataDto })
  data!: CartDataDto;
}

export class AddCartItemResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty()
  data!: CartItemDto;
}

export class UpdateCartItemResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty()
  data!: CartItemDto;
}

class RemoveCartMessageDto {
  @ApiProperty({ example: 'Item removed from cart' })
  message!: string;
}

export class RemoveCartItemResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: RemoveCartMessageDto })
  data!: RemoveCartMessageDto;
}
