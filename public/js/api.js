/**
 * Async API Request System
 * Modern fetch wrapper with comprehensive error handling, retry logic, and UI integration
 */

if (typeof ApiSystem !== 'undefined') {
  console.log('api.js 이미 로드됨, 스킵');
} else {

class ApiSystem {
  constructor() {
    this.baseURL = '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
    this.defaultOptions = {
      timeout: 10000,
      retries: 2,
      retryDelay: 1000,
      showLoading: false,
      showErrors: true,
      showSuccess: false,
      cache: false,
      cacheTTL: 300000, // 5분
    };
    this.requestCache = new Map();
    this.pendingRequests = new Map();
    
    this.init();
  }

  init() {
    // CSRF 토큰 설정
    this.setupCSRFToken();
    
    // 전역 객체에 등록
    window.Api = this;
    
    // HBS 인터랙티브 시스템과 연동
    if (window.HBS) {
      window.HBS.api = this;
    }
  }

  setupCSRFToken() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      this.defaultHeaders['X-CSRF-TOKEN'] = csrfToken;
    }
  }

  /**
   * 요청 인터셉터 추가
   * @param {function} interceptor - 인터셉터 함수
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 응답 인터셉터 추가
   * @param {function} interceptor - 인터셉터 함수
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 에러 인터셉터 추가
   * @param {function} interceptor - 인터셉터 함수
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * GET 요청
   * @param {string} url - 요청 URL
   * @param {object} options - 요청 옵션
   */
  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  /**
   * POST 요청
   * @param {string} url - 요청 URL
   * @param {any} data - 요청 데이터
   * @param {object} options - 요청 옵션
   */
  async post(url, data = null, options = {}) {
    return this.request('POST', url, data, options);
  }

  /**
   * PUT 요청
   * @param {string} url - 요청 URL
   * @param {any} data - 요청 데이터
   * @param {object} options - 요청 옵션
   */
  async put(url, data = null, options = {}) {
    return this.request('PUT', url, data, options);
  }

  /**
   * PATCH 요청
   * @param {string} url - 요청 URL
   * @param {any} data - 요청 데이터
   * @param {object} options - 요청 옵션
   */
  async patch(url, data = null, options = {}) {
    return this.request('PATCH', url, data, options);
  }

  /**
   * DELETE 요청
   * @param {string} url - 요청 URL
   * @param {object} options - 요청 옵션
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  /**
   * 메인 요청 메소드
   * @param {string} method - HTTP 메소드
   * @param {string} url - 요청 URL
   * @param {any} data - 요청 데이터
   * @param {object} options - 요청 옵션
   */
  async request(method, url, data = null, options = {}) {
    const requestOptions = { ...this.defaultOptions, ...options };
    const requestId = this.generateRequestId(method, url, data);
    
    // 중복 요청 방지
    if (requestOptions.preventDuplicate !== false && this.pendingRequests.has(requestId)) {
      return this.pendingRequests.get(requestId);
    }

    // 캐시 확인 (GET 요청만)
    if (method === 'GET' && requestOptions.cache) {
      const cachedResponse = this.getCachedResponse(requestId);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    const requestPromise = this.executeRequest(method, url, data, requestOptions, requestId);
    
    // 진행 중인 요청으로 등록
    this.pendingRequests.set(requestId, requestPromise);

    try {
      const response = await requestPromise;
      return response;
    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  async executeRequest(method, url, data, options, requestId) {
    let attempt = 0;
    let lastError = null;
    let loadingInstance = null;

    // 로딩 표시
    if (options.showLoading) {
      loadingInstance = this.showLoading(options.loadingMessage);
    }

    while (attempt <= options.retries) {
      try {
        // 요청 준비
        const fullUrl = this.buildURL(url);
        const config = await this.buildRequestConfig(method, data, options);

        // 요청 인터셉터 실행
        for (const interceptor of this.requestInterceptors) {
          await interceptor({ method, url: fullUrl, data, options });
        }

        // 타임아웃 처리
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);

        config.signal = controller.signal;

        // 실제 요청 수행
        const response = await fetch(fullUrl, config);
        clearTimeout(timeoutId);

        // 응답 처리
        const result = await this.processResponse(response, options);

        // 응답 인터셉터 실행
        for (const interceptor of this.responseInterceptors) {
          await interceptor({ response, data: result, options });
        }

        // 캐시 저장 (GET 요청이고 성공한 경우)
        if (method === 'GET' && options.cache && response.ok) {
          this.setCachedResponse(requestId, result, options.cacheTTL);
        }

        // 성공 메시지 표시
        if (options.showSuccess && result.message) {
          this.showSuccessMessage(result.message);
        }

        return result;

      } catch (error) {
        lastError = error;
        attempt++;

        // 재시도 로직
        if (attempt <= options.retries && this.shouldRetry(error)) {
          await this.delay(options.retryDelay * attempt);
          continue;
        }

        // 에러 처리
        await this.handleError(error, options);
        throw error;

      } finally {
        // 로딩 숨김
        if (loadingInstance && attempt > options.retries) {
          this.hideLoading(loadingInstance);
        }
      }
    }

    throw lastError;
  }

  buildURL(url) {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  async buildRequestConfig(method, data, options) {
    const config = {
      method,
      headers: { ...this.defaultHeaders, ...options.headers },
    };

    // 데이터 처리
    if (data !== null && method !== 'GET') {
      if (data instanceof FormData) {
        config.body = data;
        // FormData의 경우 Content-Type 자동 설정
        delete config.headers['Content-Type'];
      } else if (typeof data === 'object') {
        config.body = JSON.stringify(data);
      } else {
        config.body = data;
      }
    }

    // 추가 설정
    if (options.credentials !== undefined) {
      config.credentials = options.credentials;
    }

    return config;
  }

  async processResponse(response, options) {
    const contentType = response.headers.get('Content-Type') || '';

    if (!response.ok) {
      const error = new ApiError(
        response.statusText || `HTTP ${response.status}`,
        response.status,
        response
      );

      // 응답 본문이 있으면 파싱 시도
      try {
        if (contentType.includes('application/json')) {
          error.data = await response.json();
        } else {
          error.data = await response.text();
        }
      } catch (parseError) {
        // 파싱 실패는 무시
      }

      throw error;
    }

    // 성공 응답 처리
    if (response.status === 204) {
      return null; // No Content
    }

    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }

  async handleError(error, options) {
    // 에러 인터셉터 실행
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error, options);
    }

    // 에러 메시지 표시
    if (options.showErrors) {
      this.showErrorMessage(error);
    }

    // 로깅
    console.error('API Request Error:', error);
  }

  shouldRetry(error) {
    // 네트워크 오류나 타임아웃은 재시도
    if (error.name === 'AbortError' || error.name === 'TypeError') {
      return true;
    }

    // 5xx 서버 에러는 재시도
    if (error instanceof ApiError && error.status >= 500) {
      return true;
    }

    return false;
  }

  showLoading(message) {
    if (window.Loading) {
      return window.Loading.show(message || '요청 처리 중...', {
        type: 'spinner',
        size: 'sm',
        backdrop: false,
        transparent: true
      });
    }
    return null;
  }

  hideLoading(loadingInstance) {
    if (loadingInstance && loadingInstance.hide) {
      loadingInstance.hide();
    }
  }

  showSuccessMessage(message) {
    if (window.Toast) {
      window.Toast.success(message);
    } else if (window.Alert) {
      window.Alert.success('성공', message);
    }
  }

  showErrorMessage(error) {
    let message = '요청 처리 중 오류가 발생했습니다.';

    if (error instanceof ApiError) {
      if (error.data && error.data.message) {
        message = error.data.message;
      } else {
        message = `${error.message} (${error.status})`;
      }
    } else if (error.message) {
      message = error.message;
    }

    if (window.Toast) {
      window.Toast.error(message, { duration: 5000 });
    } else if (window.Alert) {
      window.Alert.error('오류', message);
    }
  }

  /**
   * 폼 데이터를 API로 전송
   * @param {string|Element} form - 폼 요소
   * @param {object} options - 요청 옵션
   */
  async submitForm(form, options = {}) {
    const formEl = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formEl) throw new Error('Form element not found');

    const formData = new FormData(formEl);
    const method = formEl.method || 'POST';
    const action = formEl.action || window.location.pathname;

    // 폼 검증
    if (options.validate !== false && !formEl.checkValidity()) {
      formEl.reportValidity();
      throw new Error('Form validation failed');
    }

    return this.request(method.toUpperCase(), action, formData, {
      showLoading: true,
      showSuccess: true,
      ...options
    });
  }

  /**
   * 파일 업로드
   * @param {string} url - 업로드 URL
   * @param {File|FileList} files - 파일(들)
   * @param {object} options - 업로드 옵션
   */
  async uploadFiles(url, files, options = {}) {
    const formData = new FormData();
    
    // 파일 추가
    if (files instanceof FileList) {
      for (let i = 0; i < files.length; i++) {
        formData.append(options.fileField || 'files[]', files[i]);
      }
    } else {
      formData.append(options.fileField || 'file', files);
    }

    // 추가 데이터
    if (options.data) {
      Object.entries(options.data).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.post(url, formData, {
      showLoading: true,
      showSuccess: true,
      loadingMessage: '파일 업로드 중...',
      timeout: 60000, // 1분
      ...options
    });
  }

  /**
   * 페이지네이션 API
   * @param {string} url - 기본 URL
   * @param {object} params - 쿼리 파라미터
   * @param {object} options - 요청 옵션
   */
  async paginate(url, params = {}, options = {}) {
    const queryString = this.buildQueryString(params);
    const requestUrl = `${url}${queryString ? `?${queryString}` : ''}`;

    const result = await this.get(requestUrl, options);

    return {
      data: result.data || result,
      pagination: result.pagination || {},
      nextPage: () => {
        if (result.pagination?.hasNext) {
          return this.paginate(url, { ...params, page: (params.page || 1) + 1 }, options);
        }
        return null;
      },
      prevPage: () => {
        if (result.pagination?.hasPrev) {
          return this.paginate(url, { ...params, page: (params.page || 1) - 1 }, options);
        }
        return null;
      }
    };
  }

  /**
   * 배치 요청
   * @param {Array} requests - 요청 배열
   * @param {object} options - 옵션
   */
  async batch(requests, options = {}) {
    const batchOptions = {
      concurrent: 3,
      failFast: false,
      ...options
    };

    const results = [];
    const errors = [];

    // 동시 실행 수 제한
    for (let i = 0; i < requests.length; i += batchOptions.concurrent) {
      const batch = requests.slice(i, i + batchOptions.concurrent);
      
      const batchPromises = batch.map(async (req, index) => {
        try {
          const result = await this.request(req.method, req.url, req.data, req.options);
          return { index: i + index, success: true, data: result };
        } catch (error) {
          const errorResult = { index: i + index, success: false, error };
          if (batchOptions.failFast) {
            throw error;
          }
          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results[result.index] = result.data;
        } else {
          errors[result.index] = result.error;
        }
      });
    }

    return { results, errors };
  }

  // 유틸리티 메소드들

  buildQueryString(params) {
    return Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  generateRequestId(method, url, data) {
    const key = `${method}:${url}:${JSON.stringify(data)}`;
    return btoa(key).replace(/[/+=]/g, '');
  }

  getCachedResponse(requestId) {
    const cached = this.requestCache.get(requestId);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.requestCache.delete(requestId);
    return null;
  }

  setCachedResponse(requestId, data, ttl) {
    this.requestCache.set(requestId, {
      data: data,
      timestamp: Date.now(),
      ttl: ttl
    });
  }

  clearCache() {
    this.requestCache.clear();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 요청 통계
   */
  getStats() {
    return {
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      interceptors: {
        request: this.requestInterceptors.length,
        response: this.responseInterceptors.length,
        error: this.errorInterceptors.length
      }
    };
  }
}

/**
 * API 에러 클래스
 */
class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.data = null;
  }
}

// 기본 인터셉터들 설정
document.addEventListener('DOMContentLoaded', function() {
  const apiInstance = new ApiSystem();

  // 401 에러 시 로그인 페이지로 리다이렉트
  apiInstance.addErrorInterceptor(async (error) => {
    if (error instanceof ApiError && error.status === 401) {
      if (window.Alert) {
        const shouldRedirect = await window.Alert.confirm(
          '인증 만료', 
          '로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?'
        );
        if (shouldRedirect) {
          window.location.href = '/';
        }
      } else {
        window.location.href = '/';
      }
    }
  });

  // CSRF 토큰 갱신
  apiInstance.addResponseInterceptor(async ({ response }) => {
    const newToken = response.headers.get('X-CSRF-TOKEN');
    if (newToken) {
      apiInstance.defaultHeaders['X-CSRF-TOKEN'] = newToken;
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        metaTag.setAttribute('content', newToken);
      }
    }
  });
});

// 즉시 생성 (이미 DOMContentLoaded가 발생한 경우)
if (document.readyState === 'loading') {
  // 아직 로딩 중이면 이벤트 리스너 등록
} else {
  // 이미 로드 완료된 경우 즉시 실행
  new ApiSystem();
}} // ApiSystem 정의 체크 종료
