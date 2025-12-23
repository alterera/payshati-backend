import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmountWizeSwitch } from '../../../database/entities/amount-wize-switch.entity';
import { StateWizeSwitch } from '../../../database/entities/state-wize-switch.entity';
import { UserWizeSwitch } from '../../../database/entities/user-wize-switch.entity';
import {
  CreateAmountWizeSwitchDto,
  UpdateAmountWizeSwitchDto,
  CreateStateWizeSwitchDto,
  UpdateStateWizeSwitchDto,
  CreateUserWizeSwitchDto,
  UpdateUserWizeSwitchDto,
} from '../dto/switch-management.dto';

@Injectable()
export class SwitchManagementService {
  constructor(
    @InjectRepository(AmountWizeSwitch)
    private amountWizeSwitchRepository: Repository<AmountWizeSwitch>,
    @InjectRepository(StateWizeSwitch)
    private stateWizeSwitchRepository: Repository<StateWizeSwitch>,
    @InjectRepository(UserWizeSwitch)
    private userWizeSwitchRepository: Repository<UserWizeSwitch>,
  ) {}

  // Amount-wise Switch methods
  async listAmountWizeSwitches(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [switches, total] = await this.amountWizeSwitchRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'Amount-wise switches fetched successfully',
      data: switches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAmountWizeSwitch(id: number) {
    const switchData = await this.amountWizeSwitchRepository.findOne({
      where: { id },
    });

    if (!switchData) {
      throw new BadRequestException({
        type: 'error',
        message: 'Amount-wise switch not found',
      });
    }

    return {
      type: 'success',
      message: 'Amount-wise switch fetched successfully',
      data: switchData,
    };
  }

  async createAmountWizeSwitch(createDto: CreateAmountWizeSwitchDto) {
    const existing = await this.amountWizeSwitchRepository.findOne({
      where: {
        serviceId: createDto.service_id,
        providerId: createDto.provider_id,
      },
    });

    if (existing) {
      throw new BadRequestException({
        type: 'error',
        message: 'Already added, please edit',
      });
    }

    const switchData = this.amountWizeSwitchRepository.create({
      serviceId: createDto.service_id,
      providerId: createDto.provider_id,
      apiId: createDto.api_id,
      amount: createDto.amount_switch,
      status: createDto.status,
    });

    const saved = await this.amountWizeSwitchRepository.save(switchData);
    return {
      type: 'success',
      message: 'Amount-wise switch created successfully',
      data: saved,
    };
  }

  async updateAmountWizeSwitch(updateDto: UpdateAmountWizeSwitchDto) {
    const switchData = await this.amountWizeSwitchRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!switchData) {
      throw new BadRequestException({
        type: 'error',
        message: 'Amount-wise switch not found',
      });
    }

    switchData.apiId = updateDto.api_id;
    switchData.amount = updateDto.amount_switch;
    switchData.status = updateDto.status;

    const updated = await this.amountWizeSwitchRepository.save(switchData);
    return {
      type: 'success',
      message: 'Amount-wise switch updated successfully',
      data: updated,
    };
  }

  async deleteAmountWizeSwitch(id: number) {
    await this.amountWizeSwitchRepository.delete(id);
    return {
      type: 'success',
      message: 'Amount-wise switch deleted successfully',
    };
  }

  // State-wise Switch methods
  async listStateWizeSwitches(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [switches, total] = await this.stateWizeSwitchRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'State-wise switches fetched successfully',
      data: switches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStateWizeSwitch(id: number) {
    const switchData = await this.stateWizeSwitchRepository.findOne({
      where: { id },
    });

    if (!switchData) {
      throw new BadRequestException({
        type: 'error',
        message: 'State-wise switch not found',
      });
    }

    return {
      type: 'success',
      message: 'State-wise switch fetched successfully',
      data: switchData,
    };
  }

  async createStateWizeSwitch(createDto: CreateStateWizeSwitchDto) {
    const existing = await this.stateWizeSwitchRepository.findOne({
      where: {
        serviceId: createDto.service_id,
        providerId: createDto.provider_id,
        stateId: createDto.state_id,
      },
    });

    if (existing) {
      throw new BadRequestException({
        type: 'error',
        message: 'Already added, please edit',
      });
    }

    const switchData = this.stateWizeSwitchRepository.create({
      serviceId: createDto.service_id,
      providerId: createDto.provider_id,
      apiId: createDto.api_id,
      stateId: createDto.state_id,
      amount: createDto.amount_switch,
      status: createDto.status,
    });

    const saved = await this.stateWizeSwitchRepository.save(switchData);
    return {
      type: 'success',
      message: 'State-wise switch created successfully',
      data: saved,
    };
  }

  async updateStateWizeSwitch(updateDto: UpdateStateWizeSwitchDto) {
    const switchData = await this.stateWizeSwitchRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!switchData) {
      throw new BadRequestException({
        type: 'error',
        message: 'State-wise switch not found',
      });
    }

    switchData.apiId = updateDto.api_id;
    switchData.amount = updateDto.amount_switch;
    switchData.status = updateDto.status;

    const updated = await this.stateWizeSwitchRepository.save(switchData);
    return {
      type: 'success',
      message: 'State-wise switch updated successfully',
      data: updated,
    };
  }

  async deleteStateWizeSwitch(id: number) {
    await this.stateWizeSwitchRepository.delete(id);
    return {
      type: 'success',
      message: 'State-wise switch deleted successfully',
    };
  }

  // User-wise Switch methods
  async listUserWizeSwitches(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [switches, total] = await this.userWizeSwitchRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'User-wise switches fetched successfully',
      data: switches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserWizeSwitch(id: number) {
    const switchData = await this.userWizeSwitchRepository.findOne({
      where: { id },
    });

    if (!switchData) {
      throw new BadRequestException({
        type: 'error',
        message: 'User-wise switch not found',
      });
    }

    return {
      type: 'success',
      message: 'User-wise switch fetched successfully',
      data: switchData,
    };
  }

  async createUserWizeSwitch(createDto: CreateUserWizeSwitchDto) {
    const switchData = this.userWizeSwitchRepository.create({
      userId: createDto.id_value,
      serviceId: createDto.service_id,
      providerId: createDto.provider_id,
      apiId: createDto.api_id,
      stateId: createDto.state_id,
      amount: createDto.amount_switch,
      status: createDto.status,
    });

    const saved = await this.userWizeSwitchRepository.save(switchData);
    return {
      type: 'success',
      message: 'User-wise switch created successfully',
      data: saved,
    };
  }

  async updateUserWizeSwitch(updateDto: UpdateUserWizeSwitchDto) {
    const switchData = await this.userWizeSwitchRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!switchData) {
      throw new BadRequestException({
        type: 'error',
        message: 'User-wise switch not found',
      });
    }

    switchData.apiId = updateDto.api_id;
    switchData.amount = updateDto.amount_switch;
    switchData.status = updateDto.status;

    const updated = await this.userWizeSwitchRepository.save(switchData);
    return {
      type: 'success',
      message: 'User-wise switch updated successfully',
      data: updated,
    };
  }

  async deleteUserWizeSwitch(id: number) {
    await this.userWizeSwitchRepository.delete(id);
    return {
      type: 'success',
      message: 'User-wise switch deleted successfully',
    };
  }
}
