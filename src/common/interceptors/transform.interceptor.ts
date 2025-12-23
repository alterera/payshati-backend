import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  type: string;
  message: string;
  data?: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has Laravel-style format, return as is
        if (data && typeof data === 'object' && 'type' in data) {
          return data;
        }
        // Otherwise wrap in standard format
        return {
          type: 'success',
          message: 'Operation successful',
          ...(data && { data }),
        };
      }),
    );
  }
}
