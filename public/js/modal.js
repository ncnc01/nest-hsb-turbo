/**
 * Modal System
 * React-style modal components for HBS applications
 */

if (typeof ModalSystem !== 'undefined') {
  console.log('modal.js 이미 로드됨, 스킵');
} else {

class ModalSystem {
  constructor() {
    this.modals = new Map();
    this.modalCounter = 0;
    this.activeModals = [];
    this.defaultOptions = {
      size: 'md',
      backdrop: true,
      keyboard: true,
      focus: true,
      animation: 'fade',
      closeOnBackdrop: true,
      closeOnEscape: true,
      theme: 'light',
      showClose: true,
    };
    
    this.init();
  }

  init() {
    // CSS 스타일 추가
    this.injectStyles();
    
    // 전역 객체에 등록
    window.Modal = this;
    
    // HBS 인터랙티브 시스템과 연동
    if (window.HBS) {
      window.HBS.modal = this;
    }

    // ESC 키 이벤트 리스너
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModals.length > 0) {
        const topModal = this.activeModals[this.activeModals.length - 1];
        if (topModal.options.closeOnEscape) {
          this.close(topModal.id);
        }
      }
    });
  }

  /**
   * 모달 생성 및 표시
   * @param {object} config - 모달 설정
   */
  create(config) {
    const modalId = `modal-${++this.modalCounter}`;
    const options = { ...this.defaultOptions, ...config.options };
    
    // 모달 엘리먼트 생성
    const modalElement = this.createModalElement(modalId, config, options);
    
    // 모달 객체 생성
    const modal = {
      id: modalId,
      element: modalElement,
      config,
      options,
      isOpen: false,
      openTime: null,
    };

    this.modals.set(modalId, modal);
    document.body.appendChild(modalElement);

    return {
      id: modalId,
      open: () => this.open(modalId),
      close: () => this.close(modalId),
      update: (newConfig) => this.updateModal(modalId, newConfig),
      destroy: () => this.destroy(modalId),
    };
  }

  /**
   * 간단한 알림 모달
   * @param {string} title - 제목
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  alert(title, message, options = {}) {
    return this.create({
      title,
      content: message,
      footer: `
        <button class="btn btn-primary modal-close" data-dismiss="modal">
          <i class="fas fa-check mr-2"></i>확인
        </button>
      `,
      options: { ...options, size: 'sm' }
    });
  }

  /**
   * 확인/취소 모달
   * @param {string} title - 제목
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  confirm(title, message, options = {}) {
    return new Promise((resolve) => {
      const modal = this.create({
        title,
        content: message,
        footer: `
          <button class="btn btn-secondary modal-cancel" data-dismiss="modal">
            <i class="fas fa-times mr-2"></i>취소
          </button>
          <button class="btn btn-primary modal-confirm">
            <i class="fas fa-check mr-2"></i>확인
          </button>
        `,
        options: { ...options, size: 'sm', closeOnBackdrop: false }
      });

      modal.open();

      // 이벤트 리스너 등록
      const modalElement = this.modals.get(modal.id).element;
      
      modalElement.querySelector('.modal-confirm').addEventListener('click', () => {
        modal.close();
        resolve(true);
      });

      modalElement.querySelector('.modal-cancel').addEventListener('click', () => {
        modal.close();
        resolve(false);
      });
    });
  }

  /**
   * 입력 모달
   * @param {string} title - 제목
   * @param {string} message - 메시지
   * @param {string} defaultValue - 기본값
   * @param {object} options - 옵션
   */
  prompt(title, message, defaultValue = '', options = {}) {
    return new Promise((resolve) => {
      const inputId = `modal-input-${Date.now()}`;
      
      const modal = this.create({
        title,
        content: `
          <p class="text-gray-700 mb-4">${message}</p>
          <input 
            type="text" 
            id="${inputId}"
            class="form-input w-full" 
            value="${defaultValue}" 
            placeholder="입력하세요..."
          >
        `,
        footer: `
          <button class="btn btn-secondary modal-cancel" data-dismiss="modal">
            <i class="fas fa-times mr-2"></i>취소
          </button>
          <button class="btn btn-primary modal-confirm">
            <i class="fas fa-check mr-2"></i>확인
          </button>
        `,
        options: { ...options, size: 'sm', closeOnBackdrop: false }
      });

      modal.open();

      const modalElement = this.modals.get(modal.id).element;
      const input = modalElement.querySelector(`#${inputId}`);
      
      // 입력 필드 포커스
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);

      // Enter 키로 확인
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          modal.close();
          resolve(input.value);
        }
      });

      modalElement.querySelector('.modal-confirm').addEventListener('click', () => {
        modal.close();
        resolve(input.value);
      });

      modalElement.querySelector('.modal-cancel').addEventListener('click', () => {
        modal.close();
        resolve(null);
      });
    });
  }

  /**
   * 로딩 모달
   * @param {string} message - 메시지
   * @param {object} options - 옵션
   */
  loading(message = '처리 중...', options = {}) {
    return this.create({
      content: `
        <div class="text-center py-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
          </div>
          <p class="text-gray-700">${message}</p>
        </div>
      `,
      options: {
        ...options,
        size: 'sm',
        backdrop: false,
        keyboard: false,
        showClose: false,
        closeOnBackdrop: false,
        closeOnEscape: false
      }
    });
  }

  /**
   * 이미지 모달
   * @param {string} src - 이미지 소스
   * @param {string} alt - 대체 텍스트
   * @param {object} options - 옵션
   */
  image(src, alt = '', options = {}) {
    return this.create({
      content: `
        <div class="text-center">
          <img src="${src}" alt="${alt}" class="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg">
          ${alt ? `<p class="text-gray-600 mt-4">${alt}</p>` : ''}
        </div>
      `,
      options: { ...options, size: 'lg' }
    });
  }

  /**
   * 폼 모달
   * @param {string} title - 제목
   * @param {string} formHtml - 폼 HTML
   * @param {object} options - 옵션
   */
  form(title, formHtml, options = {}) {
    return this.create({
      title,
      content: `<form class="modal-form">${formHtml}</form>`,
      footer: `
        <button class="btn btn-secondary modal-cancel" data-dismiss="modal">
          <i class="fas fa-times mr-2"></i>취소
        </button>
        <button class="btn btn-primary modal-submit">
          <i class="fas fa-save mr-2"></i>저장
        </button>
      `,
      options
    });
  }

  createModalElement(modalId, config, options) {
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = `modal modal-${options.size} modal-${options.theme} modal-${options.animation}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');

    // 모달 HTML 구조
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          ${config.title ? `
            <div class="modal-header">
              <h3 class="modal-title">${config.title}</h3>
              ${options.showClose ? `
                <button class="modal-close-btn" data-dismiss="modal" aria-label="닫기">
                  <i class="fas fa-times"></i>
                </button>
              ` : ''}
            </div>
          ` : ''}
          
          <div class="modal-body">
            ${config.content || ''}
          </div>
          
          ${config.footer ? `
            <div class="modal-footer">
              ${config.footer}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // 이벤트 리스너 등록
    this.setupModalEvents(modal, modalId, options);

    return modal;
  }

  setupModalEvents(modalElement, modalId, options) {
    // 배경 클릭으로 닫기
    if (options.closeOnBackdrop) {
      modalElement.querySelector('.modal-backdrop').addEventListener('click', () => {
        this.close(modalId);
      });

      modalElement.querySelector('.modal-dialog').addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // 닫기 버튼들
    modalElement.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.close(modalId));
    });

    // 커스텀 이벤트
    modalElement.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal-action]')) {
        const action = e.target.getAttribute('data-modal-action');
        this.handleModalAction(modalId, action, e.target);
      }
    });
  }

  handleModalAction(modalId, action, element) {
    const modal = this.modals.get(modalId);
    if (!modal) return;

    switch (action) {
      case 'close':
        this.close(modalId);
        break;
      case 'minimize':
        this.minimize(modalId);
        break;
      case 'maximize':
        this.maximize(modalId);
        break;
      default:
        // 커스텀 액션 이벤트 발생
        modal.element.dispatchEvent(new CustomEvent('modal:action', {
          detail: { action, element, modal }
        }));
    }
  }

  open(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal || modal.isOpen) return false;

    // Z-index 계산
    const zIndex = 1050 + (this.activeModals.length * 10);
    modal.element.style.zIndex = zIndex;

    // 활성 모달 목록에 추가
    this.activeModals.push(modal);

    // 모달 표시
    modal.element.style.display = 'block';
    modal.isOpen = true;
    modal.openTime = Date.now();

    // 애니메이션 시작
    requestAnimationFrame(() => {
      modal.element.classList.add('modal-open');
    });

    // body 스크롤 방지
    if (this.activeModals.length === 1) {
      document.body.classList.add('modal-open');
    }

    // 포커스 관리
    if (modal.options.focus) {
      const focusableElement = modal.element.querySelector('[autofocus], input, button, [tabindex]:not([tabindex="-1"])');
      if (focusableElement) {
        setTimeout(() => focusableElement.focus(), 100);
      }
    }

    // 이벤트 발생
    modal.element.dispatchEvent(new CustomEvent('modal:opened', { detail: modal }));

    return true;
  }

  close(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal || !modal.isOpen) return false;

    // 애니메이션 시작
    modal.element.classList.remove('modal-open');
    modal.element.classList.add('modal-closing');

    // 활성 모달 목록에서 제거
    const index = this.activeModals.findIndex(m => m.id === modalId);
    if (index > -1) {
      this.activeModals.splice(index, 1);
    }

    // 애니메이션 완료 후 숨김
    setTimeout(() => {
      modal.element.style.display = 'none';
      modal.element.classList.remove('modal-closing');
      modal.isOpen = false;

      // body 스크롤 복원
      if (this.activeModals.length === 0) {
        document.body.classList.remove('modal-open');
      }

      // 이벤트 발생
      modal.element.dispatchEvent(new CustomEvent('modal:closed', { detail: modal }));
    }, 300);

    return true;
  }

  updateModal(modalId, newConfig) {
    const modal = this.modals.get(modalId);
    if (!modal) return false;

    // 제목 업데이트
    if (newConfig.title) {
      const titleElement = modal.element.querySelector('.modal-title');
      if (titleElement) {
        titleElement.textContent = newConfig.title;
      }
    }

    // 내용 업데이트
    if (newConfig.content) {
      const bodyElement = modal.element.querySelector('.modal-body');
      if (bodyElement) {
        bodyElement.innerHTML = newConfig.content;
      }
    }

    // 푸터 업데이트
    if (newConfig.footer !== undefined) {
      let footerElement = modal.element.querySelector('.modal-footer');
      if (newConfig.footer) {
        if (!footerElement) {
          footerElement = document.createElement('div');
          footerElement.className = 'modal-footer';
          modal.element.querySelector('.modal-content').appendChild(footerElement);
        }
        footerElement.innerHTML = newConfig.footer;
      } else if (footerElement) {
        footerElement.remove();
      }
    }

    // 설정 업데이트
    modal.config = { ...modal.config, ...newConfig };

    return true;
  }

  destroy(modalId) {
    const modal = this.modals.get(modalId);
    if (!modal) return false;

    // 모달이 열려있으면 닫기
    if (modal.isOpen) {
      this.close(modalId);
    }

    // DOM에서 제거
    setTimeout(() => {
      if (modal.element.parentNode) {
        modal.element.parentNode.removeChild(modal.element);
      }
      this.modals.delete(modalId);
    }, modal.isOpen ? 300 : 0);

    return true;
  }

  /**
   * 모든 모달 닫기
   */
  closeAll() {
    for (const modal of this.activeModals.slice()) {
      this.close(modal.id);
    }
  }

  /**
   * 특정 타입의 모달들 닫기
   * @param {string} type - 모달 타입
   */
  closeType(type) {
    for (const modal of this.activeModals.slice()) {
      if (modal.config.type === type) {
        this.close(modal.id);
      }
    }
  }

  injectStyles() {
    if (document.getElementById('modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        z-index: 1050;
        outline: 0;
      }

      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(4px);
      }

      .modal.modal-open .modal-backdrop {
        opacity: 1;
      }

      .modal-dialog {
        position: relative;
        width: auto;
        margin: 40px auto;
        pointer-events: none;
        transform: translateY(-50px);
        transition: transform 0.3s ease;
        max-height: calc(100vh - 80px);
        display: flex;
        align-items: center;
        min-height: calc(100vh - 80px);
      }

      .modal.modal-open .modal-dialog {
        transform: translateY(0);
        pointer-events: auto;
      }

      .modal-content {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        background: white;
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        outline: 0;
        max-height: calc(100vh - 80px);
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        line-height: 1.5;
      }

      .modal-close-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
      }

      .modal-close-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .modal-body {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
      }

      /* 모달 크기 */
      .modal-sm .modal-dialog {
        max-width: 400px;
      }

      .modal-md .modal-dialog {
        max-width: 600px;
      }

      .modal-lg .modal-dialog {
        max-width: 800px;
      }

      .modal-xl .modal-dialog {
        max-width: 1200px;
      }

      .modal-full .modal-dialog {
        max-width: none;
        margin: 20px;
        height: calc(100vh - 40px);
      }

      .modal-full .modal-content {
        height: 100%;
      }

      /* Dark Theme */
      .modal.modal-dark .modal-content {
        background: #1f2937;
        color: #f3f4f6;
      }

      .modal.modal-dark .modal-header {
        border-bottom-color: #374151;
      }

      .modal.modal-dark .modal-title {
        color: #f9fafb;
      }

      .modal.modal-dark .modal-close-btn {
        color: #9ca3af;
      }

      .modal.modal-dark .modal-close-btn:hover {
        background: #374151;
        color: #d1d5db;
      }

      .modal.modal-dark .modal-footer {
        border-top-color: #374151;
      }

      /* 애니메이션 */
      .modal.modal-slide .modal-dialog {
        transform: translateX(-100%);
      }

      .modal.modal-slide.modal-open .modal-dialog {
        transform: translateX(0);
      }

      .modal.modal-zoom .modal-dialog {
        transform: scale(0.7);
      }

      .modal.modal-zoom.modal-open .modal-dialog {
        transform: scale(1);
      }

      /* Body 스타일 */
      body.modal-open {
        overflow: hidden;
        padding-right: 17px; /* 스크롤바 보상 */
      }

      /* 반응형 */
      @media (max-width: 640px) {
        .modal-dialog {
          margin: 10px;
          max-width: none;
          min-height: calc(100vh - 20px);
        }

        .modal-sm .modal-dialog,
        .modal-md .modal-dialog,
        .modal-lg .modal-dialog,
        .modal-xl .modal-dialog {
          max-width: none;
        }

        .modal-header,
        .modal-body,
        .modal-footer {
          padding-left: 16px;
          padding-right: 16px;
        }

        .modal-footer {
          flex-direction: column-reverse;
        }

        .modal-footer .btn {
          width: 100%;
        }
      }

      /* 로딩 스피너 */
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .fa-spin {
        animation: spin 1s linear infinite;
      }
    `;

    document.head.appendChild(style);
  }
}

// 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  new ModalSystem();
});

// 즉시 생성 (이미 DOMContentLoaded가 발생한 경우)
if (document.readyState === 'loading') {
  // 아직 로딩 중이면 이벤트 리스너 등록
} else {
  // 이미 로드 완료된 경우 즉시 실행
  new ModalSystem();
}

} // ModalSystem 정의 체크 종료