import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  ApproveUserDto,
  ChangePasswordDto,
  LoginDto,
  CreatePreApprovedUserDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { UserStatus } from './entities/user.entity';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minute block
    endpoint: 'login',
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registration attempts per hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hour block
    endpoint: 'register',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('approve-user')
  async approveUser(
    @Request() req: RequestWithUser,
    @Body() approveDto: ApproveUserDto,
  ) {
    // Only admins can approve users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.approveUser(req.user.userId, approveDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending-users')
  async getPendingUsers(@Request() req: RequestWithUser) {
    // Only admins can see pending users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.getPendingUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-users')
  async getAllUsers(@Request() req: RequestWithUser) {
    // Only admins can see all users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    // Return current user's profile
    return {
      id: req.user.userId,
      username: req.user.username,
      role: req.user.role,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-pre-approved-user')
  async createPreApprovedUser(
    @Request() req: RequestWithUser,
    @Body() createDto: CreatePreApprovedUserDto,
  ) {
    // Only admins can create pre-approved users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.createPreApprovedUser(req.user.userId, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pre-approved-users')
  async getPreApprovedUsers(@Request() req: RequestWithUser) {
    // Only admins can see pre-approved users
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return this.authService.getPreApprovedUsers();
  }

  @Post('request-password-reset')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset requests per hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hour block
    endpoint: 'password-reset-request',
  })
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestDto);
  }

  @Post('reset-password')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 password reset attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minute block
    endpoint: 'password-reset',
  })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }
}
