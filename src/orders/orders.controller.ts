import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/req/checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from 'src/generated/prisma/client';
import {
  CheckoutResponseDto,
  GetOrderByIdResponseDto,
  GetOrdersResponseDto,
} from 'src/orders/dto/res/order-response.dto';
import {
  CartEmptyErrorDto,
  CourierNotFoundErrorDto,
  DateUnavailableErrorDto,
  OrderNotFoundErrorDto,
} from 'src/orders/dto/res/order-error-response.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Convert cart items into a finalized order' })
  @ApiCreatedResponse({
    description: 'The order has been successfully created and cart cleared.',
    type: CheckoutResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Cart is empty.',
    type: CartEmptyErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Courier option not found.',
    type: CourierNotFoundErrorDto,
  })
  @ApiConflictResponse({
    description:
      'One or more items are no longer available for the selected dates.',
    type: DateUnavailableErrorDto,
  })
  async checkout(@CurrentUser() user: User, @Body() dto: CheckoutDto) {
    return {
      success: true,
      data: await this.orders.checkout(user.id, dto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Returns a paginated list of orders.',
    type: GetOrdersResponseDto,
  })
  async findAll(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.orders.findAll(user.id, page, limit);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed information for a specific order' })
  @ApiOkResponse({
    description: 'Returns the order details including items.',
    type: GetOrderByIdResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found.',
    type: OrderNotFoundErrorDto,
  })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return {
      success: true,
      data: await this.orders.findOne(user.id, id),
    };
  }
}
