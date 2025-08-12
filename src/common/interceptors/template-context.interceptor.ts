import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class TemplateContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    
    return next.handle().pipe(
      map((data) => {
        // Only add context data for template renders (when data is an object)
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return {
            ...data,
            isDevelopment: process.env.NODE_ENV !== 'production',
            timestamp: new Date().toISOString(),
            // Add formatDate helper alias for backward compatibility
            helpers: {
              formatDate: (date: Date | string, format?: string) => {
                if (!date) return '';
                const d = new Date(date);
                if (isNaN(d.getTime())) return '';
                
                if (!format || format === 'default') {
                  return d.toLocaleDateString('ko-KR') + ' ' + 
                         d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                }
                
                // Add more format options as needed
                return d.toISOString();
              }
            }
          };
        }
        
        return data;
      }),
    );
  }
}