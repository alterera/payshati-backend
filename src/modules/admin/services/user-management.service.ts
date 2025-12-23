import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../../../database/entities/user.entity';
import { Report } from '../../../database/entities/report.entity';
import { Role } from '../../../database/entities/role.entity';
import { Scheme } from '../../../database/entities/scheme.entity';
import { SmsTemplate } from '../../../database/entities/sms-template.entity';
import { EmailTemplate } from '../../../database/entities/email-template.entity';
import { Company } from '../../../database/entities/company.entity';
import { ConfigService } from '@nestjs/config';
import { HttpHelper } from '../../../common/helpers/http.helper';
import {
  CreateUserDto,
  UpdateUserDto,
  FundUpdateDto,
} from '../dto/user-management.dto';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Scheme)
    private schemeRepository: Repository<Scheme>,
    @InjectRepository(SmsTemplate)
    private smsTemplateRepository: Repository<SmsTemplate>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private configService: ConfigService,
    private httpHelper: HttpHelper,
    private dataSource: DataSource,
  ) {}

  async listUsers(
    page: number,
    limit: number,
    roleId?: number,
    parentId?: number,
    status?: string,
    kycStatus?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.deletedAt IS NULL');

    if (roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }

    if (parentId) {
      queryBuilder.andWhere('user.parentId = :parentId', { parentId });
    }

    if (status && status !== 'All') {
      queryBuilder.andWhere('user.status = :status', { status: parseInt(status) });
    }

    if (kycStatus && kycStatus !== 'All') {
      queryBuilder.andWhere('user.kycStatus = :kycStatus', { kycStatus });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.mobileNumber LIKE :search OR user.emailAddress LIKE :search OR user.outletName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Enrich with role and scheme names
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const role = await this.roleRepository.findOne({ where: { id: user.roleId } });
        const scheme = await this.schemeRepository.findOne({ where: { id: user.schemeId } });
        const parent = user.parentId
          ? await this.userRepository.findOne({ where: { id: user.parentId } })
          : null;

        return {
          ...user,
          roleName: role?.roleName || '',
          schemeName: scheme?.schemeName || '',
          parentName: parent
            ? `${parent.firstName} ${parent.middleName || ''} ${parent.lastName} | ${parent.mobileNumber}`
            : '-',
        };
      }),
    );

    return {
      type: 'success',
      message: 'Users fetched successfully',
      data: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    return {
      type: 'success',
      message: 'User fetched successfully',
      data: user,
    };
  }

  async parentListSearch(search: string) {
    const users = await this.userRepository.find({
      where: [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { mobileNumber: Like(`%${search}%`) },
        { emailAddress: Like(`%${search}%`) },
        { outletName: Like(`%${search}%`) },
      ],
      take: 10,
    });

    return {
      type: 'success',
      message: 'Users fetched successfully',
      data: users,
    };
  }

  async createUser(createDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate password and PIN
      const password = randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      const tPin = Math.floor(1000 + Math.random() * 9000).toString();

      const user = this.userRepository.create({
        parentId: createDto.parent_id,
        roleId: createDto.role_id,
        schemeId: createDto.scheme_id,
        outletName: createDto.outlet_name,
        firstName: createDto.first_name,
        middleName: createDto.middle_name,
        lastName: createDto.last_name,
        dateOfBirth: createDto.date_of_birth,
        mobileNumber: createDto.mobile_number,
        emailAddress: createDto.email_address,
        password: hashedPassword,
        tPin,
        loginType: createDto.login_type,
        gender: createDto.gender,
        flatDoorNo: createDto.flat_door_no,
        roadStreet: createDto.road_street,
        areaLocality: createDto.area_locality,
        city: createDto.city,
        state: createDto.state,
        district: createDto.district,
        miniumBalance: createDto.minium_balance,
        kycStatus: createDto.kyc_status,
        bankAccountNumber: createDto.bank_account_number,
        branchName: createDto.branch_name,
        ifscCode: createDto.ifsc_code,
        bankAccountType: createDto.bank_account_type,
        ipAddress: createDto.ip_address,
        callbackUrl: createDto.callback_url,
        complaintCallbackUrl: createDto.complaint_callback_url,
        profilePic: createDto.profile_pic || 'avatar-2.png',
        status: createDto.status,
        registerBy: 'Admin',
      });

      const savedUser = await queryRunner.manager.save(user);

      // Send welcome message
      await this.sendWelcomeMessage(savedUser, password, tPin);

      await queryRunner.commitTransaction();

      return {
        type: 'success',
        message: 'User created successfully. Login details sent via email, WhatsApp & SMS',
        data: savedUser,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Failed to create user',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(updateDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    user.parentId = updateDto.parent_id;
    user.roleId = updateDto.role_id;
    user.schemeId = updateDto.scheme_id;
    user.outletName = updateDto.outlet_name;
    user.firstName = updateDto.first_name;
    user.middleName = updateDto.middle_name || user.middleName;
    user.lastName = updateDto.last_name || user.lastName;
    user.dateOfBirth = updateDto.date_of_birth;
    user.mobileNumber = updateDto.mobile_number;
    user.emailAddress = updateDto.email_address;
    user.loginType = updateDto.login_type;
    user.gender = updateDto.gender;
    user.flatDoorNo = updateDto.flat_door_no || user.flatDoorNo;
    user.roadStreet = updateDto.road_street || user.roadStreet;
    user.areaLocality = updateDto.area_locality;
    user.city = updateDto.city;
    user.state = updateDto.state;
    user.district = updateDto.district;
    user.miniumBalance = updateDto.minium_balance;
    user.kycStatus = updateDto.kyc_status;
    user.bankAccountNumber = updateDto.bank_account_number;
    user.branchName = updateDto.branch_name;
    user.ifscCode = updateDto.ifsc_code;
    user.bankAccountType = updateDto.bank_account_type;
    user.ipAddress = updateDto.ip_address || user.ipAddress;
    user.callbackUrl = updateDto.callback_url || user.callbackUrl;
    user.complaintCallbackUrl = updateDto.complaint_callback_url || user.complaintCallbackUrl;
    user.profilePic = updateDto.profile_pic || updateDto.old_profile_pic || user.profilePic;
    user.status = updateDto.status;

    const updatedUser = await this.userRepository.save(user);

    return {
      type: 'success',
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async deleteUser(id: number) {
    await this.userRepository.update(id, {
      deletedAt: new Date(),
    });

    return {
      type: 'success',
      message: 'User deleted successfully',
    };
  }

  async fundUpdate(fundUpdateDto: FundUpdateDto, adminUserId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const adminUser = await this.userRepository.findOne({
        where: { id: adminUserId },
      });

      if (!adminUser) {
        throw new BadRequestException({
          type: 'error',
          message: 'Admin user not found',
        });
      }

      const targetUser = await this.userRepository.findOne({
        where: { id: fundUpdateDto.id },
      });

      if (!targetUser) {
        throw new BadRequestException({
          type: 'error',
          message: 'Target user not found',
        });
      }

      const orderId = `FND${Math.floor(100000000 + Math.random() * 900000000)}`;

      if (fundUpdateDto.type === 'Transfer') {
        if (Number(adminUser.walletBalance) < fundUpdateDto.amount) {
          throw new BadRequestException({
            type: 'error',
            message: 'You have insufficient wallet balance',
          });
        }

        // Debit from admin
        const adminOpeningBalance = Number(adminUser.walletBalance);
        adminUser.walletBalance = adminOpeningBalance - fundUpdateDto.amount;
        await queryRunner.manager.save(adminUser);

        const adminReport = this.reportRepository.create({
          userId: adminUser.id,
          creditUserId: 0,
          debitUserId: targetUser.id,
          amount: fundUpdateDto.amount,
          totalAmount: fundUpdateDto.amount,
          fundType: 'Debit',
          transactionType: 'Transfer Money',
          remark: fundUpdateDto.remark,
          status: 'Success',
          orderId,
          openingBalance: adminOpeningBalance,
          closingBalance: adminUser.walletBalance,
          transactionDate: new Date().toISOString(),
        });
        await queryRunner.manager.save(adminReport);

        // Credit to target user
        const targetOpeningBalance = Number(targetUser.walletBalance);
        targetUser.walletBalance = targetOpeningBalance + fundUpdateDto.amount;
        await queryRunner.manager.save(targetUser);

        const targetReport = this.reportRepository.create({
          userId: targetUser.id,
          creditUserId: adminUser.id,
          debitUserId: 0,
          amount: fundUpdateDto.amount,
          totalAmount: fundUpdateDto.amount,
          fundType: 'Credit',
          transactionType: 'Transfer Money',
          remark: fundUpdateDto.remark,
          status: 'Success',
          orderId,
          openingBalance: targetOpeningBalance,
          closingBalance: targetUser.walletBalance,
          transactionDate: new Date().toISOString(),
        });
        await queryRunner.manager.save(targetReport);
      } else if (fundUpdateDto.type === 'Reverse') {
        if (Number(targetUser.walletBalance) < fundUpdateDto.amount) {
          throw new BadRequestException({
            type: 'error',
            message: 'Target user has insufficient wallet balance',
          });
        }

        // Debit from target user
        const targetOpeningBalance = Number(targetUser.walletBalance);
        targetUser.walletBalance = targetOpeningBalance - fundUpdateDto.amount;
        await queryRunner.manager.save(targetUser);

        const targetReport = this.reportRepository.create({
          userId: targetUser.id,
          creditUserId: 0,
          debitUserId: adminUser.id,
          amount: fundUpdateDto.amount,
          totalAmount: fundUpdateDto.amount,
          fundType: 'Debit',
          transactionType: 'Reverse Money',
          remark: fundUpdateDto.remark,
          status: 'Success',
          orderId,
          openingBalance: targetOpeningBalance,
          closingBalance: targetUser.walletBalance,
          transactionDate: new Date().toISOString(),
        });
        await queryRunner.manager.save(targetReport);

        // Credit to admin
        const adminOpeningBalance = Number(adminUser.walletBalance);
        adminUser.walletBalance = adminOpeningBalance + fundUpdateDto.amount;
        await queryRunner.manager.save(adminUser);

        const adminReport = this.reportRepository.create({
          userId: adminUser.id,
          creditUserId: targetUser.id,
          debitUserId: 0,
          amount: fundUpdateDto.amount,
          totalAmount: fundUpdateDto.amount,
          fundType: 'Credit',
          transactionType: 'Reverse Money',
          remark: fundUpdateDto.remark,
          status: 'Success',
          orderId,
          openingBalance: adminOpeningBalance,
          closingBalance: adminUser.walletBalance,
          transactionDate: new Date().toISOString(),
        });
        await queryRunner.manager.save(adminReport);
      }

      await queryRunner.commitTransaction();

      return {
        type: 'success',
        message: `Fund ${fundUpdateDto.type} successful`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({
        type: 'error',
        message: error.message || 'Fund update failed',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async resetPassword(id: number) {
    const password = randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepository.update(id, {
      password: hashedPassword,
    });

    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      await this.sendPasswordResetMessage(user, password);
    }

    return {
      type: 'success',
      message: 'Password reset successfully',
    };
  }

  async resetPin(id: number) {
    const tPin = Math.floor(1000 + Math.random() * 9000).toString();

    await this.userRepository.update(id, {
      tPin,
    });

    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      await this.sendPinResetMessage(user, tPin);
    }

    return {
      type: 'success',
      message: 'PIN reset successfully',
    };
  }

  private async sendWelcomeMessage(user: User, password: string, tPin: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'create_user' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, user.firstName || '');
      content = content.replace(/{MOBILE}/g, user.mobileNumber || '');
      content = content.replace(/{PASSWORD}/g, password);
      content = content.replace(/{PIN}/g, tPin);

      await this.sendWhatsAppMessage(user.mobileNumber, content);
    }
  }

  private async sendPasswordResetMessage(user: User, password: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'forgot_password' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, user.firstName || '');
      content = content.replace(/{MIDDLE_NAME}/g, user.middleName || '');
      content = content.replace(/{LAST_NAME}/g, user.lastName || '');
      content = content.replace(/{OUTLET_NAME}/g, user.outletName || '');
      content = content.replace(/{MOBILE}/g, user.mobileNumber || '');
      content = content.replace(/{PASSWORD}/g, password);
      content = content.replace(/{PIN}/g, user.tPin || '');

      await this.sendWhatsAppMessage(user.mobileNumber, content);
    }
  }

  private async sendPinResetMessage(user: User, tPin: string) {
    const smsTemplate = await this.smsTemplateRepository.findOne({
      where: { slug: 'forgot_pin' },
    });

    if (smsTemplate && smsTemplate.status === 1) {
      let content = smsTemplate.content;
      content = content.replace(/{NAME}/g, user.firstName || '');
      content = content.replace(/{MIDDLE_NAME}/g, user.middleName || '');
      content = content.replace(/{LAST_NAME}/g, user.lastName || '');
      content = content.replace(/{OUTLET_NAME}/g, user.outletName || '');
      content = content.replace(/{MOBILE}/g, user.mobileNumber || '');
      content = content.replace(/{PIN}/g, tPin);

      await this.sendWhatsAppMessage(user.mobileNumber, content);
    }
  }

  private async sendWhatsAppMessage(mobileNumber: string, message: string): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('WHATSAPP_API');
      const sender = this.configService.get<string>('WHATSAPP_SENDER', '919906514212');
      const endpoint = 'https://wa.alterera.net/send-message';

      if (!apiKey) {
        console.error('WHATSAPP_API not configured');
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

      await this.httpHelper.curl(
        endpoint,
        'POST',
        JSON.stringify(requestData),
        {},
        'no',
        'WHATSAPP_USER_MANAGEMENT',
        `USER-${Date.now()}`,
      );
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    }
  }
}
