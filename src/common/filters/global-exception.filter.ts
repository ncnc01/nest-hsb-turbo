import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 상태 코드 결정
    const status = this.getHttpStatus(exception);
    
    // 에러 메시지 결정
    const message = this.getErrorMessage(exception);
    
    // 에러 상세 정보
    const errorDetails = this.getErrorDetails(exception);

    // 로깅
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    // Accept 헤더 확인
    const acceptHeader = request.headers.accept || '';
    const isApiRequest = acceptHeader.includes('application/json');
    const isTurboRequest = acceptHeader.includes('text/vnd.turbo-stream.html');

    // API 요청 (JSON 응답)
    if (isApiRequest) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...errorDetails,
      });
      return;
    }

    // Turbo Stream 요청
    if (isTurboRequest) {
      response.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
      response.status(status).send(`
        <turbo-stream action="replace" target="error-container">
          <template>
            <div class="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex">
                <i class="fas fa-exclamation-triangle text-red-500 mr-3 mt-0.5"></i>
                <div>
                  <h3 class="text-red-800 font-medium">오류가 발생했습니다</h3>
                  <p class="text-red-600 text-sm mt-1">${message}</p>
                  <button 
                    class="mt-3 text-red-700 text-sm underline hover:no-underline"
                    onclick="location.reload()"
                  >
                    페이지 새로고침
                  </button>
                </div>
              </div>
            </div>
          </template>
        </turbo-stream>
      `);
      return;
    }

    // 일반 HTML 요청 - 에러 페이지 렌더링
    const templateData = {
      title: this.getErrorTitle(status),
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      isDevelopment: process.env.NODE_ENV === 'development',
      errorDetails: process.env.NODE_ENV === 'development' ? errorDetails : null,
      layout: 'layouts/error', // 에러 전용 레이아웃 사용
    };

    // 404는 별도 템플릿 사용
    if (status === 404) {
      response.status(404).render('pages/error/404', templateData);
    } else {
      response.status(status).render('pages/error/index', templateData);
    }
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const message = (response as any).message;
        return Array.isArray(message) ? message.join(', ') : message;
      }
      return exception.message;
    }
    
    if (exception instanceof Error) {
      return exception.message;
    }
    
    return '알 수 없는 오류가 발생했습니다.';
  }

  private getErrorDetails(exception: unknown): any {
    if (process.env.NODE_ENV !== 'development') {
      return {};
    }

    return {
      stack: exception instanceof Error ? exception.stack : undefined,
      name: exception instanceof Error ? exception.name : 'UnknownError',
      cause: exception instanceof Error ? (exception as any).cause : undefined,
    };
  }

  private getErrorTitle(status: number): string {
    const titles = {
      400: '잘못된 요청',
      401: '인증 필요',
      403: '접근 권한 없음',
      404: '페이지를 찾을 수 없습니다',
      408: '요청 시간 초과',
      422: '처리할 수 없는 요청',
      429: '너무 많은 요청',
      500: '서버 내부 오류',
      502: '잘못된 게이트웨이',
      503: '서비스를 사용할 수 없습니다',
      504: '게이트웨이 시간 초과',
    };

    return titles[status] || `오류 (${status})`;
  }
}