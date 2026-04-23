import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewQueryDto } from './dto/review-query.dto';
import { isEmpty } from 'class-validator';

@Injectable()
export class ReviewsService {
  constructor (private prisma: PrismaService) {}

  // ===== LIST REVIEWS =====
  async findAll(productId: string, query: ReviewQueryDto, requestUserId?: string) {
    const { page=1, limit=10, rating, sort='newest', hasMedia } = query
    const skip = (page-1)*limit

    const where: any = { productId }
    if (rating?.length) where.rating = { in: rating }
    if (hasMedia) where.mediaUrls = { isEmpty: false }

    const orderBy = sort === 'helpful'
      ? { helpfulCount: 'desc' as const }
      : { createdAt: 'desc' as const }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where, skip, take: limit, orderBy, 
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          helpfuls: requestUserId
            ? { where: { userId: requestUserId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.review.count({ where }),
    ])

    const data = reviews.map(r => ({
      ...r,
      measurements: { bust: r.bustCm, waist: r.waistCm, hips: r.hipsCm },
      bustCm: undefined,
      waistCm: undefined,
      hipsCm: undefined,
      isHelpful: requestUserId ? r.helpfuls.length > 0: undefined,
      helpfuls: undefined
    }))

    return { data, meta: { page, limit, total } } 
  }


  // ===== CREATE REVIEW =====
  async create(productId: string, userId: string, dto: CreateReviewDto) {
    // Eligibility: must have a completed order containing this product
    const eligible = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: 'COMPLETED' },
        review: null,
      },
    })
    if(!eligible) throw new ForbiddenException({ code: 'REVIEW_NOT_ELIGIBLE', message: 'No completed order found for this product or all orders have been reviewed' })

    const review = await this.prisma.review.create({
      data: {
        productId,
        userId,
        orderItemId: eligible.id,
        rating: dto.rating,
        comment: dto.comment,
        fit: dto.fit,
        bustCm: dto.measurements.bust,
        waistCm: dto.measurements.waist,
        hipsCm: dto.measurements.hips,
        mediaUrls: dto.mediaUrls ?? [],
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })
    return this.formatReview(review, false)
  }


  // ===== UPDATE REVIEW =====
  async update(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } })
    if(!review) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Review not found' })
    if(review.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Cannot edit another user\'s review' })

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { ...dto, isEdited: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })
    return this.formatReview(updated, false)
  }


  // ===== DELETE REVIEW =====
  async remove(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } })
    if(!review) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Review not found' })
    if(review.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Cannot delete another user\'s review' })
    
    await this.prisma.review.delete({ where: { id: reviewId } })
  }

  
  // ===== HELPFUL TOGGLE =====
  async toggleHelpful(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } })
    if(review?.userId === userId) throw new BadRequestException({ code: 'SELF_HELPFUL', message: 'Cannot mark your own review as helpful' })

    const existing = await this.prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    })

    let helpful: boolean
    if(existing) {
      // Unlike
      await this.prisma.reviewHelpful.delete({ where: { id: existing.id } })
      await this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      })
      helpful = false
    }
    else {
      // Like
      await this.prisma.reviewHelpful.create({ data: { reviewId, userId } })
      await this.prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      })
      helpful = true
    }

    const updated = await this.prisma.review.findUnique({ where: { id: reviewId } })
    return { helpful, helpfulCount: updated!.helpfulCount }
  }

  async checkHelpful(reviewId: string, userId: string) {
    const r = await this.prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    })
    return { helpful: !!r }
  }


  // ===== FORMAT HELPER =====
  private formatReview(r: any, isHelpful?: boolean) {
    return {
      ...r,
      measurements: { bust: r.bustCm, waist: r.waistCm, hips: r.hipsCm },
      bustCm: undefined,
      waistCm: undefined,
      hipsCm: undefined,
      ...(isHelpful !== undefined ? { isHelpful } : {}),
    }
  }
}
