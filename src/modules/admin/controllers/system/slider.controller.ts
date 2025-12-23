import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { AnnouncementSliderService } from '../../services/announcement-slider.service';
import {
  ListSliderDto,
  GetSliderDto,
  CreateSliderDto,
  UpdateSliderDto,
  DeleteSliderDto,
} from '../../dto/announcement-slider.dto';

@Controller('v1/admin/system/slider')
export class SliderController {
  constructor(
    private readonly announcementSliderService: AnnouncementSliderService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listSliders(@Body() dto: ListSliderDto) {
    return this.announcementSliderService.listSliders();
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getSlider(@Body() dto: GetSliderDto) {
    return this.announcementSliderService.getSlider(dto.id);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createSlider(@Body() dto: CreateSliderDto) {
    return this.announcementSliderService.createSlider(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateSlider(@Body() dto: UpdateSliderDto) {
    return this.announcementSliderService.updateSlider(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteSlider(@Body() dto: DeleteSliderDto) {
    return this.announcementSliderService.deleteSlider(dto.id);
  }
}
