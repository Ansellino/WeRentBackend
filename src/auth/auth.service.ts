import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
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
  ) {}

  // --- Core Functions ---

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException({ code: 'EMAIL_TAKEN', message: 'Email already registered' })

    const hash = await bcrypt.hash(dto.password, 12)
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hash },
      select: { id: true, name: true, email: true, role: true },
    })

    const tokens = await this.generateAndSaveTokens(user.id, user.email, user.role)
    return { ...tokens, user }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' })

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' })

    const tokens = await this.generateAndSaveTokens(user.id, user.email, user.role)
    const { password: _, ...safeUser } = user
    return { ...tokens, user: safeUser }
  }

  async refresh(refreshToken: string) {
    // 1. Cari token di DB
    const savedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    // 2. Validasi keberadaan & masa berlaku
    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) await this.deleteRefreshToken(refreshToken)
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Session expired' })
    }

    // 3. Hapus token lama (Rotasi untuk keamanan)
    await this.deleteRefreshToken(refreshToken)

    // 4. Generate pasangan token baru
    return this.generateAndSaveTokens(savedToken.user.id, savedToken.user.email, savedToken.user.role as Role)
  }

  async logout(refreshToken: string) {
    await this.deleteRefreshToken(refreshToken)
    return { success: true }
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
  }

  // --- Helper Functions ---

  private async generateAndSaveTokens(userId: string, email: string, role: Role) {
    // Buat Access Token (Masa berlaku pendek, misal 15 menit)
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { expiresIn: '15m' } 
    )

    // Buat Refresh Token (Masa berlaku panjang, misal 7 hari)
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { expiresIn: '7d' }
    )

    // Simpan ke database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
      },
    })

    return { access_token: accessToken, refresh_token: refreshToken }
  }

  private async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.deleteMany({
      where: { token },
    })
  }
}