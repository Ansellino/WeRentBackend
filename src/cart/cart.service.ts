// src/cart/cart.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { parseISO, addDays } from 'date-fns';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private parseUtcDate(dateString: string): Date {
    return new Date(`${dateString}T00:00:00Z`);
  }

  private async checkAvailability(
    productId: string,
    size: string,
    startDate: Date,
    rentalDays: number,
    // excludeCartItemId?: string,
  ) {
    const end = addDays(startDate, rentalDays - 1);
    const conflict = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        size,
        order: { status: { notIn: ['CANCELLED'] } },
        AND: [{ startDate: { lte: end } }, { endDate: { gte: startDate } }],
      },
    });
    if (conflict)
      throw new ConflictException({
        code: 'DATE_UNAVAILABLE',
        message: 'Selected size is not available on requested dates',
      });
  }

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: { select: { name: true, images: true, pricePerDay: true } },
      },
    });
    const mapped = items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.product.name,
      productImage: i.product.images[0] ?? '',
      size: i.size,
      quantity: i.quantity,
      startDate: i.startDate.toISOString().split('T')[0],
      rentalDays: i.rentalDays,
      endDate: addDays(i.startDate, i.rentalDays - 1)
        .toISOString()
        .split('T')[0],
      pricePerDay: i.product.pricePerDay,
      subtotal: i.product.pricePerDay * i.quantity * i.rentalDays,
    }));
    const total = mapped.reduce((s, i) => s + i.subtotal, 0);
    return { items: mapped, total };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product)
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    if (!product.sizes.includes(dto.size))
      throw new BadRequestException({
        code: 'INVALID_SIZE',
        message: 'Size not available',
      });

    // const start = parseISO(dto.startDate);
    const start = this.parseUtcDate(dto.startDate);
    await this.checkAvailability(
      dto.productId,
      dto.size,
      start,
      dto.rentalDays,
    );

    // Upsert — increment quantity if same product+size+date exists
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_size_startDate: {
          userId,
          productId: dto.productId,
          size: dto.size,
          startDate: start,
        },
      },
    });
    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: dto.quantity } },
      });
    }
    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        size: dto.size,
        quantity: dto.quantity,
        startDate: start,
        rentalDays: dto.rentalDays,
      },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item)
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Cart item not found',
      });

    const newStart = dto.startDate ? parseISO(dto.startDate) : item.startDate;
    const newDays = dto.rentalDays ?? item.rentalDays;
    if (dto.startDate || dto.rentalDays)
      await this.checkAvailability(
        item.productId,
        item.size,
        newStart,
        newDays,
        // itemId,
      );

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { ...dto, ...(dto.startDate ? { startDate: newStart } : {}) },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item)
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Cart item not found',
      });
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }
}
