import { ApiProperty } from '@nestjs/swagger';

// 1. Product Not Found
class ProductNotFoundDetail {
  @ApiProperty({ example: 'NOT_FOUND' }) code!: string;
  @ApiProperty({ example: 'Product not found' }) message!: string;
}
export class ProductNotFoundErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: ProductNotFoundDetail }) error!: ProductNotFoundDetail;
}

// 2. Cart Item Not Found
class CartItemNotFoundDetail {
  @ApiProperty({ example: 'NOT_FOUND' }) code!: string;
  @ApiProperty({ example: 'Cart item not found' }) message!: string;
}
export class CartItemNotFoundErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: CartItemNotFoundDetail }) error!: CartItemNotFoundDetail;
}

// 3. Invalid Size
class InvalidSizeDetail {
  @ApiProperty({ example: 'INVALID_SIZE' }) code!: string;
  @ApiProperty({ example: 'Size not available for the selected product.' })
  message!: string;
}
export class InvalidSizeErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: InvalidSizeDetail }) error!: InvalidSizeDetail;
}

// 4. Date Unavailable (Overlap with existing orders)
class DateUnavailableDetail {
  @ApiProperty({ example: 'DATE_UNAVAILABLE' }) code!: string;
  @ApiProperty({ example: 'Selected size is not available on requested dates' })
  message!: string;
}
export class DateUnavailableErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: DateUnavailableDetail }) error!: DateUnavailableDetail;
}

// 5. Cart Conflict (Overlap within the user's own cart)
class CartConflictDetail {
  @ApiProperty({ example: 'CART_CONFLICT' }) code!: string;
  @ApiProperty({
    example:
      'You already have an overlapping rental for this item in your cart',
  })
  message!: string;
}
export class CartConflictErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: CartConflictDetail }) error!: CartConflictDetail;
}
