/**
 * Debounce and Throttle Utilities
 * Performance optimization utilities for user actions
 */

if (typeof DebounceSystem !== 'undefined') {
  console.log('debounce.js 이미 로드됨, 스킵');
} else {

class DebounceSystem {
  constructor() {
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.rateLimiters = new Map();
    this.actionHistory = new Map();
    
    this.init();
  }

  init() {
    // 전역 객체에 등록
    window.Debounce = this;
    
    // HBS 인터랙티브 시스템과 연동
    if (window.HBS) {
      window.HBS.debounce = this;
    }

    // 자동 디바운스 속성 처리
    this.setupAutoDebounce();
  }

  /**
   * 디바운스 함수
   * @param {function} func - 실행할 함수
   * @param {number} delay - 지연 시간 (밀리초)
   * @param {object} options - 옵션
   */
  debounce(func, delay = 300, options = {}) {
    const key = options.key || func.name || 'anonymous';
    const immediate = options.immediate || false;
    const maxWait = options.maxWait || null;
    
    return (...args) => {
      const callNow = immediate && !this.debounceTimers.has(key);
      
      // 기존 타이머 클리어
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key).timer);
      }

      // 최대 대기 시간 체크
      const now = Date.now();
      const lastCall = this.debounceTimers.get(key)?.lastCall || 0;
      const shouldCallImmediately = maxWait && (now - lastCall) >= maxWait;

      if (shouldCallImmediately) {
        func.apply(this, args);
        this.debounceTimers.set(key, { lastCall: now });
        return;
      }

      // 새 타이머 설정
      const timer = setTimeout(() => {
        this.debounceTimers.delete(key);
        if (!immediate) {
          func.apply(this, args);
        }
      }, delay);

      this.debounceTimers.set(key, { 
        timer, 
        lastCall: callNow ? now : lastCall 
      });

      // immediate 모드에서 즉시 실행
      if (callNow) {
        func.apply(this, args);
      }
    };
  }

  /**
   * 스로틀 함수
   * @param {function} func - 실행할 함수
   * @param {number} delay - 간격 (밀리초)
   * @param {object} options - 옵션
   */
  throttle(func, delay = 100, options = {}) {
    const key = options.key || func.name || 'anonymous';
    const leading = options.leading !== false;
    const trailing = options.trailing !== false;

    return (...args) => {
      const now = Date.now();
      const throttleData = this.throttleTimers.get(key) || { 
        lastCall: 0, 
        timer: null,
        pending: false
      };

      const timeSinceLastCall = now - throttleData.lastCall;

      if (timeSinceLastCall >= delay) {
        // Leading edge
        if (leading) {
          func.apply(this, args);
          this.throttleTimers.set(key, { 
            ...throttleData, 
            lastCall: now, 
            pending: false 
          });
        } else {
          this.throttleTimers.set(key, { 
            ...throttleData, 
            lastCall: now 
          });
        }
      } else if (trailing && !throttleData.pending) {
        // Trailing edge
        throttleData.pending = true;
        throttleData.timer = setTimeout(() => {
          func.apply(this, args);
          this.throttleTimers.set(key, { 
            lastCall: Date.now(), 
            timer: null, 
            pending: false 
          });
        }, delay - timeSinceLastCall);

        this.throttleTimers.set(key, throttleData);
      }
    };
  }

  /**
   * 레이트 리미터
   * @param {function} func - 실행할 함수
   * @param {number} maxCalls - 최대 호출 횟수
   * @param {number} windowMs - 시간 윈도우 (밀리초)
   * @param {object} options - 옵션
   */
  rateLimit(func, maxCalls = 10, windowMs = 60000, options = {}) {
    const key = options.key || func.name || 'anonymous';
    const onExceeded = options.onExceeded || (() => {
      console.warn(`Rate limit exceeded for ${key}`);
    });

    return (...args) => {
      const now = Date.now();
      const limiterData = this.rateLimiters.get(key) || { calls: [], blocked: false };

      // 윈도우 밖의 호출 기록 제거
      limiterData.calls = limiterData.calls.filter(callTime => now - callTime < windowMs);

      if (limiterData.calls.length >= maxCalls) {
        if (!limiterData.blocked) {
          limiterData.blocked = true;
          onExceeded();
          
          // 블록 해제 타이머
          setTimeout(() => {
            limiterData.blocked = false;
            this.rateLimiters.set(key, limiterData);
          }, windowMs);
        }
        return false;
      }

      // 호출 기록 추가
      limiterData.calls.push(now);
      this.rateLimiters.set(key, limiterData);

      return func.apply(this, args);
    };
  }

  /**
   * 액션 디바운서 (입력 요소용)
   * @param {string|Element} element - 요소 선택자 또는 요소
   * @param {string} event - 이벤트 타입
   * @param {function} callback - 콜백 함수
   * @param {number} delay - 지연 시간
   * @param {object} options - 옵션
   */
  onAction(element, event, callback, delay = 300, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return null;

    const debouncedCallback = this.debounce(callback, delay, options);
    
    el.addEventListener(event, debouncedCallback);

    return {
      element: el,
      event,
      callback: debouncedCallback,
      remove: () => el.removeEventListener(event, debouncedCallback)
    };
  }

  /**
   * 검색 디바운서
   * @param {string|Element} input - 입력 요소
   * @param {function} searchFn - 검색 함수
   * @param {object} options - 옵션
   */
  onSearch(input, searchFn, options = {}) {
    const opts = {
      delay: 300,
      minLength: 2,
      showLoading: true,
      loadingText: '검색 중...',
      ...options
    };

    const inputEl = typeof input === 'string' ? document.querySelector(input) : input;
    if (!inputEl) return null;

    let loadingElement = null;

    const debouncedSearch = this.debounce(async (query) => {
      if (query.length < opts.minLength) {
        if (opts.onClear) opts.onClear();
        return;
      }

      // 로딩 표시
      if (opts.showLoading && window.Loading) {
        loadingElement = window.Loading.showInline(opts.resultsContainer || inputEl.parentNode, {
          message: opts.loadingText,
          size: 'sm'
        });
      }

      try {
        const results = await searchFn(query);
        if (opts.onResults) opts.onResults(results, query);
      } catch (error) {
        if (opts.onError) opts.onError(error, query);
      } finally {
        // 로딩 숨김
        if (loadingElement) {
          loadingElement.hide();
          loadingElement = null;
        }
      }
    }, opts.delay);

    inputEl.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      debouncedSearch(query);
    });

    return {
      element: inputEl,
      search: debouncedSearch,
      remove: () => inputEl.removeEventListener('input', debouncedSearch)
    };
  }

  /**
   * 폼 제출 디바운서 (중복 제출 방지)
   * @param {string|Element} form - 폼 요소
   * @param {function} submitFn - 제출 함수
   * @param {object} options - 옵션
   */
  onSubmit(form, submitFn, options = {}) {
    const opts = {
      delay: 1000,
      showLoading: true,
      loadingText: '처리 중...',
      disableForm: true,
      ...options
    };

    const formEl = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formEl) return null;

    const submitButton = formEl.querySelector('[type="submit"]');
    let isSubmitting = false;
    let buttonLoading = null;

    const debouncedSubmit = this.debounce(async (event) => {
      if (isSubmitting) return;
      isSubmitting = true;

      // 폼 비활성화
      if (opts.disableForm) {
        const inputs = formEl.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => input.disabled = true);
      }

      // 버튼 로딩 표시
      if (opts.showLoading && submitButton && window.Loading) {
        buttonLoading = window.Loading.showButton(submitButton, {
          message: opts.loadingText
        });
      }

      try {
        const result = await submitFn(event, formEl);
        if (opts.onSuccess) opts.onSuccess(result);
      } catch (error) {
        if (opts.onError) opts.onError(error);
      } finally {
        isSubmitting = false;

        // 폼 활성화
        if (opts.disableForm) {
          const inputs = formEl.querySelectorAll('input, select, textarea, button');
          inputs.forEach(input => input.disabled = false);
        }

        // 버튼 로딩 숨김
        if (buttonLoading) {
          buttonLoading.hide();
          buttonLoading = null;
        }
      }
    }, opts.delay);

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      debouncedSubmit(e);
    });

    return {
      element: formEl,
      submit: debouncedSubmit,
      remove: () => formEl.removeEventListener('submit', debouncedSubmit)
    };
  }

  /**
   * 스크롤 스로틀러
   * @param {function} callback - 콜백 함수
   * @param {object} options - 옵션
   */
  onScroll(callback, options = {}) {
    const opts = {
      delay: 16, // ~60fps
      element: window,
      ...options
    };

    const throttledScroll = this.throttle(callback, opts.delay);
    
    opts.element.addEventListener('scroll', throttledScroll, { passive: true });

    return {
      element: opts.element,
      callback: throttledScroll,
      remove: () => opts.element.removeEventListener('scroll', throttledScroll)
    };
  }

  /**
   * 리사이즈 스로틀러
   * @param {function} callback - 콜백 함수
   * @param {object} options - 옵션
   */
  onResize(callback, options = {}) {
    const opts = {
      delay: 100,
      element: window,
      ...options
    };

    const throttledResize = this.throttle(callback, opts.delay);
    
    opts.element.addEventListener('resize', throttledResize);

    return {
      element: opts.element,
      callback: throttledResize,
      remove: () => opts.element.removeEventListener('resize', throttledResize)
    };
  }

  /**
   * 자동 디바운스 속성 처리
   */
  setupAutoDebounce() {
    // data-debounce 속성이 있는 요소들에 자동 디바운스 적용
    document.addEventListener('input', (e) => {
      const element = e.target;
      const debounceDelay = element.getAttribute('data-debounce');
      
      if (debounceDelay) {
        const delay = parseInt(debounceDelay) || 300;
        const action = element.getAttribute('data-debounce-action');
        
        if (!element._debouncedHandler) {
          element._debouncedHandler = this.debounce((event) => {
            if (action && window[action]) {
              window[action](event);
            } else if (element.hasAttribute('data-hbs-input')) {
              // HBS 인터랙티브 시스템과 연동
              if (window.HBS) {
                const stateKey = element.getAttribute('data-hbs-input');
                window.HBS.setState(stateKey, element.value);
              }
            }
          }, delay);
        }
        
        element._debouncedHandler(e);
      }
    });

    // data-throttle 속성이 있는 요소들에 자동 스로틀 적용
    document.addEventListener('scroll', (e) => {
      if (e.target && typeof e.target.hasAttribute === 'function' && e.target.hasAttribute('data-throttle')) {
        const delay = parseInt(e.target.getAttribute('data-throttle')) || 16;
        const action = e.target.getAttribute('data-throttle-action');
        
        if (!e.target._throttledHandler) {
          e.target._throttledHandler = this.throttle((event) => {
            if (action && window[action]) {
              window[action](event);
            }
          }, delay);
        }
        
        e.target._throttledHandler(e);
      }
    }, { passive: true });
  }

  /**
   * 액션 히스토리 추적
   * @param {string} action - 액션 이름
   * @param {any} data - 액션 데이터
   */
  trackAction(action, data = null) {
    const now = Date.now();
    
    if (!this.actionHistory.has(action)) {
      this.actionHistory.set(action, []);
    }

    const history = this.actionHistory.get(action);
    history.push({ timestamp: now, data });

    // 최근 100개만 유지
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  /**
   * 액션 빈도 확인
   * @param {string} action - 액션 이름
   * @param {number} windowMs - 시간 윈도우
   */
  getActionFrequency(action, windowMs = 60000) {
    const history = this.actionHistory.get(action) || [];
    const now = Date.now();
    
    return history.filter(record => now - record.timestamp <= windowMs).length;
  }

  /**
   * 모든 타이머 클리어
   */
  clearAll() {
    // 디바운스 타이머들 클리어
    for (const [key, data] of this.debounceTimers) {
      clearTimeout(data.timer);
    }
    this.debounceTimers.clear();

    // 스로틀 타이머들 클리어
    for (const [key, data] of this.throttleTimers) {
      if (data.timer) {
        clearTimeout(data.timer);
      }
    }
    this.throttleTimers.clear();

    // 레이트 리미터 데이터 클리어
    this.rateLimiters.clear();
  }

  /**
   * 성능 모니터링
   */
  getPerformanceStats() {
    return {
      activeDebounces: this.debounceTimers.size,
      activeThrottles: this.throttleTimers.size,
      activeLimiters: this.rateLimiters.size,
      actionHistory: Array.from(this.actionHistory.keys()).map(key => ({
        action: key,
        count: this.actionHistory.get(key).length,
        lastActivity: Math.max(...this.actionHistory.get(key).map(r => r.timestamp))
      }))
    };
  }
}

// 유틸리티 함수들을 전역으로 내보내기
window.debounce = function(func, delay, options) {
  return new DebounceSystem().debounce(func, delay, options);
};

window.throttle = function(func, delay, options) {
  return new DebounceSystem().throttle(func, delay, options);
};

// 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  new DebounceSystem();
});

// 즉시 생성 (이미 DOMContentLoaded가 발생한 경우)
if (document.readyState === 'loading') {
  // 아직 로딩 중이면 이벤트 리스너 등록
} else {
  // 이미 로드 완료된 경우 즉시 실행
  new DebounceSystem();
}} // DebounceSystem 정의 체크 종료
