import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '../../../database/entities/state.entity';

@Injectable()
export class StateManagementService {
  constructor(
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) {}

  async listStates(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [states, total] = await this.stateRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'States fetched successfully',
      data: {
        data: states,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getState(id: number) {
    const state = await this.stateRepository.findOne({
      where: { id },
    });

    if (!state) {
      throw new BadRequestException({
        type: 'error',
        message: 'State not found',
      });
    }

    return {
      type: 'success',
      message: 'State fetched successfully',
      data: state,
    };
  }

  async createState(stateName: string, planApiCode?: string, mplanStateCode?: string, status: number = 1) {
    // Check if state with same name already exists
    const existingState = await this.stateRepository.findOne({
      where: {
        stateName,
      },
    });

    if (existingState) {
      throw new BadRequestException({
        type: 'error',
        message: 'State with this name already exists',
      });
    }

    // Check if plan_api_code is already used by another state
    if (planApiCode) {
      const existingCode = await this.stateRepository.findOne({
        where: {
          planApiCode,
        },
      });

      if (existingCode) {
        throw new BadRequestException({
          type: 'error',
          message: `Plan API Code "${planApiCode}" is already assigned to state "${existingCode.stateName}"`,
        });
      }
    }

    const state = this.stateRepository.create({
      stateName,
      planApiCode: planApiCode || null,
      mplanStateCode: mplanStateCode || null,
      status,
    });

    const savedState = await this.stateRepository.save(state);

    return {
      type: 'success',
      message: 'State created successfully',
      data: savedState,
    };
  }

  async updateState(id: number, stateName: string, planApiCode?: string, mplanStateCode?: string, status: number = 1) {
    const state = await this.stateRepository.findOne({
      where: { id },
    });

    if (!state) {
      throw new BadRequestException({
        type: 'error',
        message: 'State not found',
      });
    }

    // Check if another state with same name exists
    const existingState = await this.stateRepository.findOne({
      where: {
        stateName,
      },
    });

    if (existingState && existingState.id !== id) {
      throw new BadRequestException({
        type: 'error',
        message: 'State with this name already exists',
      });
    }

    // Check if plan_api_code is already used by another state
    if (planApiCode) {
      const existingCode = await this.stateRepository.findOne({
        where: {
          planApiCode,
        },
      });

      if (existingCode && existingCode.id !== id) {
        throw new BadRequestException({
          type: 'error',
          message: `Plan API Code "${planApiCode}" is already assigned to state "${existingCode.stateName}"`,
        });
      }
    }

    state.stateName = stateName;
    state.planApiCode = planApiCode || null;
    state.mplanStateCode = mplanStateCode || null;
    state.status = status;

    const updatedState = await this.stateRepository.save(state);

    return {
      type: 'success',
      message: 'State updated successfully',
      data: updatedState,
    };
  }

  async deleteState(id: number) {
    const state = await this.stateRepository.findOne({
      where: { id },
    });

    if (!state) {
      throw new BadRequestException({
        type: 'error',
        message: 'State not found',
      });
    }

    // Hard delete (states don't have soft delete)
    await this.stateRepository.remove(state);

    return {
      type: 'success',
      message: 'State deleted successfully',
    };
  }
}

