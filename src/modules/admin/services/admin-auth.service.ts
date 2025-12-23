import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../../../database/entities/user.entity';
import { LoginHistory } from '../../../database/entities/login-history.entity';
import { SmsTemplate } from '../../../database/entities/sms-template.entity';
import { ConfigService } from '@nestjs/config';
import { HttpHelper } from '../../../common/helpers/http.helper';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(SmsTemplate)
    private smsTemplateRepository: Repository<SmsTemplate>,
    private configService: ConfigService,
    private httpHelper: HttpHelper,
  ) {}

  async login(loginDto: { mobile_number: string; password: string }, ipAddress: string, host: string) {
    const user = await this.userRepository.findOne({
      where: {
        mobileNumber: loginDto.mobile_number,
        roleId: 1, // Admin role
      },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'Invalid mobile number',
      });
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'Password do not match',
      });
    }

    if (user.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'Account not active contact service provider.',
      });
    }

    // Check OTP limit
    if (user.otpLimit === 5) {
      const timeDiff =
        (new Date().getTime() - new Date(user.otpCreatedAt).getTime()) /
        60000;
      if (timeDiff < 10) {
        throw new BadRequestException({
          type: 'error',
          message: 'OTP limit exhausted login after 10 minutes.',
        });
      } else {
        user.otpLimit = 0;
        await this.userRepository.save(user);
      }
    }

    // Generate OTPs
    const emailOtp = String(Math.floor(100000 + Math.random() * 900000));
    const mobileOtp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedEmailOtp = await bcrypt.hash(emailOtp, 10);
    const hashedMobileOtp = await bcrypt.hash(mobileOtp, 10);

    user.otp = hashedMobileOtp;
    user.otpLimit = user.otpLimit + 1;
    user.otpCreatedAt = new Date();
    await this.userRepository.save(user);

    // Send OTP via WhatsApp
    await this.sendOtp(user, mobileOtp, host);

    return {
      type: 'otp_verify',
      message: 'OTP send email & mobile number successfully.',
      // For development/testing - remove in production
      // email_otp: emailOtp,
      // mobile_otp: mobileOtp,
    };
  }

  async loginOtp(loginOtpDto: { mobile_number: string; password: string; email_otp: string; mobile_otp: string }, ipAddress: string) {
    const user = await this.userRepository.findOne({
      where: {
        mobileNumber: loginOtpDto.mobile_number,
        roleId: 1, // Admin role
      },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'Invalid mobile number',
      });
    }

    const isPasswordValid = await bcrypt.compare(loginOtpDto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'Password do not match',
      });
    }

    if (user.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'Account not active contact service provider.',
      });
    }

    // Verify OTP (using mobile_otp for now, can add email_otp verification later)
    const isOtpValid = await bcrypt.compare(loginOtpDto.mobile_otp, user.otp);

    if (!isOtpValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'Wrong otp.',
      });
    }

    // Generate login key if not exists
    if (!user.loginKey) {
      user.loginKey = randomBytes(40).toString('hex');
      await this.userRepository.save(user);
    }

    // Log login history
    await this.loginHistoryRepository.save({
      userId: user.id,
      ipAddress,
      loginPath: 'Web',
    });

    return {
      type: 'success',
      message: 'Login Successfully',
      data: {
        user_id: user.id,
        login_key: user.loginKey,
        name: `${user.firstName} ${user.lastName}`,
        mobile_number: user.mobileNumber,
        email_address: user.emailAddress,
      },
    };
  }

  async logout(userId: number) {
    // Optionally clear login key or just return success
    // For now, we'll just return success
    return {
      type: 'success',
      message: 'Logout successfully',
    };
  }

  private async sendOtp(user: User, otp: string, host: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'otp' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, user.firstName || '');
      content = content.replace(/{MIDDLE_NAME}/g, user.middleName || '');
      content = content.replace(/{LAST_NAME}/g, user.lastName || '');
      content = content.replace(/{OUTLET_NAME}/g, user.outletName || '');
      content = content.replace(/{OTP}/g, otp);

      await this.sendWhatsAppMessage(user.mobileNumber, content);
    }
  }

  private async sendWhatsAppMessage(mobileNumber: string, message: string): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('WHATSAPP_API');
      const sender = this.configService.get<string>('WHATSAPP_SENDER', '919906514212');
      const endpoint = 'https://wa.alterera.net/send-message';

      if (!apiKey) {
        console.error('WHATSAPP_API not configured in environment variables');
        return;
      }

      let formattedNumber = mobileNumber.replace(/^0+/, '');
      if (!formattedNumber.startsWith('91')) {
        formattedNumber = `91${formattedNumber}`;
      }

      const requestData = {
        api_key: apiKey,
        sender: sender,
        number: formattedNumber,
        message: message,
      };

      const requestBody = JSON.stringify(requestData);

      await this.httpHelper.curl(
        endpoint,
        'POST',
        requestBody,
        {},
        'no',
        'WHATSAPP_ADMIN_OTP',
        `ADMIN-OTP-${Date.now()}`,
      );
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    }
  }
}
