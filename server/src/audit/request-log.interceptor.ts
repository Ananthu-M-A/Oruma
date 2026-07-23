import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HttpRequest');
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url: string;
      requestId?: string;
      user?: { userId?: string; role?: string };
    }>();
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const startedAt = Date.now();
    let failureStatus: number | undefined;
    return next.handle().pipe(
      tap({
        error: (error: { status?: number; statusCode?: number }) => {
          failureStatus = error.status ?? error.statusCode ?? 500;
        },
        finalize: () =>
          this.logger.log(
            JSON.stringify({
              event: 'http_request',
              requestId: request.requestId,
              method: request.method,
              path: request.originalUrl ?? request.url,
              statusCode: failureStatus ?? response.statusCode,
              outcome: failureStatus ? 'failure' : 'success',
              durationMs: Date.now() - startedAt,
              actorId: request.user?.userId,
              actorRole: request.user?.role,
            }),
          ),
      }),
    );
  }
}
