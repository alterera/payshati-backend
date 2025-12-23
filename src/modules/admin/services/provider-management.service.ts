import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Provider } from '../../../database/entities/provider.entity';
import { Service } from '../../../database/entities/service.entity';
import { Api } from '../../../database/entities/api.entity';
import { State } from '../../../database/entities/state.entity';
import {
  CreateProviderDto,
  UpdateProviderDto,
} from '../dto/provider-management.dto';

@Injectable()
export class ProviderManagementService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) {}

  async listProviders(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [providers, total] = await this.providerRepository.findAndCount({
      where: { deletedAt: IsNull() },
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    // Join with services to get service names
    const providersWithServiceNames = await Promise.all(
      providers.map(async (provider) => {
        const service = await this.serviceRepository.findOne({
          where: { id: provider.serviceId },
          select: ['id', 'serviceName'],
        });

        return {
          ...provider,
          serviceName: service?.serviceName || 'Unknown Service',
        };
      }),
    );

    return {
      type: 'success',
      message: 'Providers fetched successfully',
      data: {
        data: providersWithServiceNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getProvider(id: number) {
    const provider = await this.providerRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider not found',
      });
    }

    return {
      type: 'success',
      message: 'Provider fetched successfully',
      data: provider,
    };
  }

  async getApiAndService() {
    const services = await this.serviceRepository.find({
      where: { status: 1, deletedAt: IsNull() },
      select: ['id', 'serviceName'],
    });

    const states = await this.stateRepository.find({
      select: ['id', 'stateName'],
    });

    const apis = await this.apiRepository.find({
      where: { status: 1, deletedAt: IsNull() },
      select: ['id', 'apiName'],
    });

    return {
      type: 'success',
      message: 'Data fetched successfully',
      data: {
        services,
        states,
        apis,
      },
    };
  }

  async createProvider(createProviderDto: CreateProviderDto) {
    const provider = this.providerRepository.create({
      providerName: createProviderDto.provider_name,
      serviceId: createProviderDto.service_name,
      apiId: createProviderDto.api_name,
      backupApiId: createProviderDto.backup_api_name || 0,
      backupApi2Id: createProviderDto.backup_api2_name || 0,
      backupApi3Id: createProviderDto.backup_api3_name || 0,
      providerLogo: createProviderDto.provider_logo || 'provider_logo.png',
      status: createProviderDto.status,
      // Note: minium_amount, maxium_amount, provider_down, amount_type, amount_value
      // These fields are not in the Provider entity but are accepted in DTO for compatibility
      // They may be stored in a separate table or used for validation only
    });

    const savedProvider = await this.providerRepository.save(provider);

    return {
      type: 'success',
      message: 'Provider created successfully',
      data: savedProvider,
    };
  }

  async updateProvider(updateProviderDto: UpdateProviderDto) {
    const provider = await this.providerRepository.findOne({
      where: { id: updateProviderDto.edit_id },
    });

    if (!provider) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider not found',
      });
    }

    provider.providerName = updateProviderDto.provider_name;
    provider.serviceId = updateProviderDto.service_name;
    provider.apiId = updateProviderDto.api_name;
    provider.backupApiId = updateProviderDto.backup_api_name || 0;
    provider.backupApi2Id = updateProviderDto.backup_api2_name || 0;
    provider.backupApi3Id = updateProviderDto.backup_api3_name || 0;
    provider.providerLogo = updateProviderDto.provider_logo || updateProviderDto.old_provider_logo || provider.providerLogo;
    provider.status = updateProviderDto.status;

    const updatedProvider = await this.providerRepository.save(provider);

    return {
      type: 'success',
      message: 'Provider updated successfully',
      data: updatedProvider,
    };
  }

  async deleteProvider(id: number) {
    const provider = await this.providerRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new BadRequestException({
        type: 'error',
        message: 'Provider not found',
      });
    }

    await this.providerRepository.update(id, {
      deletedAt: new Date(),
    });

    return {
      type: 'success',
      message: 'Provider deleted successfully',
    };
  }
}
