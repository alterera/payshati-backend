import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteSetting } from '../../../database/entities/route-setting.entity';
import { AmountWizeSwitch } from '../../../database/entities/amount-wize-switch.entity';
import { StateWizeSwitch } from '../../../database/entities/state-wize-switch.entity';
import { UserWizeSwitch } from '../../../database/entities/user-wize-switch.entity';
import { Provider } from '../../../database/entities/provider.entity';
import { User } from '../../../database/entities/user.entity';

export interface ApiRoutingRequest {
  providerId: number;
  amount: number;
  stateId?: number;
  userId: number;
}

@Injectable()
export class ApiRouterService {
  constructor(
    @InjectRepository(RouteSetting)
    private routeSettingRepository: Repository<RouteSetting>,
    @InjectRepository(AmountWizeSwitch)
    private amountWizeSwitchRepository: Repository<AmountWizeSwitch>,
    @InjectRepository(StateWizeSwitch)
    private stateWizeSwitchRepository: Repository<StateWizeSwitch>,
    @InjectRepository(UserWizeSwitch)
    private userWizeSwitchRepository: Repository<UserWizeSwitch>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Replaces helpers::checkApis function
   * Determines which API to use based on route priority
   */
  async checkApis(request: ApiRoutingRequest): Promise<number> {
    // Get routes in priority order
    const routes = await this.routeSettingRepository.find({
      where: { status: 1 },
      order: { priority: 'ASC' },
    });

    for (const route of routes) {
      const apiId = await this.checkRoute(route.routeCode, request);
      if (apiId !== 0) {
        return apiId;
      }
    }

    // Default: use provider's default API
    const provider = await this.providerRepository.findOne({
      where: { id: request.providerId },
    });

    return provider?.apiId || 0;
  }

  private async checkRoute(
    routeCode: string,
    request: ApiRoutingRequest,
  ): Promise<number> {
    if (routeCode === 'amount_wize') {
      return this.checkAmountWize(request);
    } else if (routeCode === 'user_wize') {
      return this.checkUserWize(request);
    } else if (routeCode === 'state_wize') {
      return this.checkStateWize(request);
    }
    return 0;
  }

  private async checkAmountWize(
    request: ApiRoutingRequest,
  ): Promise<number> {
    const amountWize = await this.amountWizeSwitchRepository.findOne({
      where: {
        providerId: request.providerId,
        status: 1,
      },
    });

    if (!amountWize) {
      return 0;
    }

    if (!amountWize.amount || amountWize.amount === '0') {
      return 0;
    }

    const amounts = amountWize.amount.split(',');
    if (amounts.includes(String(request.amount))) {
      return amountWize.apiId;
    }

    return 0;
  }

  private async checkUserWize(
    request: ApiRoutingRequest,
  ): Promise<number> {
    if (!request.stateId) {
      return 0;
    }

    const userWize = await this.userWizeSwitchRepository.findOne({
      where: {
        providerId: request.providerId,
        userId: request.userId,
        stateId: request.stateId,
        status: 1,
      },
    });

    if (!userWize) {
      return 0;
    }

    if (!userWize.amount || userWize.amount === '0' || userWize.amount === '') {
      return userWize.apiId;
    }

    const amounts = userWize.amount.split(',');
    if (amounts.includes(String(request.amount))) {
      return userWize.apiId;
    }

    return 0;
  }

  private async checkStateWize(
    request: ApiRoutingRequest,
  ): Promise<number> {
    if (!request.stateId) {
      return 0;
    }

    const stateWize = await this.stateWizeSwitchRepository.findOne({
      where: {
        providerId: request.providerId,
        stateId: request.stateId,
        status: 1,
      },
    });

    if (!stateWize) {
      return 0;
    }

    if (!stateWize.amount || stateWize.amount === '0' || stateWize.amount === '') {
      return stateWize.apiId;
    }

    const amounts = stateWize.amount.split(',');
    if (amounts.includes(String(request.amount))) {
      return stateWize.apiId;
    }

    return 0;
  }
}
