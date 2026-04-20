import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/req/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/req/update-cart-item.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { User } from 'src/generated/prisma/client';
import {
  AddCartItemResponseDto,
  GetCartResponseDto,
  RemoveCartItemResponseDto,
  UpdateCartItemResponseDto,
} from 'src/cart/dto/res/cart-response.dto';
import {
  CartItemNotFoundErrorDto,
  DateUnavailableErrorDto,
  InvalidSizeErrorDto,
  ProductNotFoundErrorDto,
} from 'src/cart/dto/res/cart-error-response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's shopping cart" })
  @ApiOkResponse({
    description:
      'Returns the cart and all included items with total price calculation.',
    type: GetCartResponseDto,
  })
  async getCart(@CurrentUser() user: User) {
    return {
      success: true,
      data: await this.cart.getCart(user.id),
    };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a new item to the cart' })
  @ApiCreatedResponse({
    description:
      'The item has been successfully added or incremented in the cart.',
    type: AddCartItemResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Size not available for the selected product.',
    type: InvalidSizeErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found.',
    type: ProductNotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'The item is unavailable for the selected rental dates.',
    type: DateUnavailableErrorDto,
  })
  async addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return {
      success: true,
      data: await this.cart.addItem(user.id, dto),
    };
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an existing item in the cart' })
  @ApiOkResponse({
    description: 'The cart item has been successfully updated.',
    type: UpdateCartItemResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Cart item not found.',
    type: CartItemNotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'The item is unavailable for the selected rental dates.',
    type: DateUnavailableErrorDto,
  })
  async updateItem(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return {
      success: true,
      data: await this.cart.updateItem(user.id, id, dto),
    };
  }

  @Delete('items/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiOkResponse({
    description: 'The item was removed from the cart successfully.',
    type: RemoveCartItemResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Cart item not found.',
    type: CartItemNotFoundErrorDto,
  })
  async removeItem(@CurrentUser() user: User, @Param('id') id: string) {
    await this.cart.removeItem(user.id, id);
    return { success: true, data: { message: 'Item removed from cart' } };
  }
}
