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

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.saveRefreshToken(tokens.refresh_token, user.id)

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user,
    }
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

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    )

    await this.saveRefreshToken(tokens.refresh_token, user.id)

    const { password: _, ...safeUser } = user

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: safeUser,
    }
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

  // ================= UPDATE AVATAR =================
  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    })
  }

  // ================= REFRESH =================
  async refresh(refresh_token: string) {
    if (!refresh_token) {
      throw new UnauthorizedException({
        code: 'NO_TOKEN',
        message: 'Refresh token required',
      })
    }

    const saved = await this.prisma.refreshToken.findUnique({
      where: { token: refresh_token },
      include: { user: true },
    })

    if (!saved || saved.expiresAt < new Date()) {
      if (saved) await this.deleteRefreshToken(refresh_token)

      throw new UnauthorizedException({
        code: 'SESSION_EXPIRED',
        message: 'Session expired',
      })
    }

    try {
      this.jwt.verify(refresh_token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      })
    } catch {
      await this.deleteRefreshToken(refresh_token)

      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
      })
    }

    // 🔥 ROTATION
    await this.deleteRefreshToken(refresh_token)

    const tokens = await this.generateTokens(
      saved.user.id,
      saved.user.email,
      saved.user.role as Role,
    )

    await this.saveRefreshToken(tokens.refresh_token, saved.user.id)

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: saved.user.id,
        email: saved.user.email,
        name: saved.user.name,
        role: saved.user.role,
        avatarUrl: saved.user.avatarUrl,
      },
    }
  }

  // ================= LOGOUT =================
  async logout(refresh_token: string) {
    if (refresh_token) {
      await this.deleteRefreshToken(refresh_token)
    }

    return {
      message: 'Logged out successfully',
    }
  }

  // ================= HELPERS =================

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
  ) {
    const payload = { sub: userId, email, role }

    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
      ) as SignOptions['expiresIn'],
    })

    const refresh_token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as SignOptions['expiresIn'],
    })

    return {
      access_token,
      refresh_token,
    }
  }

  private async saveRefreshToken(token: string, userId: string) {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
  }

  private async deleteRefreshToken(token: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    })
  }
}