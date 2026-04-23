import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, FitType } from 'src/generated/prisma/client';

export class OrderReviewDto {
  @ApiProperty({ example: '714e3324-693e-410e-89af-7ea4b7043bae' })
  id!: string;

  @ApiProperty({ example: '2461c48c-36e9-4a61-a2fa-22e0a0c2a6cf' })
  productId!: string;

  @ApiProperty({ example: '52765681-235c-48f3-b711-11cdad4d3336' })
  userId!: string;

  @ApiProperty({ example: '3d864871-47ac-45c2-ae05-32cea49f9c4c' })
  orderItemId!: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiProperty({
    example: 'Kebayanya indah banget, sulamannya halus dan detail.',
  })
  comment!: string;

  @ApiProperty({ enum: FitType, example: 'true' })
  fit!: string;

  @ApiProperty({ example: 84 })
  bustCm!: number;

  @ApiProperty({ example: 68 })
  waistCm!: number;

  @ApiProperty({ example: 89 })
  hipsCm!: number;

  @ApiProperty({ type: [String], example: [] })
  mediaUrls!: string[];

  @ApiProperty({ example: 0 })
  helpfulCount!: number;

  @ApiProperty({ example: false })
  isEdited!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class OrderItemDto {
  @ApiProperty({ example: '3d864871-47ac-45c2-ae05-32cea49f9c4c' })
  id!: string;

  @ApiProperty({ example: 'fefb2e8a-57e3-457b-98e2-a5b10beac7c4' })
  orderId!: string;

  @ApiProperty({ example: '2461c48c-36e9-4a61-a2fa-22e0a0c2a6cf' })
  productId!: string;

  @ApiProperty({ example: 'Embroidered Kebaya' })
  productName!: string;

  @ApiProperty({ example: 'XS' })
  size!: string;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: '2026-01-10T00:00:00.000Z' })
  startDate!: Date;

  @ApiProperty({ example: 3 })
  rentalDays!: number;

  @ApiProperty({ example: '2026-01-13T00:00:00.000Z' })
  endDate!: Date;

  @ApiProperty({ example: 600000 })
  subtotal!: number;

  @ApiPropertyOptional({ type: OrderReviewDto })
  review?: OrderReviewDto;
}

export class OrderDetailDto {
  @ApiProperty({ example: 'fefb2e8a-57e3-457b-98e2-a5b10beac7c4' })
  id!: string;

  @ApiProperty({ example: '52765681-235c-48f3-b711-11cdad4d3336' })
  userId!: string;

  @ApiProperty({ enum: OrderStatus, example: 'COMPLETED' })
  status!: OrderStatus;

  @ApiProperty({ example: 'Jl. Contoh No. 1, Jakarta' })
  shippingAddress!: string;

  @ApiProperty({ example: 'JNE Regular (2-3 days)' })
  courierLabel!: string;

  @ApiProperty({ example: 'REG' })
  courierService!: string;

  @ApiProperty({ example: 18000 })
  shippingCost!: number;

  @ApiProperty({ example: 618000 })
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

class PaginatedOrdersDto {
  @ApiProperty({ type: [OrderDetailDto] })
  data!: OrderDetailDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class GetOrdersResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: PaginatedOrdersDto })
  data!: PaginatedOrdersDto;
}

// 3. Response for GET /orders/:id
export class GetOrderByIdResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: OrderDetailDto })
  data!: OrderDetailDto;
}
