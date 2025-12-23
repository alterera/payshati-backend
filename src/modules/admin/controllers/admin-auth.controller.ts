import {
  Controller,
  Post,
  Body,
  Request,
  Headers,
} from '@nestjs/common';
import { AdminAuthService } from '../services/admin-auth.service';
import { HttpHelper } from '../../../common/helpers/http.helper';

@Controller('v1/admin')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly httpHelper: HttpHelper,
  ) {}

  @Post('login')
  async login(@Body() loginDto: { mobile_number: string; password: string }, @Request() req, @Headers('host') host: string) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.adminAuthService.login(loginDto, ipAddress, host);
  }

  @Post('login-otp')
  async loginOtp(@Body() loginOtpDto: { mobile_number: string; password: string; email_otp: string; mobile_otp: string }, @Request() req) {
    const ipAddress = this.httpHelper.getIp(req);
    return this.adminAuthService.loginOtp(loginOtpDto, ipAddress);
  }

  @Post('logout')
  async logout(@Body() body: { login_key: string; user_id: number }) {
    return this.adminAuthService.logout(body.user_id);
  }
}
