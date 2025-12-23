import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class AppUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body || {};
    const query = request.query || {};

    const loginKey = body.login_key || query.login_key;
    const userId = body.user_id || query.user_id;

    if (!loginKey || !userId) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'login_key and user_id are required',
      });
    }

    const user = await this.userRepository.findOne({
      where: {
        loginKey,
        id: userId,
      },
    });

    if (!user || [1, 2].includes(user.roleId)) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'Invalid login details',
      });
    }

    // Attach user to request
    request.user = user;
    return true;
  }
}
