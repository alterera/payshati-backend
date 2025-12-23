import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../../../database/entities/user.entity';
import { UserRegisterOtp } from '../../../database/entities/user-register-otp.entity';
import { LoginHistory } from '../../../database/entities/login-history.entity';
import { SmsTemplate } from '../../../database/entities/sms-template.entity';
import { EmailTemplate } from '../../../database/entities/email-template.entity';
import { Company } from '../../../database/entities/company.entity';
import { State } from '../../../database/entities/state.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { HttpHelper } from '../../../common/helpers/http.helper';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRegisterOtp)
    private userRegisterOtpRepository: Repository<UserRegisterOtp>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(SmsTemplate)
    private smsTemplateRepository: Repository<SmsTemplate>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    private configService: ConfigService,
    private httpHelper: HttpHelper,
  ) {}

  async login(loginDto: LoginDto, ipAddress: string, host: string) {
    const user = await this.userRepository.findOne({
      where: {
        mobileNumber: loginDto.mobile_number,
      },
    });

    if (!user || [1, 2].includes(user.roleId)) {
      throw new BadRequestException({
        type: 'error',
        message: 'Invalid mobile number',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

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

    if (user.loginType === 'OTP') {
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

      if (user.otpLimit !== 5) {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.otp = hashedOtp;
        user.otpLimit = user.otpLimit + 1;
        user.otpCreatedAt = new Date();
        await this.userRepository.save(user);

        // Send OTP via SMS/Email
        await this.sendOtp(user, otp, host);

        return {
          type: 'otp_verify',
          message: 'OTP send email & mobile number successfully.',
        };
      }
    } else {
      // Generate login key
      const loginKey = randomBytes(40).toString('hex');
      user.loginKey = loginKey;
      await this.userRepository.save(user);

      // Log login history
      await this.loginHistoryRepository.save({
        userId: user.id,
        ipAddress,
        loginPath: 'Web',
      });

      const states = await this.stateRepository.find({
        where: { status: 1 },
        select: ['id', 'stateName'],
      });

      const mobileProviders = await this.providerRepository.find({
        where: { status: 1, serviceId: 1, deletedAt: IsNull() },
        select: ['id', 'providerName', 'providerLogo'],
      });

      const postpaidProviders = await this.providerRepository.find({
        where: { status: 1, serviceId: 4, deletedAt: IsNull() },
        select: ['id', 'providerName', 'providerLogo'],
      });

      const dthProviders = await this.providerRepository.find({
        where: { status: 1, serviceId: 2, deletedAt: IsNull() },
        select: ['id', 'providerName', 'providerLogo'],
      });

      return {
        type: 'success',
        message: 'Login Successfully',
        data: {
          parent_id: user.parentId,
          login_key: user.loginKey,
          user_id: user.id,
          role_id: user.roleId,
          states,
          mobile_provider: mobileProviders,
          postpaid_provider: postpaidProviders,
          dth_provider: dthProviders,
        },
      };
    }
  }

  async loginOtp(loginOtpDto: LoginOtpDto, ipAddress: string) {
    const user = await this.userRepository.findOne({
      where: {
        mobileNumber: loginOtpDto.mobile_number,
      },
    });

    if (!user || [1, 2].includes(user.roleId)) {
      throw new BadRequestException({
        type: 'error',
        message: 'Invalid mobile number',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginOtpDto.password,
      user.password,
    );

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

    const isOtpValid = await bcrypt.compare(loginOtpDto.otp, user.otp);

    if (!isOtpValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'Wrong otp.',
      });
    }

    const loginKey = randomBytes(40).toString('hex');
    user.loginKey = loginKey;
    await this.userRepository.save(user);

    await this.loginHistoryRepository.save({
      userId: user.id,
      ipAddress,
      loginPath: 'Web',
    });

    const states = await this.stateRepository.find({
      where: { status: 1 },
      select: ['id', 'stateName'],
    });

    const mobileProviders = await this.providerRepository.find({
      where: { status: 1, serviceId: 1, deletedAt: IsNull() },
      select: ['id', 'providerName', 'providerLogo'],
    });

    const postpaidProviders = await this.providerRepository.find({
      where: { status: 1, serviceId: 4, deletedAt: IsNull() },
      select: ['id', 'providerName', 'providerLogo'],
    });

    const dthProviders = await this.providerRepository.find({
      where: { status: 1, serviceId: 2, deletedAt: IsNull() },
      select: ['id', 'providerName', 'providerLogo'],
    });

    return {
      type: 'success',
      message: 'Login Successfully',
      data: {
        parent_id: user.parentId,
        login_key: user.loginKey,
        user_id: user.id,
        role_id: user.roleId,
        states,
        mobile_provider: mobileProviders,
        postpaid_provider: postpaidProviders,
        dth_provider: dthProviders,
      },
    };
  }

  async sendOtpUserRegister(registerDto: RegisterDto, ipAddress: string, host: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { mobileNumber: registerDto.mobile_number },
        { emailAddress: registerDto.email_address },
      ],
    });

    if (existingUser) {
      throw new BadRequestException({
        type: 'error',
        message: existingUser.mobileNumber === registerDto.mobile_number
          ? 'Mobile number already exists'
          : 'Email address already exists',
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const token = randomBytes(45).toString('hex') +
      String(Math.floor(1000 + Math.random() * 9000)) +
      String(Math.floor(100000 + Math.random() * 900000)) +
      String(Math.floor(1000 + Math.random() * 9000)) +
      randomBytes(45).toString('hex');

    const registerOtp = this.userRegisterOtpRepository.create({
      mobileNumber: registerDto.mobile_number,
      emailAddress: registerDto.email_address,
      outletName: '',
      firstName: registerDto.first_name,
      lastName: registerDto.last_name,
      city: registerDto.city_name,
      otp: hashedOtp,
      token,
      ipAddress,
    });

    await this.userRegisterOtpRepository.save(registerOtp);

    // Send OTP
    await this.sendOtpForRegister(registerDto, otp, host);

    return {
      type: 'otp_verify',
      token,
      mobile: registerDto.mobile_number,
      message: 'OTP send successfully check email & mobile number.',
    };
  }

  async verifyOtpUserRegister(verifyOtpDto: VerifyOtpRegisterDto, ipAddress: string, host: string) {
    const userData = await this.userRegisterOtpRepository.findOne({
      where: {
        mobileNumber: verifyOtpDto.mobile_number,
        token: verifyOtpDto.token,
      },
      order: { id: 'DESC' },
    });

    if (!userData) {
      throw new BadRequestException({
        type: 'error',
        message: 'Something went wrong.',
      });
    }

    const isOtpValid = await bcrypt.compare(verifyOtpDto.otp, userData.otp);

    if (!isOtpValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'OTP do not match.',
      });
    }

    const password = randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const tPin = String(Math.floor(1000 + Math.random() * 9000));
    const loginKey = randomBytes(40).toString('hex');

    const user = this.userRepository.create({
      parentId: 1,
      roleId: 6,
      schemeId: 1,
      outletName: userData.outletName,
      firstName: userData.firstName,
      middleName: '',
      lastName: userData.lastName,
      mobileNumber: userData.mobileNumber,
      emailAddress: userData.emailAddress,
      password: hashedPassword,
      tPin,
      loginKey,
      loginType: 'OTP',
      gender: 'Male',
      city: userData.city,
      registerBy: 'Website',
      kycStatus: 'Pending',
      bankAccountType: 'Savings',
      profilePic: 'avatar-2.png',
      status: 1,
      walletBalance: 0,
      miniumBalance: 0,
    });

    const savedUser = await this.userRepository.save(user);

    await this.loginHistoryRepository.save({
      userId: savedUser.id,
      ipAddress,
      loginPath: 'Web',
    });

    // Send welcome message with credentials
    await this.sendWelcomeMessage(userData, password, tPin, host);

    const states = await this.stateRepository.find({
      where: { status: 1 },
      select: ['id', 'stateName'],
    });

    const mobileProviders = await this.providerRepository.find({
      where: { status: 1, serviceId: 1, deletedAt: IsNull() },
      select: ['id', 'providerName', 'providerLogo'],
    });

    const postpaidProviders = await this.providerRepository.find({
      where: { status: 1, serviceId: 4, deletedAt: IsNull() },
      select: ['id', 'providerName', 'providerLogo'],
    });

    const dthProviders = await this.providerRepository.find({
      where: { status: 1, serviceId: 2, deletedAt: IsNull() },
      select: ['id', 'providerName', 'providerLogo'],
    });

    return {
      type: 'success',
      message: 'Register successfully. Login Details send email, whatsapp & sms',
      data: {
        parent_id: savedUser.parentId,
        login_key: savedUser.loginKey,
        user_id: savedUser.id,
        role_id: savedUser.roleId,
        states,
        mobile_provider: mobileProviders,
        postpaid_provider: postpaidProviders,
        dth_provider: dthProviders,
      },
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, ipAddress: string, host: string) {
    const user = await this.userRepository.findOne({
      where: {
        mobileNumber: resetPasswordDto.mobile_number,
      },
    });

    if (!user || [1, 2].includes(user.roleId)) {
      throw new BadRequestException({
        type: 'error',
        message: 'Invalid mobile number',
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

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpLimit = user.otpLimit + 1;
    user.otpCreatedAt = new Date();
    await this.userRepository.save(user);

    await this.sendForgotPasswordOtp(user, otp, host);

    return {
      type: 'otp_verify',
      message: 'OTP send email & mobile number successfully.',
    };
  }

  async resetPasswordOtp(resetPasswordOtpDto: ResetPasswordOtpDto, ipAddress: string, host: string) {
    const user = await this.userRepository.findOne({
      where: {
        mobileNumber: resetPasswordOtpDto.mobile_number,
      },
    });

    if (!user || [1, 2].includes(user.roleId)) {
      throw new BadRequestException({
        type: 'error',
        message: 'Invalid mobile number',
      });
    }

    if (user.status !== 1) {
      throw new BadRequestException({
        type: 'error',
        message: 'Account not active contact service provider.',
      });
    }

    const isOtpValid = await bcrypt.compare(resetPasswordOtpDto.otp, user.otp);

    if (!isOtpValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'Wrong otp.',
      });
    }

    const newPassword = randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.sendForgotPassword(user, newPassword, host);

    return {
      type: 'success',
      message: 'New Password check Email & Mobile Send Successfully.',
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException({
        type: 'error',
        message: 'Current password do not match.',
      });
    }

    if (changePasswordDto.new_password !== changePasswordDto.confirm_password) {
      throw new BadRequestException({
        type: 'error',
        message: 'New password and confirm password do not match.',
      });
    }

    user.password = await bcrypt.hash(changePasswordDto.confirm_password, 10);
    await this.userRepository.save(user);

    return {
      type: 'success',
      message: 'Password Change Successfully.',
    };
  }

  async generatePin(userId: number, host: string) {
    const tPin = String(Math.floor(1000 + Math.random() * 9000));
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    user.tPin = tPin;
    await this.userRepository.save(user);

    await this.sendForgotPin(user, tPin, host);

    return {
      type: 'success',
      message: 'Pin Change Successfully new pin send email, whatsapp & sms',
    };
  }

  async changePin(userId: number, changePinDto: ChangePinDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    if (user.tPin !== changePinDto.current_pin) {
      throw new BadRequestException({
        type: 'error',
        message: 'Current pin do not match.',
      });
    }

    if (changePinDto.new_pin !== changePinDto.confirm_pin) {
      throw new BadRequestException({
        type: 'error',
        message: 'New pin and confirm pin do not match.',
      });
    }

    user.tPin = changePinDto.confirm_pin;
    await this.userRepository.save(user);

    return {
      type: 'success',
      message: 'Pin Change Successfully.',
    };
  }

  private async sendWhatsAppMessage(
    mobileNumber: string,
    message: string,
  ): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('WHATSAPP_API');
      const sender = this.configService.get<string>('WHATSAPP_SENDER', '919906514212');
      const endpoint = 'https://wa.alterera.net/send-message';

      if (!apiKey) {
        console.error('WHATSAPP_API not configured in environment variables');
        return;
      }

      // Format mobile number (remove leading 0, ensure it starts with country code)
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
        'WHATSAPP_OTP',
        `OTP-${Date.now()}`,
      );
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      // Don't throw error - allow the flow to continue even if WhatsApp fails
    }
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

      // Send WhatsApp message
      await this.sendWhatsAppMessage(user.mobileNumber, content);
    }

    // Email sending can be implemented later if needed
    // For now, we're only implementing WhatsApp/SMS
  }

  private async sendOtpForRegister(registerDto: RegisterDto, otp: string, host: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'otp' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, registerDto.first_name || '');
      content = content.replace(/{MIDDLE_NAME}/g, '');
      content = content.replace(/{LAST_NAME}/g, registerDto.last_name || '');
      content = content.replace(/{OUTLET_NAME}/g, '');
      content = content.replace(/{OTP}/g, otp);

      // Send WhatsApp message
      await this.sendWhatsAppMessage(registerDto.mobile_number, content);
    }
  }

  private async sendWelcomeMessage(
    userData: UserRegisterOtp,
    password: string,
    tPin: string,
    host: string,
  ) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'create_user' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, userData.firstName || '');
      content = content.replace(/{MOBILE}/g, userData.mobileNumber || '');
      content = content.replace(/{PASSWORD}/g, password);
      content = content.replace(/{PIN}/g, tPin);

      // Send WhatsApp message
      await this.sendWhatsAppMessage(userData.mobileNumber, content);
    }
  }

  private async sendForgotPasswordOtp(user: User, otp: string, host: string) {
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

  private async sendForgotPassword(user: User, newPassword: string, host: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'reset_password' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, user.firstName || '');
      content = content.replace(/{MIDDLE_NAME}/g, user.middleName || '');
      content = content.replace(/{LAST_NAME}/g, user.lastName || '');
      content = content.replace(/{OUTLET_NAME}/g, user.outletName || '');
      content = content.replace(/{PASSWORD}/g, newPassword);

      await this.sendWhatsAppMessage(user.mobileNumber, content);
    } else {
      // Fallback message if template not found
      const message = `Hi ${user.firstName}, your new password is: ${newPassword}. Please login and change it immediately.`;
      await this.sendWhatsAppMessage(user.mobileNumber, message);
    }
  }

  private async sendForgotPin(user: User, tPin: string, host: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'generate_pin' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, user.firstName || '');
      content = content.replace(/{MIDDLE_NAME}/g, user.middleName || '');
      content = content.replace(/{LAST_NAME}/g, user.lastName || '');
      content = content.replace(/{OUTLET_NAME}/g, user.outletName || '');
      content = content.replace(/{PIN}/g, tPin);

      await this.sendWhatsAppMessage(user.mobileNumber, content);
    } else {
      // Fallback message if template not found
      const message = `Hi ${user.firstName}, your new PIN is: ${tPin}. Please keep it secure.`;
      await this.sendWhatsAppMessage(user.mobileNumber, message);
    }
  }
}
