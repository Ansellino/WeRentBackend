import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { SignOptions } from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'

import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { Role } from 'src/generated/prisma/enums'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ================= REGISTER =================
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (exists) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'Email already registered',
      })
    }

    const hash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hash,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    })

    const tokens = await this.generateAndSaveTokens(
      user.id,
      user.email,
      user.role,
    )

    return { ...tokens, user }
  }

  // ================= LOGIN =================
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      })
    }

    const valid = await bcrypt.compare(dto.password, user.password)

    if (!valid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      })
    }

    const tokens = await this.generateAndSaveTokens(
      user.id,
      user.email,
      user.role,
    )

    const { password: _, ...safeUser } = user

    return { ...tokens, user: safeUser }
  }

  // ================= REFRESH =================
  async refresh(refreshToken: string) {
    const savedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) await this.deleteRefreshToken(refreshToken)

      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Session expired',
      })
    }

    // rotation
    await this.deleteRefreshToken(refreshToken)

    return this.generateAndSaveTokens(
      savedToken.user.id,
      savedToken.user.email,
      savedToken.user.role as Role,
    )
  }

  // ================= LOGOUT =================
  async logout(refreshToken: string) {
    await this.deleteRefreshToken(refreshToken)
    return { message: 'Logged out successfully' }
  }

  // ================= ME =================
  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    })
  }

  // ================= HELPER =================
  private async generateAndSaveTokens(
    userId: string,
    email: string,
    role: Role,
  ) {
    const secret = this.config.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET is not defined')
    }

    const expiresIn =
      this.config.get<string>('JWT_EXPIRES_IN') ?? '15m'

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret,
        expiresIn: expiresIn as SignOptions['expiresIn'],
      },
    )

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret,
        expiresIn: '7d' as SignOptions['expiresIn'],
      },
    )

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  private async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.deleteMany({
      where: { token },
    })
  }
}