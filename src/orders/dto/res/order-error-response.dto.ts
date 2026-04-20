import { ApiProperty } from '@nestjs/swagger';

// 6. Courier Not Found (Orders)
class CourierNotFoundDetail {
  @ApiProperty({ example: 'NOT_FOUND' }) code!: string;
  @ApiProperty({ example: 'Courier option not found' }) message!: string;
}
export class CourierNotFoundErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: CourierNotFoundDetail }) error!: CourierNotFoundDetail;
}

// 7. Cart Empty (Orders)
class CartEmptyDetail {
  @ApiProperty({ example: 'CART_EMPTY' }) code!: string;
  @ApiProperty({ example: 'Cart is empty' }) message!: string;
}
export class CartEmptyErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: CartEmptyDetail }) error!: CartEmptyDetail;
}

// 8. Order Not Found (Orders)
class OrderNotFoundDetail {
  @ApiProperty({ example: 'NOT_FOUND' }) code!: string;
  @ApiProperty({ example: 'Order not found' }) message!: string;
}
export class OrderNotFoundErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: OrderNotFoundDetail }) error!: OrderNotFoundDetail;
}

class DateUnavailableDetail {
  @ApiProperty({ example: 'DATE_UNAVAILABLE' }) code!: string;
  @ApiProperty({
    example: 'Selected size is no longer available on the selected dates',
  })
  message!: string;
}
export class DateUnavailableErrorDto {
  @ApiProperty({ example: false }) success!: boolean;
  @ApiProperty({ type: DateUnavailableDetail }) error!: DateUnavailableDetail;
}
