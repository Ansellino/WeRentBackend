import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/generated/prisma/client';

export class OrderItemDto {
  @ApiProperty({ example: 'item-uuid' })
  id!: string;

  @ApiProperty({ example: 'order-uuid' })
  orderId!: string;

  @ApiProperty({ example: 'product-uuid' })
  productId!: string;

  @ApiProperty({ example: 'Winter Hiking Jacket' })
  productName!: string;

  @ApiProperty({ example: 'M' })
  size!: string;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: '2024-12-25T00:00:00.000Z' })
  startDate!: Date;

  @ApiProperty({ example: 3 })
  rentalDays!: number;

  @ApiProperty({ example: '2024-12-27T00:00:00.000Z' })
  endDate!: Date;

  @ApiProperty({ example: 105000 })
  subtotal!: number;
}

export class OrderDetailDto {
  @ApiProperty({ example: 'order-uuid' })
  id!: string;

  @ApiProperty({ example: 'user-uuid' })
  userId!: string;

  @ApiProperty({ enum: OrderStatus, example: 'COMPLETED' })
  status!: OrderStatus;

  @ApiProperty({ example: '123 Adventure Lane, Cityville' })
  shippingAddress!: string;

  @ApiProperty({ example: 'JNE Regular (2–3 days)' })
  courierLabel!: string;

  @ApiProperty({ example: 'REG' })
  courierService!: string;

  @ApiProperty({ example: 18000 })
  shippingCost!: number;

  @ApiProperty({ example: 123000 })
  total!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [OrderItemDto] })
  items!: OrderItemDto[];
}

// 1. Response for POST /orders/checkout
export class CheckoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: OrderDetailDto })
  data!: OrderDetailDto;
}

// 2. Response for GET /orders (Paginated)
class PaginationMetaDto {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 50 }) total!: number;
}

export class GetOrdersResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [OrderDetailDto] })
  data!: OrderDetailDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

// 3. Response for GET /orders/:id
export class GetOrderByIdResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: OrderDetailDto })
  data!: OrderDetailDto;
}
