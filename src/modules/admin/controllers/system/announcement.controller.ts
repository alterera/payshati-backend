import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { AnnouncementSliderService } from '../../services/announcement-slider.service';
import {
  GetAnnouncementDto,
  UpdateAnnouncementDto,
} from '../../dto/announcement-slider.dto';

@Controller('v1/admin/system/announcement')
export class AnnouncementController {
  constructor(
    private readonly announcementSliderService: AnnouncementSliderService,
  ) {}

  @Post('get')
  @UseGuards(AdminGuard)
  async getAnnouncement(@Body() dto: GetAnnouncementDto) {
    return this.announcementSliderService.getAnnouncement(dto.id);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateAnnouncement(@Body() dto: UpdateAnnouncementDto) {
    return this.announcementSliderService.updateAnnouncement(dto);
  }
}
