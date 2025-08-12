/**
 * 브라우저 상호작용 종합 로깅 시스템
 * 스크롤, 클릭, 드래그, 키보드, 마우스 이벤트 등을 모니터링
 */

class InteractionLogger {
  constructor(options = {}) {
    // Load saved settings from localStorage
    const savedSettings = this.loadSettings();
    
    this.options = {
      enableScrollLogging: true,
      enableClickLogging: true,
      enableDragLogging: true,
      enableKeyboardLogging: true,
      enableMouseLogging: true,
      enableResizeLogging: true,
      enablePerformanceLogging: true,
      enableTurboLogging: true,
      logLevel: 'info', // 'debug', 'info', 'warn', 'error'
      throttleMs: 100, // 스크롤, 마우스 이동 등의 쓰로틀링
      ...savedSettings,
      ...options
    };
    
    this.lastScrollTime = 0;
    this.lastMouseTime = 0;
    this.dragState = {
      isDragging: false,
      startX: undefined,
      startY: undefined,
      element: null
    };
    
    this.init();
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const saved = localStorage.getItem('interactionLoggerSettings');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load logger settings:', error);
      return {};
    }
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      const settings = {
        enableScrollLogging: this.options.enableScrollLogging,
        enableClickLogging: this.options.enableClickLogging,
        enableDragLogging: this.options.enableDragLogging,
        enableKeyboardLogging: this.options.enableKeyboardLogging,
        enableMouseLogging: this.options.enableMouseLogging,
        enableResizeLogging: this.options.enableResizeLogging,
        enablePerformanceLogging: this.options.enablePerformanceLogging,
        enableTurboLogging: this.options.enableTurboLogging
      };
      localStorage.setItem('interactionLoggerSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save logger settings:', error);
    }
  }

  // Check if event target is within the developer tools modal
  isWithinModal(element) {
    if (!element) return false;
    
    // Check if the element itself or any parent has the modal ID
    let current = element;
    while (current && current !== document.body) {
      if (current.id === 'interaction-logger-modal' || current.id === 'dev-tools-modal') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  init() {
    console.log('🔍 InteractionLogger 초기화 시작');
    
    // 각 로깅 기능 초기화
    if (this.options.enableScrollLogging) this.initScrollLogging();
    if (this.options.enableClickLogging) this.initClickLogging();
    if (this.options.enableDragLogging) this.initDragLogging();
    // 키보드 로깅은 항상 초기화 (개발자 도구 모달 단축키 때문에)
    this.initKeyboardLogging();
    if (this.options.enableMouseLogging) this.initMouseLogging();
    if (this.options.enableResizeLogging) this.initResizeLogging();
    if (this.options.enablePerformanceLogging) this.initPerformanceLogging();
    if (this.options.enableTurboLogging) this.initTurboLogging();
    
    console.log('✅ InteractionLogger 초기화 완료');
  }

  // 로그 출력 헬퍼
  log(level, category, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      category,
      message,
      ...data
    };

    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }[level] || 'ℹ️';

    console.log(`${emoji} [${category.toUpperCase()}] ${message}`, logData);
    
    // 필요시 서버로 전송하거나 로컬스토리지에 저장
    this.storeLog(logData);
  }

  storeLog(logData) {
    // 로그를 localStorage에 저장 (최대 1000개)
    try {
      const logs = JSON.parse(localStorage.getItem('interactionLogs') || '[]');
      logs.push(logData);
      
      // 최대 1000개 제한
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('interactionLogs', JSON.stringify(logs));
    } catch (error) {
      console.warn('로그 저장 실패:', error);
    }
  }

  // 스크롤 로깅
  initScrollLogging() {
    const throttledScrollHandler = this.throttle(() => {
      if (!this.options.enableScrollLogging) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercent = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);

      this.log('debug', 'scroll', `스크롤 위치 변경`, {
        scrollTop,
        scrollLeft,
        scrollPercent,
        scrollHeight,
        clientHeight,
        direction: scrollTop > this.lastScrollTop ? 'down' : 'up'
      });

      this.lastScrollTop = scrollTop;
    }, this.options.throttleMs);

    window.addEventListener('scroll', throttledScrollHandler);
    console.log('📜 스크롤 로깅 활성화');
  }

  // 클릭 로깅
  initClickLogging() {
    document.addEventListener('click', (event) => {
      if (!this.options.enableClickLogging || this.isWithinModal(event.target)) return;
      
      const target = event.target;
      const rect = target.getBoundingClientRect();
      
      this.log('info', 'click', `요소 클릭`, {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        textContent: target.textContent?.substring(0, 50),
        coordinates: {
          x: event.clientX,
          y: event.clientY,
          pageX: event.pageX,
          pageY: event.pageY
        },
        elementRect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        modifiers: {
          ctrl: event.ctrlKey,
          shift: event.shiftKey,
          alt: event.altKey,
          meta: event.metaKey
        }
      });
    });

    console.log('🖱️ 클릭 로깅 활성화');
  }

  // 드래그 로깅
  initDragLogging() {
    document.addEventListener('mousedown', (event) => {
      if (!this.options.enableDragLogging || this.isWithinModal(event.target)) return;
      
      this.dragState = {
        isDragging: false,
        startX: event.clientX,
        startY: event.clientY,
        element: event.target,
        startTime: Date.now()
      };
    });

    document.addEventListener('mousemove', (event) => {
      if (!this.options.enableDragLogging || this.dragState.startX === undefined) return;
      
      const deltaX = event.clientX - this.dragState.startX;
      const deltaY = event.clientY - this.dragState.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 5px 이상 이동하면 드래그로 간주
      if (distance > 5 && !this.dragState.isDragging) {
        this.dragState.isDragging = true;
        
        this.log('info', 'drag', `드래그 시작`, {
          element: {
            tagName: this.dragState.element.tagName,
            id: this.dragState.element.id,
            className: this.dragState.element.className
          },
          startCoordinates: {
            x: this.dragState.startX,
            y: this.dragState.startY
          }
        });
      }

      if (this.dragState.isDragging) {
        this.log('debug', 'drag', `드래그 중`, {
          currentCoordinates: {
            x: event.clientX,
            y: event.clientY
          },
          delta: { deltaX, deltaY },
          distance: Math.round(distance)
        });
      }
    });

    document.addEventListener('mouseup', (event) => {
      if (!this.options.enableDragLogging) {
        // Reset state even if logging is disabled
        this.dragState = {
          isDragging: false,
          startX: undefined,
          startY: undefined,
          element: null
        };
        return;
      }
      
      if (this.dragState.isDragging) {
        const duration = Date.now() - this.dragState.startTime;
        const deltaX = event.clientX - this.dragState.startX;
        const deltaY = event.clientY - this.dragState.startY;
        
        this.log('info', 'drag', `드래그 종료`, {
          endCoordinates: {
            x: event.clientX,
            y: event.clientY
          },
          totalDelta: { deltaX, deltaY },
          duration,
          distance: Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY))
        });
      }
      
      // 상태 초기화
      this.dragState = {
        isDragging: false,
        startX: undefined,
        startY: undefined,
        element: null
      };
    });

    console.log('🖐️ 드래그 로깅 활성화');
  }

  // 키보드 로깅
  initKeyboardLogging() {
    // 개발자 도구 모달 단축키를 먼저 등록 (Ctrl+Shift+L)
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        console.log('🔧 개발자 도구 모달 단축키 감지');
        this.showDeveloperToolsModal();
      }
    });

    // 일반 키보드 로깅
    document.addEventListener('keydown', (event) => {
      // 비밀번호 입력 필드는 로깅하지 않음
      if (event.target.type === 'password') return;
      
      if (!this.options.enableKeyboardLogging || this.isWithinModal(event.target)) return;

      this.log('info', 'keyboard', `키 입력`, {
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        target: {
          tagName: event.target.tagName,
          type: event.target.type,
          id: event.target.id,
          name: event.target.name
        },
        modifiers: {
          ctrl: event.ctrlKey,
          shift: event.shiftKey,
          alt: event.altKey,
          meta: event.metaKey
        }
      });
    });

    // 특수 키 조합 감지
    document.addEventListener('keydown', (event) => {
      if (!this.options.enableKeyboardLogging || this.isWithinModal(event.target)) return;
      
      const shortcuts = [
        { keys: ['ctrl', 's'], name: '저장' },
        { keys: ['ctrl', 'z'], name: '실행취소' },
        { keys: ['ctrl', 'y'], name: '다시실행' },
        { keys: ['ctrl', 'c'], name: '복사' },
        { keys: ['ctrl', 'v'], name: '붙여넣기' },
        { keys: ['ctrl', 'x'], name: '잘라내기' },
        { keys: ['f5'], name: '새로고침' },
        { keys: ['ctrl', 'f5'], name: '강제새로고침' }
      ];

      shortcuts.forEach(shortcut => {
        const matches = shortcut.keys.every(key => {
          switch(key) {
            case 'ctrl': return event.ctrlKey;
            case 'shift': return event.shiftKey;
            case 'alt': return event.altKey;
            case 'meta': return event.metaKey;
            default: return event.key.toLowerCase() === key.toLowerCase();
          }
        });

        if (matches) {
          this.log('info', 'shortcut', `단축키 사용: ${shortcut.name}`, {
            shortcut: shortcut.keys.join('+'),
            name: shortcut.name
          });
        }
      });
    });

    console.log('⌨️ 키보드 로깅 활성화');
  }

  // 마우스 이동 로깅 (쓰로틀링 적용)
  initMouseLogging() {
    const throttledMouseHandler = this.throttle((event) => {
      if (!this.options.enableMouseLogging || this.isWithinModal(event.target)) return;
      
      this.log('debug', 'mouse', `마우스 이동`, {
        coordinates: {
          x: event.clientX,
          y: event.clientY,
          pageX: event.pageX,
          pageY: event.pageY
        },
        target: {
          tagName: event.target.tagName,
          id: event.target.id,
          className: event.target.className
        }
      });
    }, this.options.throttleMs * 2); // 마우스는 더 긴 쓰로틀링

    document.addEventListener('mousemove', throttledMouseHandler);

    // 마우스 휠 이벤트
    document.addEventListener('wheel', (event) => {
      if (!this.options.enableMouseLogging || this.isWithinModal(event.target)) return;
      
      this.log('debug', 'wheel', `마우스 휠`, {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        deltaMode: event.deltaMode
      });
    });

    console.log('🖱️ 마우스 로깅 활성화');
  }

  // 브라우저 크기 변경 로깅
  initResizeLogging() {
    const throttledResizeHandler = this.throttle(() => {
      if (!this.options.enableResizeLogging) return;
      
      this.log('info', 'resize', `브라우저 크기 변경`, {
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight
        },
        devicePixelRatio: window.devicePixelRatio
      });
    }, this.options.throttleMs);

    window.addEventListener('resize', throttledResizeHandler);
    console.log('📏 리사이즈 로깅 활성화');
  }

  // 성능 로깅
  initPerformanceLogging() {
    // 페이지 로딩 성능
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (!this.options.enablePerformanceLogging) return;
        
        const perfData = performance.getEntriesByType('navigation')[0];
        this.log('info', 'performance', `페이지 로딩 성능`, {
          loadTime: perfData.loadEventEnd - perfData.fetchStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
        });
      }, 0);
    });

    // 메모리 사용량 (Chrome에서만 지원)
    if (performance.memory) {
      setInterval(() => {
        if (!this.options.enablePerformanceLogging) return;
        
        this.log('debug', 'memory', `메모리 사용량`, {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });
      }, 30000); // 30초마다
    }

    console.log('⚡ 성능 로깅 활성화');
  }

  // Turbo 이벤트 로깅
  initTurboLogging() {
    const turboEvents = [
      'turbo:click',
      'turbo:before-visit',
      'turbo:visit',
      'turbo:before-cache',
      'turbo:before-render',
      'turbo:render',
      'turbo:load',
      'turbo:frame-render',
      'turbo:frame-load'
    ];

    turboEvents.forEach(eventName => {
      document.addEventListener(eventName, (event) => {
        if (!this.options.enableTurboLogging) return;
        
        this.log('info', 'turbo', `Turbo 이벤트: ${eventName}`, {
          eventType: eventName,
          detail: event.detail,
          target: event.target?.tagName,
          url: event.detail?.url || window.location.href
        });
      });
    });

    console.log('🚀 Turbo 로깅 활성화');
  }

  // 쓰로틀링 헬퍼
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // 로그 내보내기
  exportLogs() {
    const logs = JSON.parse(localStorage.getItem('interactionLogs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `interaction-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('📁 로그 파일 내보내기 완료');
  }

  // 로그 삭제
  clearLogs() {
    localStorage.removeItem('interactionLogs');
    console.log('🗑️ 로그 삭제 완료');
  }

  // 현재 설정 표시
  showStatus() {
    console.log('📊 InteractionLogger 상태:', {
      옵션: this.options,
      저장된로그수: JSON.parse(localStorage.getItem('interactionLogs') || '[]').length,
      활성화된기능: Object.keys(this.options).filter(key => key.startsWith('enable') && this.options[key])
    });
  }

  // 개발자 도구 모달 표시
  showDeveloperToolsModal() {
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('interaction-logger-modal');
    if (existingModal) {
      existingModal.remove();
      return;
    }

    // 모달 HTML 생성
    const modal = document.createElement('div');
    modal.id = 'interaction-logger-modal';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      ">
        <div style="
          background: #1a1a1a;
          color: #f0f0f0;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #333;
            padding-bottom: 15px;
          ">
            <h2 style="
              margin: 0;
              color: #4a9eff;
              font-size: 20px;
              font-weight: bold;
            ">🛠️ Developer Tools</h2>
            <button id="close-dev-modal" style="
              background: #ff4757;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 6px 12px;
              cursor: pointer;
              font-size: 14px;
            ">✕ 닫기</button>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #ffa502; margin: 0 0 10px 0; font-size: 16px;">⚙️ Logging Controls</h3>
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; font-size: 13px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-scroll" ${this.options.enableScrollLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-scroll" style="color: #ddd; cursor: pointer; margin: 0;">📜 Scroll Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-click" ${this.options.enableClickLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-click" style="color: #ddd; cursor: pointer; margin: 0;">🖱️ Click Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-drag" ${this.options.enableDragLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-drag" style="color: #ddd; cursor: pointer; margin: 0;">🖐️ Drag Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-keyboard" ${this.options.enableKeyboardLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-keyboard" style="color: #ddd; cursor: pointer; margin: 0;">⌨️ Keyboard Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-mouse" ${this.options.enableMouseLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-mouse" style="color: #ddd; cursor: pointer; margin: 0;">🖱️ Mouse Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-resize" ${this.options.enableResizeLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-resize" style="color: #ddd; cursor: pointer; margin: 0;">📏 Resize Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-performance" ${this.options.enablePerformanceLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-performance" style="color: #ddd; cursor: pointer; margin: 0;">⚡ Performance Logging</label>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="toggle-turbo" ${this.options.enableTurboLogging ? 'checked' : ''} style="margin: 0;">
                  <label for="toggle-turbo" style="color: #ddd; cursor: pointer; margin: 0;">🚀 Turbo Logging</label>
                </div>
              </div>
              <div style="text-align: center;">
                <button id="reset-defaults" style="
                  background: #ff9ff3;
                  color: #333;
                  border: none;
                  border-radius: 6px;
                  padding: 8px 16px;
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: bold;
                ">🔄 Reset to Defaults</button>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #ffa502; margin: 0 0 10px 0; font-size: 16px;">🔍 InteractionLogger Commands</h3>
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; font-size: 13px;">
              <div style="margin-bottom: 12px;">
                <code style="color: #7bed9f; font-weight: bold;">exportInteractionLogs()</code>
                <p style="margin: 4px 0 0 0; color: #ddd;">📁 현재 저장된 모든 상호작용 로그를 JSON 파일로 내보냅니다.</p>
              </div>
              <div style="margin-bottom: 12px;">
                <code style="color: #7bed9f; font-weight: bold;">clearInteractionLogs()</code>
                <p style="margin: 4px 0 0 0; color: #ddd;">🗑️ 저장된 모든 상호작용 로그를 삭제합니다.</p>
              </div>
              <div>
                <code style="color: #7bed9f; font-weight: bold;">showLoggerStatus()</code>
                <p style="margin: 4px 0 0 0; color: #ddd;">📊 현재 로거 설정과 저장된 로그 수를 콘솔에 출력합니다.</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #ffa502; margin: 0 0 10px 0; font-size: 16px;">⌨️ Keyboard Shortcuts</h3>
            <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; font-size: 13px;">
              <div>
                <code style="color: #ff6b6b; font-weight: bold;">Ctrl + Shift + L</code>
                <span style="color: #ddd;"> - 이 개발자 도구 모달을 열거나 닫습니다</span>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #ffa502; margin: 0 0 10px 0; font-size: 16px;">📈 Quick Actions</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button onclick="exportInteractionLogs(); document.getElementById('dev-tools-modal').remove();" style="
                background: #2ed573;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 12px;
              ">📁 Export Logs</button>
              <button onclick="showLoggerStatus();" style="
                background: #3742fa;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 12px;
              ">📊 Show Status</button>
              <button onclick="if(confirm('모든 로그를 삭제하시겠습니까?')) { clearInteractionLogs(); }" style="
                background: #ff4757;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 12px;
              ">🗑️ Clear Logs</button>
            </div>
          </div>

          <div style="background: #2d2d2d; padding: 12px; border-radius: 8px; font-size: 12px; color: #999;">
            <p style="margin: 0;">💡 <strong>팁:</strong> 브라우저 개발자 도구 콘솔에서 위의 함수들을 직접 호출할 수도 있습니다.</p>
          </div>
        </div>
      </div>
    `;

    // 이벤트 리스너 추가
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // 닫기 버튼 이벤트
    modal.querySelector('#close-dev-modal').addEventListener('click', () => {
      modal.remove();
    });

    // Toggle switches event handlers
    const toggles = [
      { id: 'toggle-scroll', option: 'enableScrollLogging' },
      { id: 'toggle-click', option: 'enableClickLogging' },
      { id: 'toggle-drag', option: 'enableDragLogging' },
      { id: 'toggle-keyboard', option: 'enableKeyboardLogging' },
      { id: 'toggle-mouse', option: 'enableMouseLogging' },
      { id: 'toggle-resize', option: 'enableResizeLogging' },
      { id: 'toggle-performance', option: 'enablePerformanceLogging' },
      { id: 'toggle-turbo', option: 'enableTurboLogging' }
    ];

    toggles.forEach(({ id, option }) => {
      const toggle = modal.querySelector(`#${id}`);
      toggle.addEventListener('change', (event) => {
        this.options[option] = event.target.checked;
        this.saveSettings();
        console.log(`${option} ${event.target.checked ? 'enabled' : 'disabled'}`);
      });
    });

    // Reset to defaults button
    modal.querySelector('#reset-defaults').addEventListener('click', () => {
      const defaults = {
        enableScrollLogging: true,
        enableClickLogging: true,
        enableDragLogging: true,
        enableKeyboardLogging: true,
        enableMouseLogging: true,
        enableResizeLogging: true,
        enablePerformanceLogging: true,
        enableTurboLogging: true
      };
      
      // Update options
      Object.assign(this.options, defaults);
      
      // Update UI toggles
      toggles.forEach(({ id }) => {
        const toggle = modal.querySelector(`#${id}`);
        toggle.checked = true;
      });
      
      // Save settings
      this.saveSettings();
      console.log('🔄 All logging options reset to defaults');
    });

    // ESC 키로 닫기
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // DOM에 추가
    document.body.appendChild(modal);

    this.log('info', 'dev-tools', '개발자 도구 모달 열림');
  }
}

// 전역 변수로 로거 인스턴스 생성
window.interactionLogger = new InteractionLogger();

// 개발자 도구에서 사용할 수 있는 함수들
window.exportInteractionLogs = () => window.interactionLogger.exportLogs();
window.clearInteractionLogs = () => window.interactionLogger.clearLogs();
window.showLoggerStatus = () => window.interactionLogger.showStatus();

console.log('🔍 InteractionLogger가 로드되었습니다.');
console.log('💡 사용 가능한 함수:');
console.log('  - exportInteractionLogs(): 로그를 JSON 파일로 내보내기');
console.log('  - clearInteractionLogs(): 저장된 로그 삭제');
console.log('  - showLoggerStatus(): 현재 상태 확인');
console.log('⌨️  개발자 도구: Ctrl+Shift+L로 개발자 도구 모달을 열 수 있습니다.');