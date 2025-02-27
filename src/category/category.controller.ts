import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(200)
  @Auth()
  @Post()
  create() {
    return this.categoryService.create();
  }

  @Auth()
  @Get('by-slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.categoryService.bySlug(slug);
  }

  @Auth()
  @Get(':id')
  byId(@Param('id') id: string) {
    return this.categoryService.byId(+id);
  }

  @Auth()
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @HttpCode(200)
  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CategoryDto) {
    return this.categoryService.update(+id, dto);
  }

  @HttpCode(200)
  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
