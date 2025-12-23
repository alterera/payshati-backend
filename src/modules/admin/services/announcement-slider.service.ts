import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Announcement } from '../../../database/entities/announcement.entity';
import { Slider } from '../../../database/entities/slider.entity';
import {
  UpdateAnnouncementDto,
  CreateSliderDto,
  UpdateSliderDto,
} from '../dto/announcement-slider.dto';

@Injectable()
export class AnnouncementSliderService {
  constructor(
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
    @InjectRepository(Slider)
    private sliderRepository: Repository<Slider>,
  ) {}

  // Announcement methods
  async getAnnouncement(id: number = 1) {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });

    if (!announcement) {
      throw new BadRequestException({
        type: 'error',
        message: 'Announcement not found',
      });
    }

    return {
      type: 'success',
      message: 'Announcement fetched successfully',
      data: announcement,
    };
  }

  async updateAnnouncement(updateDto: UpdateAnnouncementDto) {
    let announcement = await this.announcementRepository.findOne({
      where: { id: 1 },
    });

    if (!announcement) {
      announcement = this.announcementRepository.create({
        id: 1,
        message: updateDto.announcement,
      });
    } else {
      announcement.message = updateDto.announcement;
    }

    const updated = await this.announcementRepository.save(announcement);
    return {
      type: 'success',
      message: 'Announcement updated successfully',
      data: updated,
    };
  }

  // Slider methods
  async listSliders() {
    const sliders = await this.sliderRepository.find({
      where: { deletedAt: IsNull() },
      order: { id: 'DESC' },
    });

    return {
      type: 'success',
      message: 'Sliders fetched successfully',
      data: sliders,
    };
  }

  async getSlider(id: number) {
    const slider = await this.sliderRepository.findOne({
      where: { id },
    });

    if (!slider) {
      throw new BadRequestException({
        type: 'error',
        message: 'Slider not found',
      });
    }

    return {
      type: 'success',
      message: 'Slider fetched successfully',
      data: slider,
    };
  }

  async createSlider(createDto: CreateSliderDto) {
    const slider = this.sliderRepository.create({
      title: createDto.slider_title,
      image: createDto.slider_image || 'slider_image.png',
      status: createDto.status,
    });

    const saved = await this.sliderRepository.save(slider);
    return {
      type: 'success',
      message: 'Slider created successfully',
      data: saved,
    };
  }

  async updateSlider(updateDto: UpdateSliderDto) {
    const slider = await this.sliderRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!slider) {
      throw new BadRequestException({
        type: 'error',
        message: 'Slider not found',
      });
    }

    slider.title = updateDto.slider_title;
    if (updateDto.slider_image) {
      slider.image = updateDto.slider_image;
    }
    slider.status = updateDto.status;

    const updated = await this.sliderRepository.save(slider);
    return {
      type: 'success',
      message: 'Slider updated successfully',
      data: updated,
    };
  }

  async deleteSlider(id: number) {
    await this.sliderRepository.update(id, {
      deletedAt: new Date(),
    });

    return {
      type: 'success',
      message: 'Slider deleted successfully',
    };
  }
}
