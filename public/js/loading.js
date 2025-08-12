/**
 * Global Loading System
 * Beautiful loading indicators for various UI states
 */

if (typeof LoadingSystem !== 'undefined') {
  console.log('loading.js 이미 로드됨, 스킵');
} else {

class LoadingSystem {
  constructor() {
    this.loadings = new Map();
    this.loadingCounter = 0;
    this.globalLoading = null;
    this.defaultOptions = {
      type: 'spinner',
      message: '처리 중...',
      size: 'md',
      backdrop: true,
      transparent: false,
      theme: 'light',
      showProgress: false,
      showCancel: false,
      position: 'center',
    };
    
    this.init();
  }

  init() {
    // CSS 스타일 추가
    this.injectStyles();
    
    // 전역 객체에 등록
    window.Loading = this;
    
    // HBS 인터랙티브 시스템과 연동
    if (window.HBS) {
      window.HBS.loading = this;
    }

    // Turbo 이벤트와 연동
    this.setupTurboIntegration();
  }

  /**
   * 전역 로딩 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  show(message = '처리 중...', options = {}) {
    // 기존 전역 로딩이 있으면 업데이트
    if (this.globalLoading) {
      this.updateGlobalLoading(message, options);
      return this.globalLoading;
    }

    const loadingOptions = { ...this.defaultOptions, ...options, message };
    const loadingId = `loading-global`;
    
    // 로딩 엘리먼트 생성
    const loadingElement = this.createLoadingElement(loadingId, loadingOptions, true);
    
    // 전역 로딩 객체
    this.globalLoading = {
      id: loadingId,
      element: loadingElement,
      options: loadingOptions,
      startTime: Date.now(),
      progress: 0,
    };

    document.body.appendChild(loadingElement);
    
    // 애니메이션 시작
    requestAnimationFrame(() => {
      loadingElement.classList.add('loading-show');
    });

    // body 스크롤 방지 (backdrop이 있는 경우)
    if (loadingOptions.backdrop) {
      document.body.classList.add('loading-active');
    }

    return {
      id: loadingId,
      hide: () => this.hide(),
      update: (newMessage, newOptions) => this.updateGlobalLoading(newMessage, newOptions),
      setProgress: (percent) => this.setProgress(percent),
    };
  }

  /**
   * 전역 로딩 숨김
   */
  hide() {
    if (!this.globalLoading) return false;

    const loading = this.globalLoading;

    // 애니메이션 시작
    loading.element.classList.remove('loading-show');
    loading.element.classList.add('loading-hide');

    // DOM에서 제거
    setTimeout(() => {
      if (loading.element.parentNode) {
        loading.element.parentNode.removeChild(loading.element);
      }
      this.globalLoading = null;

      // body 스크롤 복원
      document.body.classList.remove('loading-active');
    }, 300);

    return true;
  }

  /**
   * 인라인 로딩 표시 (특정 요소에)
   * @param {string|Element} target - 대상 요소 선택자 또는 요소
   * @param {object} options - 옵션
   */
  showInline(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return null;

    const loadingId = `loading-${++this.loadingCounter}`;
    const loadingOptions = { ...this.defaultOptions, ...options, backdrop: false, position: 'inline' };
    
    // 로딩 엘리먼트 생성
    const loadingElement = this.createLoadingElement(loadingId, loadingOptions, false);
    
    // 원본 내용 백업
    const originalContent = element.innerHTML;
    const originalStyle = {
      position: element.style.position,
      minHeight: element.style.minHeight,
    };

    // 상대 위치 설정
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    // 최소 높이 설정 (레이아웃 유지)
    if (!element.style.minHeight) {
      element.style.minHeight = '60px';
    }

    // 로딩 객체 생성
    const loading = {
      id: loadingId,
      element: loadingElement,
      target: element,
      originalContent,
      originalStyle,
      options: loadingOptions,
      startTime: Date.now(),
      isInline: true,
    };

    this.loadings.set(loadingId, loading);
    
    // 로딩 표시
    element.appendChild(loadingElement);
    
    requestAnimationFrame(() => {
      loadingElement.classList.add('loading-show');
    });

    return {
      id: loadingId,
      hide: () => this.hideInline(loadingId),
      update: (newMessage, newOptions) => this.updateInlineLoading(loadingId, newMessage, newOptions),
    };
  }

  /**
   * 인라인 로딩 숨김
   * @param {string} loadingId - 로딩 ID
   */
  hideInline(loadingId) {
    const loading = this.loadings.get(loadingId);
    if (!loading || !loading.isInline) return false;

    // 애니메이션 시작
    loading.element.classList.remove('loading-show');
    loading.element.classList.add('loading-hide');

    // DOM에서 제거 및 원복
    setTimeout(() => {
      if (loading.element.parentNode) {
        loading.element.parentNode.removeChild(loading.element);
      }

      // 원본 스타일 복원
      Object.assign(loading.target.style, loading.originalStyle);

      this.loadings.delete(loadingId);
    }, 300);

    return true;
  }

  /**
   * 버튼 로딩 표시
   * @param {string|Element} button - 버튼 요소 선택자 또는 요소
   * @param {object} options - 옵션
   */
  showButton(button, options = {}) {
    const element = typeof button === 'string' ? document.querySelector(button) : button;
    if (!element) return null;

    const loadingId = `button-loading-${++this.loadingCounter}`;
    const originalContent = element.innerHTML;
    const originalDisabled = element.disabled;

    // 버튼 비활성화
    element.disabled = true;

    // 로딩 아이콘과 텍스트
    const message = options.message || '처리 중...';
    const iconClass = options.icon || 'fas fa-spinner fa-spin';
    
    element.innerHTML = `
      <i class="${iconClass} mr-2"></i>
      ${message}
    `;

    // 로딩 객체 생성
    const loading = {
      id: loadingId,
      element,
      originalContent,
      originalDisabled,
      options,
      isButton: true,
    };

    this.loadings.set(loadingId, loading);

    return {
      id: loadingId,
      hide: () => this.hideButton(loadingId),
    };
  }

  /**
   * 버튼 로딩 숨김
   * @param {string} loadingId - 로딩 ID
   */
  hideButton(loadingId) {
    const loading = this.loadings.get(loadingId);
    if (!loading || !loading.isButton) return false;

    // 원본 내용 복원
    loading.element.innerHTML = loading.originalContent;
    loading.element.disabled = loading.originalDisabled;

    this.loadings.delete(loadingId);
    return true;
  }

  /**
   * 스켈레톤 로딩 표시
   * @param {string|Element} target - 대상 요소 선택자 또는 요소
   * @param {object} options - 스켈레톤 옵션
   */
  showSkeleton(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return null;

    const skeletonOptions = {
      lines: 3,
      height: 16,
      spacing: 12,
      animation: 'pulse',
      ...options
    };

    const skeletonHtml = this.generateSkeletonHtml(skeletonOptions);
    
    return this.showInline(element, {
      type: 'skeleton',
      message: skeletonHtml,
      backdrop: false,
      ...options
    });
  }

  generateSkeletonHtml(options) {
    const lines = [];
    for (let i = 0; i < options.lines; i++) {
      const width = i === options.lines - 1 ? '60%' : '100%';
      lines.push(`
        <div class="skeleton-line" style="height: ${options.height}px; width: ${width}; margin-bottom: ${options.spacing}px;"></div>
      `);
    }
    return lines.join('');
  }

  createLoadingElement(loadingId, options, isGlobal) {
    const loading = document.createElement('div');
    loading.id = loadingId;
    loading.className = `loading-overlay loading-${options.type} loading-${options.size} loading-${options.theme} ${isGlobal ? 'loading-global' : 'loading-inline'}`;

    if (options.transparent) {
      loading.classList.add('loading-transparent');
    }

    // HTML 구조 생성
    if (options.type === 'skeleton') {
      loading.innerHTML = `
        <div class="skeleton-container">
          ${options.message}
        </div>
      `;
    } else {
      loading.innerHTML = `
        ${isGlobal && options.backdrop ? '<div class="loading-backdrop"></div>' : ''}
        <div class="loading-content">
          <div class="loading-spinner">
            ${this.getSpinnerHtml(options.type)}
          </div>
          ${options.message ? `<div class="loading-message">${options.message}</div>` : ''}
          ${options.showProgress ? `
            <div class="loading-progress">
              <div class="loading-progress-bar" style="width: 0%"></div>
            </div>
          ` : ''}
          ${options.showCancel ? `
            <button class="loading-cancel-btn">
              <i class="fas fa-times mr-2"></i>취소
            </button>
          ` : ''}
        </div>
      `;
    }

    // 취소 버튼 이벤트
    if (options.showCancel) {
      const cancelBtn = loading.querySelector('.loading-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          if (isGlobal) {
            this.hide();
          } else {
            this.hideInline(loadingId);
          }
          
          if (options.onCancel) {
            options.onCancel();
          }
        });
      }
    }

    return loading;
  }

  getSpinnerHtml(type) {
    const spinners = {
      spinner: '<div class="spinner-circle"><div></div><div></div><div></div><div></div></div>',
      dots: '<div class="spinner-dots"><div></div><div></div><div></div></div>',
      pulse: '<div class="spinner-pulse"></div>',
      bars: '<div class="spinner-bars"><div></div><div></div><div></div><div></div><div></div></div>',
      ring: '<div class="spinner-ring"><div></div><div></div><div></div><div></div></div>',
    };

    return spinners[type] || spinners.spinner;
  }

  updateGlobalLoading(message, options = {}) {
    if (!this.globalLoading) return false;

    if (message) {
      const messageElement = this.globalLoading.element.querySelector('.loading-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
    }

    // 옵션 업데이트
    this.globalLoading.options = { ...this.globalLoading.options, ...options };

    return true;
  }

  setProgress(percent) {
    if (!this.globalLoading) return false;

    const progressBar = this.globalLoading.element.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      this.globalLoading.progress = percent;
    }

    return true;
  }

  setupTurboIntegration() {
    // Turbo 로딩 비활성화 - 계속 로딩되는 문제를 방지
    // main.hbs의 Turbo 설정에서 이미 로딩을 관리하고 있으므로 여기서는 비활성화
    console.log('🔄 Loading.js Turbo integration disabled to prevent infinite loading');
    
    // 필요한 경우에만 수동으로 로딩 표시
    // window.Loading.show(), window.Loading.hide() 사용
    
    // Turbo frame 로딩만 처리 (data-loading 속성이 있는 경우만)
    document.addEventListener('turbo:before-frame-render', (event) => {
      const frame = event.target;
      if (frame.hasAttribute('data-loading')) {
        this.showInline(frame, {
          type: 'spinner',
          message: '콘텐츠 로딩 중...',
          size: 'sm'
        });
      }
    });

    document.addEventListener('turbo:frame-load', (event) => {
      const frame = event.target;
      const loadingElement = frame.querySelector('.loading-overlay');
      if (loadingElement) {
        const loadingId = loadingElement.id;
        this.hideInline(loadingId);
      }
    });
    
    // 모든 로딩 상태 강제 정리 함수 추가
    window.clearAllLoadings = () => {
      console.log('🧹 Clearing all loading states');
      this.hideAll();
      // 타임아웃도 정리
      if (this.turboLoadingTimeout) {
        clearTimeout(this.turboLoadingTimeout);
        this.turboLoadingTimeout = null;
      }
    };
  }

  /**
   * 모든 로딩 숨김
   */
  hideAll() {
    // 전역 로딩 숨김
    this.hide();

    // 모든 인라인 로딩 숨김
    for (const [loadingId, loading] of this.loadings) {
      if (loading.isInline) {
        this.hideInline(loadingId);
      } else if (loading.isButton) {
        this.hideButton(loadingId);
      }
    }
  }

  injectStyles() {
    if (document.getElementById('loading-styles')) return;

    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.textContent = `
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: inherit;
      }

      .loading-global {
        position: fixed;
        z-index: 9998;
        border-radius: 0;
      }

      .loading-overlay.loading-show {
        opacity: 1;
      }

      .loading-overlay.loading-hide {
        opacity: 0;
      }

      .loading-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
      }

      .loading-transparent {
        background: rgba(255, 255, 255, 0.7) !important;
      }

      .loading-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 24px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        min-width: 200px;
        text-align: center;
      }

      .loading-inline .loading-content {
        background: transparent;
        box-shadow: none;
        padding: 16px;
      }

      .loading-message {
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        line-height: 1.5;
      }

      .loading-progress {
        width: 200px;
        height: 4px;
        background: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
      }

      .loading-progress-bar {
        height: 100%;
        background: #3b82f6;
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .loading-cancel-btn {
        padding: 8px 16px;
        background: #f3f4f6;
        border: none;
        border-radius: 6px;
        color: #6b7280;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .loading-cancel-btn:hover {
        background: #e5e7eb;
        color: #374151;
      }

      /* 스피너 스타일 */
      .spinner-circle {
        width: 40px;
        height: 40px;
        position: relative;
      }

      .spinner-circle div {
        position: absolute;
        top: 33px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #3b82f6;
        animation-timing-function: cubic-bezier(0, 1, 1, 0);
      }

      .spinner-circle div:nth-child(1) {
        left: 8px;
        animation: spinner-circle1 0.6s infinite;
      }

      .spinner-circle div:nth-child(2) {
        left: 8px;
        animation: spinner-circle2 0.6s infinite;
      }

      .spinner-circle div:nth-child(3) {
        left: 32px;
        animation: spinner-circle2 0.6s infinite;
      }

      .spinner-circle div:nth-child(4) {
        left: 56px;
        animation: spinner-circle3 0.6s infinite;
      }

      @keyframes spinner-circle1 {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
      }

      @keyframes spinner-circle2 {
        0% { transform: translate(0, 0); }
        100% { transform: translate(24px, 0); }
      }

      @keyframes spinner-circle3 {
        0% { transform: scale(1); }
        100% { transform: scale(0); }
      }

      .spinner-dots {
        display: flex;
        gap: 4px;
      }

      .spinner-dots div {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #3b82f6;
        animation: spinner-dots 1.4s infinite ease-in-out both;
      }

      .spinner-dots div:nth-child(1) { animation-delay: -0.32s; }
      .spinner-dots div:nth-child(2) { animation-delay: -0.16s; }

      @keyframes spinner-dots {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .spinner-pulse {
        width: 40px;
        height: 40px;
        background: #3b82f6;
        border-radius: 50%;
        animation: spinner-pulse 1.5s ease-in-out infinite;
      }

      @keyframes spinner-pulse {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }

      .spinner-bars {
        display: flex;
        gap: 3px;
      }

      .spinner-bars div {
        width: 4px;
        height: 20px;
        background: #3b82f6;
        animation: spinner-bars 1.2s infinite ease-in-out;
      }

      .spinner-bars div:nth-child(1) { animation-delay: -1.2s; }
      .spinner-bars div:nth-child(2) { animation-delay: -1.1s; }
      .spinner-bars div:nth-child(3) { animation-delay: -1.0s; }
      .spinner-bars div:nth-child(4) { animation-delay: -0.9s; }
      .spinner-bars div:nth-child(5) { animation-delay: -0.8s; }

      @keyframes spinner-bars {
        0%, 40%, 100% {
          transform: scaleY(0.4);
        }
        20% {
          transform: scaleY(1);
        }
      }

      .spinner-ring {
        width: 40px;
        height: 40px;
      }

      .spinner-ring div {
        position: absolute;
        width: 32px;
        height: 32px;
        margin: 4px;
        border: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: #3b82f6 transparent transparent transparent;
      }

      .spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
      .spinner-ring div:nth-child(2) { animation-delay: -0.3s; }
      .spinner-ring div:nth-child(3) { animation-delay: -0.15s; }

      @keyframes spinner-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* 스켈레톤 스타일 */
      .skeleton-container {
        width: 100%;
        padding: 16px;
      }

      .skeleton-line {
        background: #e2e8f0;
        border-radius: 4px;
        animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes skeleton-pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }

      /* 크기 변형 */
      .loading-sm .spinner-circle {
        width: 32px;
        height: 32px;
      }

      .loading-sm .spinner-pulse {
        width: 32px;
        height: 32px;
      }

      .loading-lg .spinner-circle {
        width: 48px;
        height: 48px;
      }

      .loading-lg .spinner-pulse {
        width: 48px;
        height: 48px;
      }

      /* Dark 테마 */
      .loading-dark {
        background: rgba(31, 41, 55, 0.9) !important;
      }

      .loading-dark .loading-content {
        background: #1f2937;
        color: #f3f4f6;
      }

      .loading-dark .loading-message {
        color: #d1d5db;
      }

      /* Body 스타일 */
      body.loading-active {
        overflow: hidden;
      }

      /* 반응형 */
      @media (max-width: 640px) {
        .loading-content {
          min-width: 160px;
          padding: 20px;
        }

        .loading-progress {
          width: 160px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  new LoadingSystem();
});

// 즉시 생성 (이미 DOMContentLoaded가 발생한 경우)
if (document.readyState === 'loading') {
  // 아직 로딩 중이면 이벤트 리스너 등록
} else {
  // 이미 로드 완료된 경우 즉시 실행
  new LoadingSystem();
}} // LoadingSystem 정의 체크 종료
