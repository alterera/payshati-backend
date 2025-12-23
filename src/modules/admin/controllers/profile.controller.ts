import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ProfileService } from '../services/profile.service';
import { ChangePasswordDto } from '../dto/profile.dto';

@Controller('v1/admin/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Post('my-profile-data')
  @UseGuards(AdminGuard)
  async getMyProfileData(@Request() req: any) {
    const userId = req.user?.id;
    return this.profileService.getMyProfileData(userId);
  }

  @Post('my-profile-password-change')
  @UseGuards(AdminGuard)
  async changePassword(@Body() dto: ChangePasswordDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.profileService.changePassword(userId, dto);
  }
}
