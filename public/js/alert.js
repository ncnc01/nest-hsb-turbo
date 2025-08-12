/**
 * Custom Alert System
 * Beautiful, modern alert dialogs that replace native browser alerts
 */

if (typeof AlertSystem !== 'undefined') {
  console.log('alert.js 이미 로드됨, 스킵');
} else {

class AlertSystem {
  constructor() {
    this.alerts = new Map();
    this.alertCounter = 0;
    this.activeAlert = null;
    this.defaultOptions = {
      type: 'info',
      size: 'md',
      animation: 'bounce',
      showIcon: true,
      showClose: true,
      timeout: 0,
      backdrop: true,
      theme: 'light',
      position: 'center',
    };
    
    this.init();
  }

  init() {
    // 네이티브 alert 함수 백업
    this.originalAlert = window.alert;
    this.originalConfirm = window.confirm;
    this.originalPrompt = window.prompt;
    
    // CSS 스타일 추가
    this.injectStyles();
    
    // 전역 객체에 등록
    window.Alert = this;
    
    // HBS 인터랙티브 시스템과 연동
    if (window.HBS) {
      window.HBS.alert = this;
    }

    // ESC 키 이벤트 리스너
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeAlert) {
        this.close();
      }
    });
  }

  /**
   * 기본 알림 표시
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  show(message, options = {}) {
    return this.create('info', '알림', message, null, options);
  }

  /**
   * 성공 알림
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  success(message, options = {}) {
    return this.create('success', '성공', message, null, options);
  }

  /**
   * 에러 알림
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  error(message, options = {}) {
    return this.create('error', '오류', message, null, options);
  }

  /**
   * 경고 알림
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  warning(message, options = {}) {
    return this.create('warning', '경고', message, null, options);
  }

  /**
   * 확인 다이얼로그
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  confirm(message, options = {}) {
    return new Promise((resolve) => {
      this.create('question', '확인', message, (result) => {
        resolve(result);
      }, {
        ...options,
        buttons: [
          {
            text: '취소',
            class: 'btn-secondary',
            icon: 'fas fa-times',
            action: () => resolve(false)
          },
          {
            text: '확인',
            class: 'btn-primary',
            icon: 'fas fa-check',
            action: () => resolve(true)
          }
        ]
      });
    });
  }

  /**
   * 입력 다이얼로그
   * @param {string} message - 메시지
   * @param {string} defaultValue - 기본값
   * @param {object} options - 옵션
   */
  prompt(message, defaultValue = '', options = {}) {
    return new Promise((resolve) => {
      const inputId = `alert-input-${Date.now()}`;
      
      this.create('input', '입력', `
        <p class="text-gray-700 mb-4">${message}</p>
        <input 
          type="text" 
          id="${inputId}"
          class="form-input w-full" 
          value="${defaultValue}" 
          placeholder="입력하세요..."
        >
      `, null, {
        ...options,
        buttons: [
          {
            text: '취소',
            class: 'btn-secondary',
            icon: 'fas fa-times',
            action: () => resolve(null)
          },
          {
            text: '확인',
            class: 'btn-primary',
            icon: 'fas fa-check',
            action: () => {
              const input = document.getElementById(inputId);
              resolve(input ? input.value : null);
            }
          }
        ],
        onShow: () => {
          setTimeout(() => {
            const input = document.getElementById(inputId);
            if (input) {
              input.focus();
              input.select();
            }
          }, 100);
        }
      });
    });
  }

  /**
   * 커스텀 알림 생성
   * @param {string} type - 타입
   * @param {string} title - 제목
   * @param {string} content - 내용
   * @param {function} callback - 콜백
   * @param {object} options - 옵션
   */
  create(type, title, content, callback, options = {}) {
    // 기존 알림이 있으면 닫기
    if (this.activeAlert) {
      this.close();
    }

    const alertOptions = { ...this.defaultOptions, ...options, type };
    const alertId = `alert-${++this.alertCounter}`;
    
    // 알림 엘리먼트 생성
    const alertElement = this.createAlertElement(alertId, type, title, content, alertOptions);
    
    // 알림 객체 생성
    const alert = {
      id: alertId,
      element: alertElement,
      type,
      title,
      content,
      callback,
      options: alertOptions,
      startTime: Date.now(),
    };

    this.alerts.set(alertId, alert);
    this.activeAlert = alert;
    document.body.appendChild(alertElement);

    // 애니메이션 시작
    requestAnimationFrame(() => {
      alertElement.classList.add('alert-enter');
    });

    // body 스크롤 방지
    document.body.classList.add('alert-open');

    // 자동 닫기 설정
    if (alertOptions.timeout > 0) {
      setTimeout(() => {
        this.close();
      }, alertOptions.timeout);
    }

    // onShow 콜백
    if (alertOptions.onShow) {
      alertOptions.onShow();
    }

    return {
      id: alertId,
      close: () => this.close(),
      update: (newContent) => this.updateAlert(alertId, newContent),
    };
  }

  createAlertElement(alertId, type, title, content, options) {
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `custom-alert alert-${type} alert-${options.size} alert-${options.theme} alert-${options.animation}`;
    alert.setAttribute('role', 'dialog');
    alert.setAttribute('aria-labelledby', `${alertId}-title`);
    alert.setAttribute('aria-describedby', `${alertId}-content`);

    // 아이콘 결정
    const icons = {
      success: 'fas fa-check-circle text-green-500',
      error: 'fas fa-times-circle text-red-500',
      warning: 'fas fa-exclamation-triangle text-yellow-500',
      info: 'fas fa-info-circle text-blue-500',
      question: 'fas fa-question-circle text-blue-500',
      input: 'fas fa-edit text-blue-500',
    };

    // 버튼 생성
    const buttons = options.buttons || [
      {
        text: '확인',
        class: 'btn-primary',
        icon: 'fas fa-check',
        action: () => {
          if (options.callback) options.callback(true);
          this.close();
        }
      }
    ];

    // HTML 구조 생성
    alert.innerHTML = `
      ${options.backdrop ? '<div class="alert-backdrop"></div>' : ''}
      <div class="alert-dialog">
        <div class="alert-content">
          ${options.showClose ? `
            <button class="alert-close" aria-label="닫기">
              <i class="fas fa-times"></i>
            </button>
          ` : ''}
          
          <div class="alert-header">
            ${options.showIcon ? `
              <div class="alert-icon">
                <i class="${icons[type] || icons.info}"></i>
              </div>
            ` : ''}
            <h3 id="${alertId}-title" class="alert-title">${title}</h3>
          </div>
          
          <div id="${alertId}-content" class="alert-body">
            ${content}
          </div>
          
          <div class="alert-footer">
            ${buttons.map((btn, index) => `
              <button 
                class="btn ${btn.class || 'btn-primary'} alert-btn" 
                data-action="${index}"
              >
                ${btn.icon ? `<i class="${btn.icon} mr-2"></i>` : ''}
                ${btn.text}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 이벤트 리스너 등록
    this.setupAlertEvents(alert, buttons, options);

    return alert;
  }

  setupAlertEvents(alertElement, buttons, options) {
    // 배경 클릭으로 닫기
    if (options.backdrop) {
      const backdrop = alertElement.querySelector('.alert-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          if (options.closeOnBackdrop !== false) {
            this.close();
          }
        });
      }
    }

    // 닫기 버튼
    const closeBtn = alertElement.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // 액션 버튼들
    alertElement.querySelectorAll('.alert-btn').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (buttons[index] && buttons[index].action) {
          buttons[index].action();
        }
        this.close();
      });
    });

    // 다이얼로그 클릭 시 이벤트 버블링 방지
    const dialog = alertElement.querySelector('.alert-dialog');
    if (dialog) {
      dialog.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Enter 키로 확인 (input 타입이 아닌 경우)
    if (options.type !== 'input') {
      alertElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const primaryBtn = alertElement.querySelector('.btn-primary');
          if (primaryBtn) {
            primaryBtn.click();
          }
        }
      });
    }
  }

  close() {
    if (!this.activeAlert) return false;

    const alert = this.activeAlert;

    // 애니메이션 시작
    alert.element.classList.remove('alert-enter');
    alert.element.classList.add('alert-exit');

    // DOM에서 제거
    setTimeout(() => {
      if (alert.element.parentNode) {
        alert.element.parentNode.removeChild(alert.element);
      }
      this.alerts.delete(alert.id);
      this.activeAlert = null;

      // body 스크롤 복원
      document.body.classList.remove('alert-open');

      // onClose 콜백
      if (alert.options.onClose) {
        alert.options.onClose();
      }
    }, 300);

    return true;
  }

  updateAlert(alertId, newContent) {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    const contentElement = alert.element.querySelector('.alert-body');
    if (contentElement) {
      contentElement.innerHTML = newContent;
    }

    return true;
  }

  /**
   * 네이티브 alert 함수 오버라이드
   * @param {string} message - 메시지
   */
  replaceNativeAlert() {
    window.alert = (message) => {
      return this.show(message);
    };

    window.confirm = (message) => {
      return this.confirm(message);
    };

    window.prompt = (message, defaultValue) => {
      return this.prompt(message, defaultValue);
    };
  }

  /**
   * 네이티브 alert 함수 복원
   */
  restoreNativeAlert() {
    window.alert = this.originalAlert;
    window.confirm = this.originalConfirm;
    window.prompt = this.originalPrompt;
  }

  injectStyles() {
    if (document.getElementById('alert-styles')) return;

    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
      .custom-alert {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transform: scale(0.7);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .custom-alert.alert-enter {
        opacity: 1;
        transform: scale(1);
      }

      .custom-alert.alert-exit {
        opacity: 0;
        transform: scale(0.7);
      }

      .alert-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }

      .alert-dialog {
        position: relative;
        z-index: 1;
        margin: 20px;
      }

      .alert-content {
        background: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        min-width: 320px;
        max-width: 500px;
        position: relative;
      }

      .alert-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
        z-index: 2;
      }

      .alert-close:hover {
        background: rgba(0, 0, 0, 0.2);
        color: #374151;
      }

      .alert-header {
        padding: 32px 32px 16px 32px;
        text-align: center;
      }

      .alert-icon {
        margin-bottom: 16px;
      }

      .alert-icon i {
        font-size: 48px;
        display: block;
      }

      .alert-title {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        margin: 0;
        line-height: 1.3;
      }

      .alert-body {
        padding: 0 32px 24px 32px;
        text-align: center;
        color: #6b7280;
        font-size: 16px;
        line-height: 1.6;
      }

      .alert-footer {
        padding: 24px 32px 32px 32px;
        display: flex;
        justify-content: center;
        gap: 12px;
      }

      /* 크기 변형 */
      .alert-sm .alert-content {
        min-width: 280px;
        max-width: 400px;
      }

      .alert-sm .alert-header {
        padding: 24px 24px 12px 24px;
      }

      .alert-sm .alert-body {
        padding: 0 24px 18px 24px;
        font-size: 14px;
      }

      .alert-sm .alert-footer {
        padding: 18px 24px 24px 24px;
      }

      .alert-sm .alert-icon i {
        font-size: 36px;
      }

      .alert-sm .alert-title {
        font-size: 20px;
      }

      .alert-lg .alert-content {
        min-width: 400px;
        max-width: 600px;
      }

      .alert-lg .alert-header {
        padding: 40px 40px 20px 40px;
      }

      .alert-lg .alert-body {
        padding: 0 40px 30px 40px;
        font-size: 18px;
      }

      .alert-lg .alert-footer {
        padding: 30px 40px 40px 40px;
      }

      .alert-lg .alert-icon i {
        font-size: 64px;
      }

      .alert-lg .alert-title {
        font-size: 28px;
      }

      /* Dark 테마 */
      .alert-dark .alert-content {
        background: #1f2937;
        color: #f3f4f6;
      }

      .alert-dark .alert-title {
        color: #f9fafb;
      }

      .alert-dark .alert-close {
        background: rgba(255, 255, 255, 0.1);
        color: #d1d5db;
      }

      .alert-dark .alert-close:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #f3f4f6;
      }

      /* 애니메이션 변형 */
      .alert-bounce {
        transform: scale(0.3);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .alert-slide {
        transform: translateY(-100%);
        transition: all 0.3s ease;
      }

      .alert-slide.alert-enter {
        transform: translateY(0);
      }

      .alert-fade {
        transform: none;
        transition: opacity 0.3s ease;
      }

      .alert-fade.alert-enter {
        transform: none;
      }

      /* Body 스타일 */
      body.alert-open {
        overflow: hidden;
      }

      /* 버튼 스타일 */
      .alert-footer .btn {
        min-width: 100px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        cursor: pointer;
        border: none;
        font-size: 14px;
      }

      .alert-footer .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .alert-footer .btn-primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }

      .alert-footer .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .alert-footer .btn-secondary:hover {
        background: #e5e7eb;
        transform: translateY(-1px);
      }

      .alert-footer .btn-success {
        background: #10b981;
        color: white;
      }

      .alert-footer .btn-success:hover {
        background: #059669;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .alert-footer .btn-danger {
        background: #ef4444;
        color: white;
      }

      .alert-footer .btn-danger:hover {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }

      /* 반응형 */
      @media (max-width: 640px) {
        .alert-dialog {
          margin: 10px;
        }

        .alert-content {
          min-width: auto;
          max-width: none;
        }

        .alert-footer {
          flex-direction: column;
        }

        .alert-footer .btn {
          width: 100%;
          margin: 0;
        }

        .alert-header,
        .alert-body,
        .alert-footer {
          padding-left: 20px;
          padding-right: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  new AlertSystem();
});

// 즉시 생성 (이미 DOMContentLoaded가 발생한 경우)
if (document.readyState === 'loading') {
  // 아직 로딩 중이면 이벤트 리스너 등록
} else {
  // 이미 로드 완료된 경우 즉시 실행
  new AlertSystem();
}

} // AlertSystem 정의 체크 종료