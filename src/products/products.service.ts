import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductAvailabilityQueryDto } from './dto/product-availability-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { addDays, eachDayOfInterval, format, parseISO } from "date-fns";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ===== LISTS =====
  async findAll(query: ProductQueryDto) {
    const { page=1, limit=10, category, search } = query
    const skip = (page-1) * limit
    const where: any = {}
    if(category) where.category = category
    if(search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ]

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, category: true, pricePerDay: true, images: true,
          reviews: { select: { rating: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ])

    const data = products.map(p => ({
      ...p,
      avgRating: p.reviews.length
        ? Math.round((p.reviews.reduce((s,r)=>s+r.rating,0)/p.reviews.length)*10)/10
        : 0,
      totalReviews: p.reviews.length,
      reviews: undefined,
    }))
    return { data, meta: { page, limit, total } }
  }

  // ===== DETAILS =====
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { reviews: { select: { rating: true, fit: true } } },
    })
    if(!product) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' })

    const avg = product.reviews.length
      ? Math.round((product.reviews.reduce((s,r)=>s+r.rating,0)/product.reviews.length)*10)/10
      : 0

    const fitCounts = { small:0, true:0, large:0 }
    product.reviews.forEach(r => fitCounts[r.fit]++)
    const dominant = Object.entries(fitCounts).sort((a,b)=>b[1]-a[1]) [0]

    const { reviews, ...rest } = product
    return {
      ...rest,
      avgRating: avg,
      totalReviews: reviews.length,
      fitScale: dominant[1]>0 ? dominant[0]==='true' ? 'true_to_size' : `runs_${dominant[0]}` : null,
    }
  }


  // ===== AVAILABILITY =====
  async checkAvailability(id: string, query: ProductAvailabilityQueryDto) {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if(!product) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Product not found' })
    if(!product.sizes.includes(query.size))
      throw new BadRequestException({ code: 'INVALID_SIZE', message: 'Size not available for this product' })

    const start = parseISO(query.startDate)
    const end = addDays(start, query.rentalDays - 1)

    // Find any overlapping orders for this product and size
    const overlapping = await this.prisma.orderItem.findMany({
      where: {
        productId: id,
        size: query.size,
        order: { status: { notIn: ['CANCELLED'] } },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
      select: { startDate: true, endDate: true },
    })

    if(overlapping.length === 0) {
      return {
        available: true,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
        size: query.size,
        unavailableDates: [],
      }
    }

    const unavailableDates = overlapping.flatMap(o =>
      eachDayOfInterval({ start: o.startDate, end: o.endDate })
        .map(d => format(d, 'yyyy-MM-dd'))
    )
    return {
      available: false,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      size: query.size,
      unavailableDates: [...new Set(unavailableDates)].sort(),
    }
  }


  // ===== REVIEW SUMMARY =====
  async reviewSummary(id: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId: id },
      select: { rating: true, fit: true },
    })
    const dist = { '1':0, '2':0, '3':0, '4':0, '5':0 }
    const fit = { small: 0, true: 0, large: 0 }
    reviews.forEach(r => { dist[String(r.rating)]++; fit[r.fit]++ })
    const avg = reviews.length
      ? Math.round((reviews.reduce((s,r)=>s+r.rating,0)/reviews.length)*10)/10
      : 0

    return { avgRating: avg, distribution: dist, fitScale: fit, total: reviews.length }
  }
}
