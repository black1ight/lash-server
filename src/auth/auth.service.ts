import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import { Response } from 'express'
import { PrismaService } from 'src/prisma.service'
import { AuthDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private configService: ConfigService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.issueTokens(user.id)
		console.log(tokens)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)

		if (!result) throw new UnauthorizedException('Invalid refresh token')

		const user = await this.prisma.user.findUnique({
			where: {
				id: result.id
			}
		})

		if (user) {
			const tokens = await this.issueTokens(user.id)

			return {
				user: this.returnUserFields(user),
				...tokens
			}
		}
	}

	async register(dto: AuthDto) {
		const existUser = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		})

		if (existUser) throw new BadRequestException('User already exist')

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: await hash(dto.password),
				phone: dto.phone,
				avatarPath: 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'
			}
		})

		const tokens = await this.issueTokens(user.id)

		return {
			user: this.returnUserFields(user),
			...tokens
		}
	}

	private async issueTokens(userId: number) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '1d'
		})

		return { accessToken, refreshToken }
	}

	private returnUserFields(user: User) {
		return {
			id: user.id,
			email: user.email
		}
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email
			}
		})
		if (!user) throw new NotFoundException('User not found')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Invalid password')

		return user
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: this.configService.get('SERVER_URL'),
			expires: expiresIn,
			secure: false,
			sameSite: 'lax'
		})
	}
	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: this.configService.get('SERVER_URL'),
			expires: new Date(0),
			secure: false,
			sameSite: 'lax'
		})
	}
}
