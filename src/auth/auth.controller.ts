import { Controller, Post, Get, Body, UseGuards, HttpCode, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
 
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.auth.register(dto);
    return { success: true, data };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login and receive JWT' })
  async login(@Body() dto: LoginDto) {
    const data = await this.auth.login(dto);
    return { success: true, data };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() user: any) {
    const data = await this.auth.me(user.id);
    return { success: true, data };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  // Menggunakan destructuring untuk mengambil field refresh_token langsung dari body
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token is required');
    const data = await this.auth.refresh(refreshToken);
    return { success: true, data };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token is required');
    await this.auth.logout(refreshToken);
    return { success: true, message: 'Logged out successfully' };
  }
}