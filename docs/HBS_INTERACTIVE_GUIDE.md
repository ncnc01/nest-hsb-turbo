# HBS Interactive Development Guide

HBS에서 React처럼 인터랙티브한 개발을 할 수 있도록 구축한 시스템입니다.

## 🚀 주요 기능

### 1. React-style 상태 관리
- `data-hbs-state`: 상태와 연결된 요소
- `HBS.setState()`, `HBS.getState()`: 상태 관리 API
- 상태 변경 시 자동 UI 업데이트

### 2. 선언적 이벤트 바인딩
- `data-hbs-click`: 클릭 이벤트 처리
- `data-hbs-input`: 입력 이벤트 처리
- 간단한 액션과 커스텀 함수 지원

### 3. 컴포넌트 시스템
- `data-hbs-component`: 컴포넌트 등록
- `data-hbs-dependencies`: 의존성 관리
- 상태 변경 시 관련 컴포넌트만 업데이트

### 4. 폼 자동 바인딩
- `data-hbs-form`: 폼 상태 자동 관리
- 입력값 변경 시 실시간 동기화

### 5. 개발자 도구
- 브라우저 콘솔에서 상태 및 컴포넌트 관리
- 성능 모니터링
- 라이브 편집 모드

## 📖 사용 방법

### 기본 상태 관리

```html
<!-- 상태와 연결된 요소 -->
<div data-hbs-state="counter" data-hbs-value="0">0</div>

<!-- 상태를 변경하는 버튼 -->
<button data-hbs-click="setState:counter=5">5로 설정</button>
<button data-hbs-click="incrementState:counter">1 증가</button>
<button data-hbs-click="toggleState:isVisible">토글</button>
```

### 커스텀 이벤트 핸들러

```html
<button data-hbs-click="myCustomFunction">커스텀 함수 호출</button>

<script>
window.myCustomFunction = function(element, event, HBS) {
  console.log('버튼이 클릭되었습니다!');
  HBS.setState('clickCount', (HBS.getState('clickCount') || 0) + 1);
};
</script>
```

### 컴포넌트 시스템

```html
<!-- 컴포넌트 등록 -->
<div 
  data-hbs-component="userProfile"
  data-hbs-dependencies="userName,userEmail"
>
  <!-- 컴포넌트 내용 -->
</div>

<script>
function updateUserProfile(element, newValue, oldValue) {
  // userName 또는 userEmail 상태가 변경될 때마다 호출
  const name = HBS.getState('userName') || '사용자';
  const email = HBS.getState('userEmail') || 'email@example.com';
  
  element.innerHTML = `
    <h3>${name}</h3>
    <p>${email}</p>
  `;
}
</script>
```

### 폼 바인딩

```html
<!-- 폼 자동 바인딩 -->
<form data-hbs-form="contactForm">
  <input name="name" data-hbs-input="contactName" placeholder="이름">
  <input name="email" data-hbs-input="contactEmail" placeholder="이메일">
  <textarea name="message" data-hbs-input="contactMessage"></textarea>
</form>

<!-- 실시간 미리보기 -->
<div>
  <strong>이름:</strong> <span data-hbs-state="contactName">입력해주세요</span><br>
  <strong>이메일:</strong> <span data-hbs-state="contactEmail">입력해주세요</span><br>
  <strong>메시지:</strong> <span data-hbs-state="contactMessage">입력해주세요</span>
</div>
```

### 라이브 편집

```html
<!-- 라이브 편집 가능한 요소 -->
<h1 data-hbs-editable="pageTitle">클릭해서 편집하세요</h1>
<p data-hbs-editable="pageContent">이 내용도 편집 가능합니다</p>

<!-- 편집 모드 활성화 버튼 -->
<button onclick="HBS.enableLiveEdit()">라이브 편집 모드</button>
```

## 🛠 개발자 도구

### 브라우저 콘솔에서 사용:

```javascript
// 상태 관리
HBS.setState('key', 'value')      // 상태 설정
HBS.getState('key')               // 상태 조회
HBS.showState()                   // 모든 상태 출력

// 컴포넌트 관리
HBS.showComponents()              // 모든 컴포넌트 출력
HBS.renderComponent('name')       // 특정 컴포넌트 강제 렌더링

// 개발 도구
HBS.enableLiveEdit()              // 라이브 편집 모드
HBS.startPerformanceMonitor()     // 성능 모니터링 시작
HBS.getPerformanceReport()        // 성능 리포트
```

## 🎯 실제 사용 예제

### 1. 카운터 애플리케이션

```html
<div class="counter-app">
  <button data-hbs-click="incrementState:count">+</button>
  <span data-hbs-state="count" data-hbs-value="0">0</span>
  <button data-hbs-click="decrementCount">-</button>
  <button data-hbs-click="setState:count=0">리셋</button>
</div>

<script>
window.decrementCount = function() {
  const current = parseInt(HBS.getState('count')) || 0;
  HBS.setState('count', current - 1);
};
</script>
```

### 2. 할 일 목록

```html
<div class="todo-app">
  <div class="input-group">
    <input 
      type="text" 
      class="form-input"
      placeholder="새 할 일 입력"
      data-hbs-input="newTodo"
    >
    <button class="btn btn-primary" data-hbs-click="addTodo">추가</button>
  </div>
  
  <div 
    id="todo-list"
    data-hbs-component="todoList"
    data-hbs-dependencies="todos"
  ></div>
</div>

<script>
window.addTodo = function() {
  const text = HBS.getState('newTodo');
  if (!text) return;
  
  const todos = HBS.getState('todos') || [];
  todos.push({
    id: Date.now(),
    text: text,
    completed: false
  });
  
  HBS.setState('todos', todos);
  HBS.setState('newTodo', '');
  document.querySelector('[data-hbs-input="newTodo"]').value = '';
};

function updateTodoList(element) {
  const todos = HBS.getState('todos') || [];
  element.innerHTML = todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}">
      <input 
        type="checkbox" 
        ${todo.completed ? 'checked' : ''}
        onchange="toggleTodo(${todo.id})"
      >
      <span>${todo.text}</span>
      <button onclick="removeTodo(${todo.id})">삭제</button>
    </div>
  `).join('');
}

window.toggleTodo = function(id) {
  const todos = HBS.getState('todos') || [];
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    HBS.setState('todos', todos);
  }
};

window.removeTodo = function(id) {
  const todos = HBS.getState('todos') || [];
  HBS.setState('todos', todos.filter(t => t.id !== id));
};
</script>
```

### 3. 사용자 프로필 편집기

```html
<div class="profile-editor">
  <form data-hbs-form="profile">
    <div class="form-group">
      <label>이름</label>
      <input name="name" data-hbs-input="profileName" class="form-input">
    </div>
    <div class="form-group">
      <label>이메일</label>
      <input name="email" type="email" data-hbs-input="profileEmail" class="form-input">
    </div>
    <div class="form-group">
      <label>소개</label>
      <textarea name="bio" data-hbs-input="profileBio" class="form-textarea"></textarea>
    </div>
  </form>
  
  <div class="profile-preview" 
       data-hbs-component="profilePreview"
       data-hbs-dependencies="profileName,profileEmail,profileBio">
    <!-- 실시간 미리보기 -->
  </div>
</div>

<script>
function updateProfilePreview(element) {
  const name = HBS.getState('profileName') || '이름 없음';
  const email = HBS.getState('profileEmail') || '';
  const bio = HBS.getState('profileBio') || '';
  
  element.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h3>${name}</h3>
        ${email ? `<p class="text-gray-600">${email}</p>` : ''}
        ${bio ? `<p class="mt-2">${bio}</p>` : ''}
      </div>
    </div>
  `;
}
</script>
```

## 🔧 고급 기능

### 성능 최적화

```javascript
// 성능 모니터링
HBS.startPerformanceMonitor();

// 일정 시간 후 리포트
setTimeout(() => {
  HBS.getPerformanceReport();
}, 5000);
```

### 상태 지속성

```javascript
// localStorage에 상태 저장
function saveState() {
  const state = {};
  HBS.state.forEach((value, key) => {
    state[key] = value;
  });
  localStorage.setItem('hbs-state', JSON.stringify(state));
}

// localStorage에서 상태 복원
function loadState() {
  const saved = localStorage.getItem('hbs-state');
  if (saved) {
    const state = JSON.parse(saved);
    Object.entries(state).forEach(([key, value]) => {
      HBS.setState(key, value);
    });
  }
}
```

## 📊 장점

1. **React-style 개발 경험**: 상태 관리와 선언적 UI
2. **Hot Reload 지원**: 실시간 코드 반영
3. **Turbo 호환성**: 기존 Turbo 기능과 완벽 호환
4. **점진적 도입**: 필요한 부분만 선택적으로 사용 가능
5. **개발자 친화적**: 풍부한 디버깅 도구
6. **성능 모니터링**: 실시간 성능 추적

이제 HBS에서도 React처럼 인터랙티브하고 효율적인 개발이 가능합니다! 🚀