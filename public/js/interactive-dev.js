/**
 * HBS에서 React처럼 인터랙티브한 개발 환경을 제공하는 유틸리티
 * - 컴포넌트 상태 관리
 * - 이벤트 바인딩
 * - 실시간 데이터 업데이트
 * - 개발자 도구
 */

// 이미 정의되어 있으면 스킵
if (typeof HBSInteractive !== 'undefined') {
  console.log('interactive-dev.js 이미 로드됨, 스킵');
} else {

class HBSInteractive {
  constructor() {
    this.state = new Map();
    this.components = new Map();
    this.eventListeners = new Map();
    this.devMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    this.init();
  }
  
  init() {
    // 개발 모드에서만 활성화
    if (!this.devMode) return;
    
    // DOM이 로드된 후 초기화
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupInteractiveElements());
    } else {
      this.setupInteractiveElements();
    }
    
    // Turbo 이벤트 리스너
    document.addEventListener('turbo:load', () => this.setupInteractiveElements());
    document.addEventListener('turbo:render', () => this.setupInteractiveElements());
    
    // 개발자 콘솔에 도구 등록
    window.HBS = this;
    
    console.log('🚀 HBS Interactive Development Mode Loaded!');
    console.log('💡 사용 가능한 명령어:');
    console.log('   HBS.setState("key", value) - 상태 설정');
    console.log('   HBS.getState("key") - 상태 조회');
    console.log('   HBS.renderComponent("name") - 컴포넌트 렌더링');
    console.log('   HBS.showComponents() - 모든 컴포넌트 보기');
    console.log('   HBS.showState() - 모든 상태 보기');
  }
  
  // 상태 관리 (React의 useState와 유사)
  setState(key, value) {
    const oldValue = this.state.get(key);
    this.state.set(key, value);
    
    // 상태 변경 시 관련 컴포넌트 업데이트
    this.updateComponents(key, value, oldValue);
    
    console.log(`🔄 State updated: ${key}`, { old: oldValue, new: value });
  }
  
  getState(key) {
    return this.state.get(key);
  }
  
  // 컴포넌트 등록
  registerComponent(name, element, updateFn) {
    this.components.set(name, {
      element,
      updateFn,
      dependencies: []
    });
  }
  
  // 상태 변경 시 컴포넌트 업데이트
  updateComponents(stateKey, newValue, oldValue) {
    this.components.forEach((component, name) => {
      if (component.dependencies.includes(stateKey)) {
        try {
          component.updateFn(newValue, oldValue);
          console.log(`🔄 Component "${name}" updated due to state change: ${stateKey}`);
        } catch (error) {
          console.error(`❌ Error updating component "${name}":`, error);
        }
      }
    });
  }
  
  // 인터랙티브 요소 설정
  setupInteractiveElements() {
    // data-hbs-* 속성을 가진 요소들 처리
    this.setupStateElements();
    this.setupEventElements();
    this.setupComponentElements();
    this.setupFormElements();
  }
  
  // data-hbs-state 요소 처리
  setupStateElements() {
    document.querySelectorAll('[data-hbs-state]').forEach(element => {
      const stateKey = element.dataset.hbsState;
      const initialValue = element.dataset.hbsValue || element.textContent;
      
      // 초기 상태 설정
      if (!this.state.has(stateKey)) {
        this.state.set(stateKey, initialValue);
      }
      
      // 컴포넌트 등록
      this.registerComponent(`state-${stateKey}`, element, (newValue) => {
        if (element.tagName === 'INPUT') {
          element.value = newValue;
        } else {
          element.textContent = newValue;
        }
      });
      
      // 의존성 추가
      this.components.get(`state-${stateKey}`).dependencies.push(stateKey);
    });
  }
  
  // data-hbs-click 등 이벤트 요소 처리
  setupEventElements() {
    // 클릭 이벤트
    document.querySelectorAll('[data-hbs-click]').forEach(element => {
      const action = element.dataset.hbsClick;
      const elementId = element.id || `element-${Date.now()}-${Math.random()}`;
      
      // 기존 리스너 제거
      if (this.eventListeners.has(elementId)) {
        element.removeEventListener('click', this.eventListeners.get(elementId));
      }
      
      const clickHandler = (e) => {
        e.preventDefault();
        this.executeAction(action, element, e);
      };
      
      element.addEventListener('click', clickHandler);
      this.eventListeners.set(elementId, clickHandler);
    });
    
    // 입력 이벤트
    document.querySelectorAll('[data-hbs-input]').forEach(element => {
      const stateKey = element.dataset.hbsInput;
      const elementId = element.id || `input-${Date.now()}-${Math.random()}`;
      
      // 기존 리스너 제거
      if (this.eventListeners.has(elementId)) {
        element.removeEventListener('input', this.eventListeners.get(elementId));
      }
      
      const inputHandler = (e) => {
        this.setState(stateKey, e.target.value);
      };
      
      element.addEventListener('input', inputHandler);
      this.eventListeners.set(elementId, inputHandler);
    });
  }
  
  // data-hbs-component 요소 처리
  setupComponentElements() {
    document.querySelectorAll('[data-hbs-component]').forEach(element => {
      const componentName = element.dataset.hbsComponent;
      const dependencies = element.dataset.hbsDependencies ? 
        element.dataset.hbsDependencies.split(',').map(s => s.trim()) : [];
      
      // 컴포넌트 등록
      this.registerComponent(componentName, element, (newValue, oldValue) => {
        // 커스텀 업데이트 로직이 있으면 실행
        const updateFn = window[`update${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`];
        if (typeof updateFn === 'function') {
          updateFn(element, newValue, oldValue);
        }
      });
      
      // 의존성 추가
      this.components.get(componentName).dependencies = dependencies;
    });
  }
  
  // 폼 요소 자동 바인딩
  setupFormElements() {
    document.querySelectorAll('[data-hbs-form]').forEach(form => {
      const formName = form.dataset.hbsForm;
      
      // 폼 데이터를 상태로 관리
      const formData = {};
      form.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.name) {
          formData[input.name] = input.value;
        }
      });
      
      this.setState(`form-${formName}`, formData);
      
      // 폼 변경 시 상태 업데이트
      form.addEventListener('input', (e) => {
        const currentData = this.getState(`form-${formName}`) || {};
        currentData[e.target.name] = e.target.value;
        this.setState(`form-${formName}`, currentData);
      });
    });
  }
  
  // 액션 실행
  executeAction(action, element, event) {
    try {
      // 간단한 액션 파싱 및 실행
      if (action.startsWith('setState:')) {
        const [, stateAction] = action.split(':');
        const [key, value] = stateAction.split('=');
        this.setState(key.trim(), value.trim());
      } else if (action.startsWith('toggleState:')) {
        const [, stateKey] = action.split(':');
        const current = this.getState(stateKey.trim());
        this.setState(stateKey.trim(), !current);
      } else if (action.startsWith('incrementState:')) {
        const [, stateKey] = action.split(':');
        const current = parseInt(this.getState(stateKey.trim())) || 0;
        this.setState(stateKey.trim(), current + 1);
      } else {
        // 커스텀 함수 실행
        const fn = window[action];
        if (typeof fn === 'function') {
          fn(element, event, this);
        } else {
          console.warn(`❌ Action function "${action}" not found`);
        }
      }
    } catch (error) {
      console.error('❌ Error executing action:', action, error);
    }
  }
  
  // 개발자 도구 메서드들
  showState() {
    console.group('🗂 Current State');
    this.state.forEach((value, key) => {
      console.log(`  ${key}:`, value);
    });
    console.groupEnd();
  }
  
  showComponents() {
    console.group('🧩 Registered Components');
    this.components.forEach((component, name) => {
      console.log(`  ${name}:`, {
        element: component.element,
        dependencies: component.dependencies
      });
    });
    console.groupEnd();
  }
  
  // 컴포넌트 강제 렌더링
  renderComponent(name) {
    const component = this.components.get(name);
    if (component) {
      component.updateFn();
      console.log(`🔄 Component "${name}" rendered`);
    } else {
      console.warn(`❌ Component "${name}" not found`);
    }
  }
  
  // 라이브 편집 모드
  enableLiveEdit() {
    document.querySelectorAll('[data-hbs-editable]').forEach(element => {
      element.contentEditable = true;
      element.style.border = '1px dashed #3b82f6';
      element.style.padding = '2px';
      
      element.addEventListener('input', (e) => {
        const stateKey = element.dataset.hbsEditable;
        if (stateKey) {
          this.setState(stateKey, e.target.textContent);
        }
      });
    });
    
    console.log('✏️ Live edit mode enabled!');
  }
  
  // 성능 모니터링
  startPerformanceMonitor() {
    this.performanceData = {
      stateUpdates: 0,
      componentUpdates: 0,
      startTime: Date.now()
    };
    
    const originalSetState = this.setState.bind(this);
    this.setState = function(key, value) {
      this.performanceData.stateUpdates++;
      return originalSetState(key, value);
    };
    
    console.log('📊 Performance monitoring started');
  }
  
  getPerformanceReport() {
    if (!this.performanceData) {
      console.warn('Performance monitoring not started');
      return;
    }
    
    const duration = Date.now() - this.performanceData.startTime;
    console.group('📊 Performance Report');
    console.log(`  Duration: ${duration}ms`);
    console.log(`  State Updates: ${this.performanceData.stateUpdates}`);
    console.log(`  Component Updates: ${this.performanceData.componentUpdates}`);
    console.log(`  Updates per second: ${((this.performanceData.stateUpdates / duration) * 1000).toFixed(2)}`);
    console.groupEnd();
  }
}

// 개발 환경에서만 초기화
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.hbsInteractive = new HBSInteractive();
}

} // HBSInteractive 정의 체크 종료