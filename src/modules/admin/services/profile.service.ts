import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../database/entities/user.entity';
import { LoginHistory } from '../../../database/entities/login-history.entity';
import { Company } from '../../../database/entities/company.entity';
import { Announcement } from '../../../database/entities/announcement.entity';
import { Role } from '../../../database/entities/role.entity';
import { ChangePasswordDto } from '../dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getMyProfileData(userId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select([
        'user.firstName',
        'user.middleName',
        'user.lastName',
        'user.outletName',
        'user.dateOfBirth',
        'user.emailAddress',
        'user.mobileNumber',
        'user.city',
        'user.state',
        'user.district',
        'user.miniumBalance',
        'user.walletBalance',
        'user.profilePic',
        'user.kycStatus',
        'user.callbackUrl',
        'user.ipAddress',
        'role.roleName',
      ])
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new BadRequestException({
        type: 'error',
        message: 'User not found',
      });
    }

    const loginHistory = await this.loginHistoryRepository.find({
      where: { userId },
      order: { id: 'DESC' },
      take: 5,
      select: ['ipAddress', 'loginPath', 'createdAt'],
    });

    const company = await this.companyRepository.findOne({
      where: { status: 1 },
      select: [
        'companyName',
        'supportNumber',
        'supportNumber2',
        'supportEmail',
        'companyAddress',
      ],
    });

    const announcement = await this.announcementRepository.findOne({
      where: { id: 1 },
      select: ['message'],
    });

    return {
      type: 'success',
      message: 'Profile data fetched successfully',
      data: {
        user,
        login_history: loginHistory,
        company,
        announcements: announcement?.message || '',
      },
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    if (changePasswordDto.new_password !== changePasswordDto.confirm_password) {
      throw new BadRequestException({
        type: 'error',
        message: 'New password and confirm password do not match',
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, roleId: 1 },
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
        message: 'Current password does not match',
      });
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.confirm_password, 10);
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return {
      type: 'success',
      message: 'Password changed successfully',
    };
  }
}
