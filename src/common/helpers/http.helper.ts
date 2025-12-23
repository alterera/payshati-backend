import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CurlResponse {
  response: string;
  error: string | null;
  code: number;
}

@Injectable()
export class HttpHelper {
  constructor(
    @Inject(HttpService) private readonly httpService: HttpService,
  ) {}

  /**
   * Replaces Laravel's curl helper function
   * Makes HTTP requests and returns response in Laravel format
   */
  async curl(
    url: string,
    method: string,
    parameters: string,
    headers: Record<string, string>,
    logRequest: string,
    service: string,
    orderId: string,
  ): Promise<CurlResponse> {
    try {
      const config: any = {
        method: method.toUpperCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: 30000, // 30 seconds timeout
      };

      if (parameters && method.toUpperCase() !== 'GET') {
        try {
          config.data = JSON.parse(parameters);
        } catch {
          config.data = parameters;
        }
      }

      const response = await firstValueFrom(
        this.httpService.request(config),
      );

      return {
        response: JSON.stringify(response.data),
        error: null,
        code: response.status,
      };
    } catch (error: any) {
      return {
        response: '',
        error: error.message || 'Request failed',
        code: error.response?.status || 0,
      };
    }
  }

  /**
   * Get client IP address from request
   */
  getIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      '0.0.0.0'
    );
  }
}
