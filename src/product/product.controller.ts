import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { getAllProductDto } from './dto/get-all.product.dto'
import { ProductDto } from './dto/product.dto'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post()
	@Auth()
	create(@Body() dto: ProductDto) {
		return this.productService.create(dto)
	}

	@Get(':id')
	@Auth()
	byId(@Param('id') id: string) {
		return this.productService.byId(+id)
	}

	@Get('similar/:slug')
	getSimilar(@Param('slug') slug: string) {
		return this.productService.getSimilar(slug)
	}

	@Get('by-slug/:slug')
	bySlug(@Param('slug') slug: string) {
		return this.productService.bySlug(slug)
	}

	@UsePipes(new ValidationPipe())
	@Get('by-category/:slug')
	byCategory(@Query() queryDto: getAllProductDto, @Param('slug') slug: string) {
		return this.productService.byCategory(queryDto, slug)
	}

	@Get()
	findAll(@Query() queryDto: getAllProductDto) {
		return this.productService.findAll(queryDto)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	update(@Param('id') id: string, @Body() dto: ProductDto) {
		return this.productService.update(+id, dto)
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth()
	remove(@Param('id') id: string) {
		return this.productService.remove(+id)
	}
}
