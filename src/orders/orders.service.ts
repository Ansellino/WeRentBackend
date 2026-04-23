import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/req/checkout.dto';
import { addDays } from 'date-fns';

// Dummy shipment options — replace with real courier API in production
const DUMMY_COURIERS = [
  {
    id: 'jne-reg',
    courier: 'JNE',
    service: 'REG',
    label: 'JNE Regular (2–3 days)',
    estimatedDays: 3,
    price: 18000,
  },
  {
    id: 'jne-yes',
    courier: 'JNE',
    service: 'YES',
    label: 'JNE YES (next day)',
    estimatedDays: 1,
    price: 35000,
  },
  {
    id: 'jnt-reg',
    courier: 'JNT',
    service: 'REG',
    label: 'J&T Express (2–3 days)',
    estimatedDays: 3,
    price: 16000,
  },
  {
    id: 'sicepat',
    courier: 'SICEPAT',
    service: 'REG',
    label: 'SiCepat Regular (2–3 days)',
    estimatedDays: 3,
    price: 15000,
  },
  {
    id: 'gosend',
    courier: 'GOSEND',
    service: 'SDS',
    label: 'GoSend Same Day',
    estimatedDays: 1,
    price: 28000,
  },
];

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const courier = DUMMY_COURIERS.find((c) => c.id === dto.courierId);
    if (!courier)
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Courier option not found',
      });

    // Get cart
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (!cartItems.length)
      throw new BadRequestException({
        code: 'CART_EMPTY',
        message: 'Cart is empty',
      });

    // Re-validate all availability
    for (const item of cartItems) {
      const end = addDays(item.startDate, item.rentalDays - 1);
      const conflict = await this.prisma.orderItem.findFirst({
        where: {
          productId: item.productId,
          size: item.size,
          order: { status: { notIn: ['CANCELLED'] } },
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: item.startDate } },
          ],
        },
      });
      if (conflict)
        throw new ConflictException({
          code: 'DATE_UNAVAILABLE',
          message: `${item.product.name} (${item.size}) is no longer available on the selected dates`,
        });
    }

    // Build order items + compute total
    const orderItemsData = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      size: item.size,
      quantity: item.quantity,
      startDate: item.startDate,
      rentalDays: item.rentalDays,
      endDate: addDays(item.startDate, item.rentalDays - 1),
      subtotal: item.product.pricePerDay * item.quantity * item.rentalDays,
    }));
    const itemsTotal = orderItemsData.reduce((s, i) => s + i.subtotal, 0);

    // Create order in transaction — also clears cart
    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          userId,
          status: 'COMPLETED',
          shippingAddress: dto.shippingAddress,
          courierLabel: courier.label,
          courierService: courier.service,
          shippingCost: courier.price,
          total: itemsTotal + courier.price,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
      await tx.cartItem.deleteMany({ where: { userId } });
      return o;
    });
    return order;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            review: true,
          },
        },
      },
    });
    if (!order)
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Order not found',
      });
    return order;
  }
}
