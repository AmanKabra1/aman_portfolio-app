import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has success/message structure, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Otherwise wrap in standard response
        return {
          success: true,
          message: 'Request successful',
          data,
        };
      }),
    );
  }
}
