import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { HttpHelper } from '../../../common/helpers/http.helper';

@Injectable()
export class ApiPartnerGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private httpHelper: HttpHelper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body || {};
    const query = request.query || {};

    const apiKey = body.api_key || query.api_key;

    if (!apiKey) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'api_key is required',
      });
    }

    const user = await this.userRepository.findOne({
      where: {
        apiKey,
      },
    });

    if (!user || [1, 2].includes(user.roleId)) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'Invalid api key',
      });
    }

    // Check IP address
    const clientIp = this.httpHelper.getIp(request);
    if (user.ipAddress && user.ipAddress !== clientIp) {
      throw new UnauthorizedException({
        type: 'error',
        message: `Invalid ip address your ip is ${clientIp}`,
      });
    }

    // Attach user to request
    request.user = user;
    return true;
  }
}
