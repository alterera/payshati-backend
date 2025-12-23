import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AppUserGuard } from '../guards/app-user.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import {
  LoginDto,
  LoginOtpDto,
  RegisterDto,
  VerifyOtpRegisterDto,
  ResetPasswordDto,
  ResetPasswordOtpDto,
  ChangePasswordDto,
  ChangePinDto,
} from '../dto/login.dto';
import { HttpHelper } from '../../../common/helpers/http.helper';

@Controller('v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpHelper: HttpHelper,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req, @Headers('host') host: string) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.authService.login(loginDto, ipAddress, host);
  }

  @Post('login-otp')
  async loginOtp(@Body() loginOtpDto: LoginOtpDto, @Request() req) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.authService.loginOtp(loginOtpDto, ipAddress);
  }

  @Post('create-account')
  async sendOtpUserRegister(
    @Body() registerDto: RegisterDto,
    @Request() req,
    @Headers('host') host: string,
  ) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.authService.sendOtpUserRegister(registerDto, ipAddress, host);
  }

  @Post('create-account-otp')
  async verifyOtpUserRegister(
    @Body() verifyOtpDto: VerifyOtpRegisterDto,
    @Request() req,
    @Headers('host') host: string,
  ) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.authService.verifyOtpUserRegister(verifyOtpDto, ipAddress, host);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Request() req,
    @Headers('host') host: string,
  ) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.authService.resetPassword(resetPasswordDto, ipAddress, host);
  }

  @Post('reset-password-otp')
  async resetPasswordOtp(
    @Body() resetPasswordOtpDto: ResetPasswordOtpDto,
    @Request() req,
    @Headers('host') host: string,
  ) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.authService.resetPasswordOtp(resetPasswordOtpDto, ipAddress, host);
  }

  @Post('change-password')
  @UseGuards(AppUserGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Post('generate-pin')
  @UseGuards(AppUserGuard)
  async generatePin(
    @CurrentUser() user: User,
    @Headers('host') host: string,
  ) {
    return this.authService.generatePin(user.id, host);
  }

  @Post('change-pin')
  @UseGuards(AppUserGuard)
  async changePin(
    @CurrentUser() user: User,
    @Body() changePinDto: ChangePinDto,
  ) {
    return this.authService.changePin(user.id, changePinDto);
  }
}
