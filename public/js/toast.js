/**
 * Toast Notification System
 * React-style toast notifications for HBS applications
 */

// 이미 ToastSystem이 정의되어 있으면 종료
if (typeof ToastSystem !== 'undefined') {
  console.log('ToastSystem이 이미 정의되어 있습니다. 재로드를 건너뜁니다.');
} else {

class ToastSystem {
  constructor() {
    this.toasts = new Map();
    this.toastCounter = 0;
    this.defaultOptions = {
      duration: 4000,
      position: 'top-right',
      closable: true,
      showProgress: true,
      pauseOnHover: true,
      theme: 'light',
    };
    
    this.init();
  }

  init() {
    // 토스트 컨테이너 생성
    this.createContainer();
    
    // CSS 스타일 추가
    this.injectStyles();
    
    // 전역 객체에 등록
    window.Toast = this;
    
    // HBS 인터랙티브 시스템과 연동
    if (window.HBS) {
      window.HBS.toast = this;
    }
  }

  createContainer() {
    // 기존 컨테이너 제거
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    // 새 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('data-position', this.defaultOptions.position);
    
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * 성공 토스트 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * 에러 토스트 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  error(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: 6000 });
  }

  /**
   * 경고 토스트 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * 정보 토스트 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * 로딩 토스트 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  loading(message, options = {}) {
    return this.show(message, 'loading', { 
      ...options, 
      duration: 0, // 무한
      closable: false,
      showProgress: false 
    });
  }

  /**
   * 커스텀 토스트 표시
   * @param {string} message - 메시지
   * @param {string} type - 타입 (success, error, warning, info, loading)
   * @param {object} options - 옵션
   */
  show(message, type = 'info', options = {}) {
    const toastOptions = { ...this.defaultOptions, ...options };
    const toastId = `toast-${++this.toastCounter}`;
    
    // 토스트 엘리먼트 생성
    const toastElement = this.createToastElement(toastId, message, type, toastOptions);
    
    // 토스트 객체 생성
    const toast = {
      id: toastId,
      element: toastElement,
      type,
      message,
      options: toastOptions,
      startTime: Date.now(),
      timeoutId: null,
      progressInterval: null,
    };

    // 토스트 추가
    this.toasts.set(toastId, toast);
    this.container.appendChild(toastElement);

    // 애니메이션 시작
    requestAnimationFrame(() => {
      toastElement.classList.add('toast-enter');
    });

    // 자동 제거 설정
    if (toastOptions.duration > 0) {
      this.startAutoRemove(toast);
    }

    // 프로그레스 바 시작
    if (toastOptions.showProgress && toastOptions.duration > 0) {
      this.startProgress(toast);
    }

    // 호버 이벤트 (pauseOnHover)
    if (toastOptions.pauseOnHover) {
      this.setupPauseOnHover(toast);
    }

    return {
      id: toastId,
      update: (newMessage, newType) => this.updateToast(toastId, newMessage, newType),
      remove: () => this.removeToast(toastId),
    };
  }

  createToastElement(toastId, message, type, options) {
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type} toast-${options.theme}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // 아이콘 결정
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-times-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      loading: 'fas fa-spinner fa-spin',
    };

    // HTML 구조 생성
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">
          <i class="${icons[type] || icons.info}"></i>
        </div>
        <div class="toast-message">
          ${message}
        </div>
        ${options.closable ? `
          <button class="toast-close" aria-label="닫기">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      </div>
      ${options.showProgress && options.duration > 0 ? `
        <div class="toast-progress">
          <div class="toast-progress-bar"></div>
        </div>
      ` : ''}
    `;

    // 닫기 버튼 이벤트
    if (options.closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.removeToast(toastId));
    }

    // 클릭 시 닫기 (옵션)
    if (options.clickToClose) {
      toast.addEventListener('click', () => this.removeToast(toastId));
      toast.style.cursor = 'pointer';
    }

    return toast;
  }

  startAutoRemove(toast) {
    toast.timeoutId = setTimeout(() => {
      this.removeToast(toast.id);
    }, toast.options.duration);
  }

  startProgress(toast) {
    const progressBar = toast.element.querySelector('.toast-progress-bar');
    if (!progressBar) return;

    let progress = 100;
    const interval = 50;
    const decrement = 100 / (toast.options.duration / interval);

    toast.progressInterval = setInterval(() => {
      progress -= decrement;
      if (progress <= 0) {
        progress = 0;
        clearInterval(toast.progressInterval);
      }
      progressBar.style.width = `${progress}%`;
    }, interval);
  }

  setupPauseOnHover(toast) {
    const element = toast.element;
    
    element.addEventListener('mouseenter', () => {
      // 자동 제거 일시정지
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      
      // 프로그레스 일시정지
      if (toast.progressInterval) {
        clearInterval(toast.progressInterval);
      }
      
      // 호버 상태 표시
      element.classList.add('toast-paused');
    });

    element.addEventListener('mouseleave', () => {
      // 남은 시간 계산
      const elapsed = Date.now() - toast.startTime;
      const remaining = Math.max(0, toast.options.duration - elapsed);
      
      if (remaining > 0) {
        // 자동 제거 재시작
        toast.timeoutId = setTimeout(() => {
          this.removeToast(toast.id);
        }, remaining);

        // 프로그레스 재시작
        if (toast.options.showProgress) {
          const progressBar = element.querySelector('.toast-progress-bar');
          if (progressBar) {
            const currentProgress = (remaining / toast.options.duration) * 100;
            const interval = 50;
            const decrement = 100 / (remaining / interval);
            let progress = currentProgress;

            toast.progressInterval = setInterval(() => {
              progress -= decrement;
              if (progress <= 0) {
                progress = 0;
                clearInterval(toast.progressInterval);
              }
              progressBar.style.width = `${progress}%`;
            }, interval);
          }
        }
      }
      
      // 호버 상태 해제
      element.classList.remove('toast-paused');
    });
  }

  updateToast(toastId, newMessage, newType) {
    const toast = this.toasts.get(toastId);
    if (!toast) return false;

    const messageElement = toast.element.querySelector('.toast-message');
    const iconElement = toast.element.querySelector('.toast-icon i');
    
    // 메시지 업데이트
    if (newMessage) {
      messageElement.textContent = newMessage;
      toast.message = newMessage;
    }

    // 타입 업데이트
    if (newType && newType !== toast.type) {
      // 기존 타입 클래스 제거
      toast.element.classList.remove(`toast-${toast.type}`);
      toast.element.classList.add(`toast-${newType}`);
      
      // 아이콘 업데이트
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        loading: 'fas fa-spinner fa-spin',
      };
      
      iconElement.className = icons[newType] || icons.info;
      toast.type = newType;
    }

    return true;
  }

  removeToast(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return false;

    // 타이머 정리
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    if (toast.progressInterval) clearInterval(toast.progressInterval);

    // 애니메이션 시작
    toast.element.classList.add('toast-exit');

    // DOM에서 제거
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      this.toasts.delete(toastId);
    }, 300);

    return true;
  }

  /**
   * 모든 토스트 제거
   * @param {string} type - 특정 타입만 제거 (옵션)
   */
  removeAll(type = null) {
    for (const [toastId, toast] of this.toasts) {
      if (!type || toast.type === type) {
        this.removeToast(toastId);
      }
    }
  }

  /**
   * 위치 변경
   * @param {string} position - top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
   */
  setPosition(position) {
    this.defaultOptions.position = position;
    this.container.setAttribute('data-position', position);
  }

  /**
   * 테마 변경
   * @param {string} theme - light, dark
   */
  setTheme(theme) {
    this.defaultOptions.theme = theme;
  }

  injectStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 400px;
        padding: 16px;
      }

      .toast-container[data-position="top-right"] {
        top: 0;
        right: 0;
      }

      .toast-container[data-position="top-left"] {
        top: 0;
        left: 0;
      }

      .toast-container[data-position="bottom-right"] {
        bottom: 0;
        right: 0;
        flex-direction: column-reverse;
      }

      .toast-container[data-position="bottom-left"] {
        bottom: 0;
        left: 0;
        flex-direction: column-reverse;
      }

      .toast-container[data-position="top-center"] {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .toast-container[data-position="bottom-center"] {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        flex-direction: column-reverse;
      }

      .toast {
        pointer-events: auto;
        min-width: 300px;
        max-width: 400px;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        backdrop-filter: blur(10px);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .toast.toast-enter {
        opacity: 1;
        transform: translateX(0);
      }

      .toast.toast-exit {
        opacity: 0;
        transform: translateX(100%);
      }

      .toast-content {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        gap: 12px;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 2px;
      }

      .toast-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
      }

      .toast-close {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.5;
        transition: all 0.2s;
        font-size: 12px;
        margin-top: -2px;
      }

      .toast-close:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }

      .toast-progress {
        height: 4px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 0 0 12px 12px;
        overflow: hidden;
      }

      .toast-progress-bar {
        height: 100%;
        width: 100%;
        transition: width 0.05s linear;
        border-radius: inherit;
      }

      /* Light Theme */
      .toast.toast-light {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #374151;
      }

      .toast.toast-light.toast-success {
        border-left: 4px solid #10b981;
      }
      .toast.toast-light.toast-success .toast-icon { color: #10b981; }
      .toast.toast-light.toast-success .toast-progress-bar { background: #10b981; }

      .toast.toast-light.toast-error {
        border-left: 4px solid #ef4444;
      }
      .toast.toast-light.toast-error .toast-icon { color: #ef4444; }
      .toast.toast-light.toast-error .toast-progress-bar { background: #ef4444; }

      .toast.toast-light.toast-warning {
        border-left: 4px solid #f59e0b;
      }
      .toast.toast-light.toast-warning .toast-icon { color: #f59e0b; }
      .toast.toast-light.toast-warning .toast-progress-bar { background: #f59e0b; }

      .toast.toast-light.toast-info {
        border-left: 4px solid #3b82f6;
      }
      .toast.toast-light.toast-info .toast-icon { color: #3b82f6; }
      .toast.toast-light.toast-info .toast-progress-bar { background: #3b82f6; }

      .toast.toast-light.toast-loading {
        border-left: 4px solid #6366f1;
      }
      .toast.toast-light.toast-loading .toast-icon { color: #6366f1; }
      .toast.toast-light.toast-loading .toast-progress-bar { background: #6366f1; }

      /* Dark Theme */
      .toast.toast-dark {
        background: rgba(31, 41, 55, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #f3f4f6;
      }

      .toast.toast-dark.toast-success {
        border-left: 4px solid #10b981;
      }
      .toast.toast-dark.toast-success .toast-icon { color: #34d399; }
      .toast.toast-dark.toast-success .toast-progress-bar { background: #34d399; }

      .toast.toast-dark.toast-error {
        border-left: 4px solid #ef4444;
      }
      .toast.toast-dark.toast-error .toast-icon { color: #f87171; }
      .toast.toast-dark.toast-error .toast-progress-bar { background: #f87171; }

      .toast.toast-dark.toast-warning {
        border-left: 4px solid #f59e0b;
      }
      .toast.toast-dark.toast-warning .toast-icon { color: #fbbf24; }
      .toast.toast-dark.toast-warning .toast-progress-bar { background: #fbbf24; }

      .toast.toast-dark.toast-info {
        border-left: 4px solid #3b82f6;
      }
      .toast.toast-dark.toast-info .toast-icon { color: #60a5fa; }
      .toast.toast-dark.toast-info .toast-progress-bar { background: #60a5fa; }

      .toast.toast-dark.toast-loading {
        border-left: 4px solid #6366f1;
      }
      .toast.toast-dark.toast-loading .toast-icon { color: #818cf8; }
      .toast.toast-dark.toast-loading .toast-progress-bar { background: #818cf8; }

      .toast.toast-paused {
        transform: scale(1.02);
      }

      /* 반응형 */
      @media (max-width: 640px) {
        .toast-container {
          left: 0 !important;
          right: 0 !important;
          transform: none !important;
          max-width: none;
          padding: 8px;
        }

        .toast {
          min-width: auto;
          max-width: none;
          margin: 0 8px;
        }

        .toast-container[data-position*="top"] .toast {
          transform: translateY(-100%);
        }

        .toast-container[data-position*="bottom"] .toast {
          transform: translateY(100%);
        }

        .toast-container[data-position*="top"] .toast.toast-enter,
        .toast-container[data-position*="bottom"] .toast.toast-enter {
          transform: translateY(0);
        }

        .toast-container[data-position*="top"] .toast.toast-exit {
          transform: translateY(-100%);
        }

        .toast-container[data-position*="bottom"] .toast.toast-exit {
          transform: translateY(100%);
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  new ToastSystem();
});

// 즉시 생성 (이미 DOMContentLoaded가 발생한 경우)
if (document.readyState === 'loading') {
  // 아직 로딩 중이면 이벤트 리스너 등록
} else {
  // 이미 로드 완료된 경우 즉시 실행
  new ToastSystem();
}

} // ToastSystem 정의 체크 if문 종료