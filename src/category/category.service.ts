import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { slugGenerate } from 'src/utils/slug-generate';
import { CategoryDto } from './dto/category.dto';
import { returnCategoryObject } from './return-category.object';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create() {
    return await this.prisma.category.create({
      data: {
        name: '',
        slug: '',
      },
    });
  }

  async byId(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: returnCategoryObject,
    });
    if (!category) throw new Error('category not found');
    return category;
  }

  async bySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: returnCategoryObject,
    });
    if (!category) throw new Error('category not found');
    return category;
  }

  async findAll() {
    return await this.prisma.category.findMany({
      select: returnCategoryObject,
    });
  }

  async update(id: number, dto: CategoryDto) {
    return this.prisma.category.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        slug: slugGenerate(dto.name),
      },
    });
  }

  async remove(id: number) {
    await this.prisma.category.delete({
      where: { id },
    });
    return 'success';
  }
}
