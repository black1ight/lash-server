import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UserDto {
	@IsOptional()
	@IsEmail()
	@IsString()
	email: string

	@IsOptional()
	@IsString()
	password: string

	@IsOptional()
	@IsString()
	name: string

	@IsOptional()
	@IsString()
	phone: string

	@IsOptional()
	@IsString()
	avatarPath: string
}
