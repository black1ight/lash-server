import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Patch,
	Put
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { UserDto } from './dto/user.dto'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	getProfile(@CurrentUser('id') id: number) {
		return this.userService.byId(id)
	}

	@HttpCode(200)
	@Auth()
	@Put('profile')
	async updateUser(@CurrentUser('id') id: number, @Body() dto: UserDto) {
		return this.userService.updateProfile(id, dto)
	}

	@HttpCode(200)
	@Auth()
	@Patch('profile/favorites/:productId')
	async toggleFavorite(
		@CurrentUser('id') userId: number,
		@Param('productId') productId: string
	) {
		return this.userService.toggleFavorite(userId, +productId)
	}
}
