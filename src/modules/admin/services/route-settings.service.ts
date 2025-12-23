import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteSetting } from '../../../database/entities/route-setting.entity';
import { UpdatePriorityDto } from '../dto/route-settings.dto';

@Injectable()
export class RouteSettingsService {
  constructor(
    @InjectRepository(RouteSetting)
    private routeSettingRepository: Repository<RouteSetting>,
  ) {}

  async listRouteSettings() {
    const settings = await this.routeSettingRepository.find({
      order: { id: 'ASC' },
    });

    return {
      type: 'success',
      message: 'Route settings fetched successfully',
      data: settings,
    };
  }

  async updatePriority(updateDto: UpdatePriorityDto) {
    for (let i = 0; i < updateDto._route_id.length; i++) {
      await this.routeSettingRepository.update(
        { id: updateDto._route_id[i] },
        {
          priority: updateDto.edit_priority[i],
          status: updateDto.edit_status[i],
        },
      );
    }

    return {
      type: 'success',
      message: 'Route priorities updated successfully',
    };
  }
}
