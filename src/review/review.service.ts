import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';
import { ReviewDto } from './dto/review.dto';
import { returnReviewObject } from './return-review.object';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private product: ProductService,
  ) {}

  async create(dto: ReviewDto, userId: number, productId: number) {
    const isExist = await this.product.byId(productId);
    console.log(isExist);

    if (!isExist) throw new NotFoundException('product not found');
    return await this.prisma.review.create({
      data: {
        ...dto,
        productId,
        userId,
      },
      select: returnReviewObject,
    });
  }

  async byId(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: returnReviewObject,
    });
    if (!review) throw new Error('review not found');
    return review;
  }

  async findAll() {
    return await this.prisma.review.findMany({
      orderBy: {
        cretedAt: 'desc',
      },
      select: returnReviewObject,
    });
  }

  async update(id: number, dto: ReviewDto) {
    return this.prisma.review.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.review.delete({
      where: { id },
    });
    return 'success';
  }

  async getAverageValueByProductId(productId: number) {
    return this.prisma.review
      .aggregate({
        where: { productId },
        _avg: {
          rating: true,
        },
      })
      .then((data) => data._avg);
  }
}
