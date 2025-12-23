import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Service } from '../../../database/entities/service.entity';

@Injectable()
export class ServiceManagementService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async listServices(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [services, total] = await this.serviceRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
      },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'Services fetched successfully',
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getService(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new BadRequestException({
        type: 'error',
        message: 'Service not found',
      });
    }

    return {
      type: 'success',
      message: 'Service fetched successfully',
      data: service,
    };
  }

  async createService(serviceName: string, status: number) {
    // Check if service with same name already exists
    const existingService = await this.serviceRepository.findOne({
      where: {
        serviceName,
        deletedAt: IsNull(),
      },
    });

    if (existingService) {
      throw new BadRequestException({
        type: 'error',
        message: 'Service with this name already exists',
      });
    }

    const service = this.serviceRepository.create({
      serviceName,
      status,
    });

    const savedService = await this.serviceRepository.save(service);

    return {
      type: 'success',
      message: 'Service created successfully',
      data: savedService,
    };
  }

  async updateService(id: number, serviceName: string, status: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new BadRequestException({
        type: 'error',
        message: 'Service not found',
      });
    }

    // Check if another service with same name exists
    const existingService = await this.serviceRepository.findOne({
      where: {
        serviceName,
        deletedAt: IsNull(),
      },
    });

    if (existingService && existingService.id !== id) {
      throw new BadRequestException({
        type: 'error',
        message: 'Service with this name already exists',
      });
    }

    service.serviceName = serviceName;
    service.status = status;

    const updatedService = await this.serviceRepository.save(service);

    return {
      type: 'success',
      message: 'Service updated successfully',
      data: updatedService,
    };
  }

  async deleteService(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      throw new BadRequestException({
        type: 'error',
        message: 'Service not found',
      });
    }

    // Soft delete
    service.deletedAt = new Date();
    await this.serviceRepository.save(service);

    return {
      type: 'success',
      message: 'Service deleted successfully',
    };
  }
}
