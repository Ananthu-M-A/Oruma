import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuditService } from './audit.service';

type AuditRequest = {
  method: string;
  originalUrl?: string;
  url: string;
  params?: { id?: string };
  requestId?: string;
  ip?: string;
  user?: { userId: string; role: string };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditRequest>();
    if (
      !request.user ||
      !['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    )
      return next.handle();
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const record = (outcome: string, statusCode: number) => {
      const path = request.originalUrl ?? request.url;
      void this.auditService
        .record({
          actorId: request.user?.userId ?? null,
          actorRole: request.user?.role ?? null,
          action: request.method,
          resource: path.split('?')[0],
          resourceId: request.params?.id ?? null,
          requestId: request.requestId ?? 'unknown',
          ipAddress: request.ip ?? null,
          metadata: { outcome, statusCode, path: path.split('?')[0] },
        })
        .catch(() => undefined);
    };
    return next.handle().pipe(
      tap(() => record('success', response.statusCode)),
      catchError((error: { status?: number; statusCode?: number }) => {
        record('failure', error.status ?? error.statusCode ?? 500);
        return throwError(() => error);
      }),
    );
  }
}
