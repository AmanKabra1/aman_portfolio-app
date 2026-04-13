import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const { method, url, body } = req;
    const startTime = Date.now();

    console.log(`📥 ${method} ${url}`);
    console.log('Body:', body);

    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - startTime;
        console.log(`📤 ${method} ${url} - ${time}ms`);
      }),
    );
  }
}