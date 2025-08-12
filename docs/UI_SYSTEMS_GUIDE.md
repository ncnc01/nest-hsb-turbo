# UI Systems Guide

NestJS + Handlebars + Turbo 프로젝트에 통합된 완전한 UI 에코시스템입니다.

## 🎯 개요

이 프로젝트는 다음과 같은 UI 시스템들을 포함합니다:

1. **에러 바운더리 & 예외 처리**
2. **토스트 알림 시스템**
3. **모달 컴포넌트 시스템**
4. **커스텀 알림 다이얼로그**
5. **전역 로딩 UI/UX**
6. **디바운스 & 스로틀링 유틸리티**
7. **비동기 API 요청 헬퍼**

## 🛡️ 에러 바운더리 시스템

### 글로벌 예외 필터

**파일**: `src/common/filters/global-exception.filter.ts`

모든 예외를 자동으로 캐치하고 적절한 에러 페이지를 제공합니다.

#### 특징
- HTTP 상태 코드별 에러 페이지
- JSON API / HTML / Turbo Stream 응답 자동 감지
- 개발 모드에서 상세한 스택 트레이스
- 자동 로깅

#### 에러 페이지
- **404 페이지**: `views/pages/error/404.hbs`
- **일반 에러 페이지**: `views/pages/error/index.hbs`

```typescript
// 자동으로 적용됨 (main.ts에서 글로벌 필터로 등록)
// 별도 설정 불필요
```

## 🔔 토스트 알림 시스템

**파일**: `public/js/toast.js`

아름다운 토스트 알림을 제공하는 완전한 시스템입니다.

### 기본 사용법

```javascript
// 기본 토스트
Toast.success('성공적으로 처리되었습니다!');
Toast.error('오류가 발생했습니다!');
Toast.warning('주의가 필요합니다!');
Toast.info('정보를 확인하세요!');

// 로딩 토스트
const loadingToast = Toast.loading('처리 중...');
// 나중에 업데이트
loadingToast.update('완료!', 'success');
loadingToast.remove();
```

### 고급 옵션

```javascript
Toast.success('메시지', {
  duration: 5000,        // 표시 시간
  position: 'top-right', // 위치
  closable: true,        // 닫기 버튼
  showProgress: true,    // 프로그레스 바
  pauseOnHover: true,    // 호버시 일시정지
  theme: 'dark'          // 테마
});
```

### 위치 설정

```javascript
Toast.setPosition('top-left');     // 왼쪽 상단
Toast.setPosition('bottom-right'); // 오른쪽 하단
Toast.setPosition('top-center');   // 중앙 상단
```

## 🪟 모달 시스템

**파일**: `public/js/modal.js`

다양한 타입의 모달을 지원하는 완전한 모달 시스템입니다.

### 기본 모달

```javascript
const modal = Modal.create({
  title: '제목',
  content: '<p>내용</p>',
  footer: '<button class="btn btn-primary" data-dismiss="modal">확인</button>',
  options: { size: 'md' }
});
modal.open();
```

### 내장 모달 타입

```javascript
// 알림 모달
Modal.alert('제목', '메시지');

// 확인 모달
const result = await Modal.confirm('제목', '정말 삭제하시겠습니까?');

// 입력 모달
const result = await Modal.prompt('제목', '이름을 입력하세요', '기본값');

// 로딩 모달
const modal = Modal.loading('처리 중...');
setTimeout(() => modal.close(), 3000);

// 이미지 모달
Modal.image('/path/to/image.jpg', '이미지 설명');

// 폼 모달
Modal.form('사용자 정보', '<input type="text" name="name" class="form-input">');
```

### 모달 크기

- `sm`: 작은 모달
- `md`: 보통 모달 (기본값)
- `lg`: 큰 모달
- `xl`: 매우 큰 모달
- `full`: 전체 화면

## 🚨 커스텀 알림 시스템

**파일**: `public/js/alert.js`

네이티브 `alert()`, `confirm()`, `prompt()`를 대체하는 아름다운 알림 시스템입니다.

### 기본 사용법

```javascript
// 기본 알림
Alert.success('성공!');
Alert.error('오류 발생!');
Alert.warning('경고!');
Alert.show('일반 알림');

// 확인 대화상자
const result = await Alert.confirm('정말 삭제하시겠습니까?');
if (result) {
  console.log('사용자가 확인을 선택함');
}

// 입력 대화상자
const name = await Alert.prompt('이름을 입력하세요', '기본값');
if (name) {
  console.log('입력된 이름:', name);
}
```

### 네이티브 함수 대체

```javascript
// 네이티브 alert/confirm/prompt 대체
Alert.replaceNativeAlert();

// 이제 window.alert, window.confirm, window.prompt가 
// 커스텀 알림을 사용함
alert('이것은 커스텀 알림입니다!');
```

## ⏳ 로딩 시스템

**파일**: `public/js/loading.js`

다양한 타입의 로딩 인디케이터를 제공합니다.

### 전역 로딩

```javascript
// 기본 전역 로딩
const loading = Loading.show('처리 중...');
setTimeout(() => loading.hide(), 3000);

// 프로그레스바가 있는 로딩
const loading = Loading.show('업로드 중...', { showProgress: true });
loading.setProgress(50); // 50% 진행률
loading.setProgress(100); // 완료
```

### 인라인 로딩

```javascript
// 특정 요소에 로딩 표시
const loading = Loading.showInline('#my-element');
setTimeout(() => loading.hide(), 2000);

// 스켈레톤 로딩
const loading = Loading.showSkeleton('#content-area', {
  lines: 5,
  height: 20,
  spacing: 16
});
```

### 버튼 로딩

```javascript
// 버튼에 로딩 상태 적용
const loading = Loading.showButton('#submit-btn', {
  message: '저장 중...',
  icon: 'fas fa-spinner fa-spin'
});
setTimeout(() => loading.hide(), 2000);
```

### Turbo 통합

로딩 시스템은 Turbo navigation과 자동으로 연동됩니다:

```html
<!-- data-loading 속성이 있는 turbo-frame은 자동 로딩 -->
<turbo-frame id="content" data-loading src="/slow-page">
  로딩 중...
</turbo-frame>
```

## ⚡ 디바운스 & 스로틀링

**파일**: `public/js/debounce.js`

성능 최적화를 위한 디바운스와 스로틀링 유틸리티입니다.

### 기본 디바운스

```javascript
// 함수 디바운싱
const debouncedFn = Debounce.debounce(() => {
  console.log('실행됨');
}, 300);

// 여러 번 호출해도 마지막 한 번만 실행됨
debouncedFn();
debouncedFn();
debouncedFn();
```

### 스로틀링

```javascript
// 함수 스로틀링 (최대 100ms마다 한 번만 실행)
const throttledFn = Debounce.throttle(() => {
  console.log('스크롤 이벤트');
}, 100);

window.addEventListener('scroll', throttledFn);
```

### 자동 디바운스 (HTML 속성)

```html
<!-- input에 자동 디바운스 적용 -->
<input type="text" data-debounce="500" data-debounce-action="search">

<!-- 스크롤에 자동 스로틀 적용 -->
<div data-throttle="16" data-throttle-action="handleScroll">
```

### 검색 디바운서

```javascript
// 검색 입력에 특화된 디바운서
Debounce.onSearch('#search-input', async (query) => {
  const results = await fetch(`/api/search?q=${query}`).then(r => r.json());
  displayResults(results);
}, {
  minLength: 2,
  showLoading: true
});
```

### 폼 제출 디바운서

```javascript
// 폼 중복 제출 방지
Debounce.onSubmit('#my-form', async (event, form) => {
  const formData = new FormData(form);
  const result = await Api.post('/api/submit', formData);
  return result;
}, {
  showLoading: true,
  disableForm: true
});
```

## 🌐 API 요청 시스템

**파일**: `public/js/api.js`

현대적인 fetch wrapper로 포괄적인 에러 처리와 재시도 로직을 제공합니다.

### 기본 사용법

```javascript
// HTTP 메서드들
const data = await Api.get('/api/users');
const result = await Api.post('/api/users', { name: 'John' });
await Api.put('/api/users/1', { name: 'Jane' });
await Api.patch('/api/users/1', { name: 'Jane' });
await Api.delete('/api/users/1');
```

### 고급 옵션

```javascript
const result = await Api.post('/api/data', payload, {
  timeout: 10000,          // 타임아웃 (ms)
  retries: 3,              // 재시도 횟수
  retryDelay: 1000,        // 재시도 간격
  showLoading: true,       // 로딩 표시
  showErrors: true,        // 에러 토스트
  showSuccess: true,       // 성공 토스트
  cache: true,             // 응답 캐싱 (GET만)
  cacheTTL: 300000         // 캐시 TTL (5분)
});
```

### 폼 데이터 전송

```javascript
// 폼 요소에서 자동으로 데이터 추출 및 전송
const result = await Api.submitForm('#my-form', {
  validate: true,      // HTML5 검증
  showLoading: true,   // 로딩 표시
  showSuccess: true    // 성공 메시지
});
```

### 파일 업로드

```javascript
// 파일 업로드
const fileInput = document.querySelector('#file-input');
const result = await Api.uploadFiles('/api/upload', fileInput.files, {
  fileField: 'files[]',
  data: { folder: 'documents' },
  showLoading: true,
  timeout: 60000
});
```

### 페이지네이션 API

```javascript
// 페이지네이션 지원
const result = await Api.paginate('/api/posts', {
  page: 1,
  limit: 10,
  sort: 'created_at'
});

console.log(result.data);           // 현재 페이지 데이터
console.log(result.pagination);     // 페이지네이션 정보

// 다음 페이지
const nextResult = await result.nextPage();
```

### 배치 요청

```javascript
// 여러 요청을 동시에 처리
const requests = [
  { method: 'GET', url: '/api/users' },
  { method: 'GET', url: '/api/posts' },
  { method: 'GET', url: '/api/comments' }
];

const { results, errors } = await Api.batch(requests, {
  concurrent: 2,    // 동시 요청 수
  failFast: false   // 하나 실패해도 계속
});
```

### 인터셉터

```javascript
// 요청 인터셉터
Api.addRequestInterceptor(async ({ method, url, data, options }) => {
  console.log('Request:', method, url);
});

// 응답 인터셉터
Api.addResponseInterceptor(async ({ response, data, options }) => {
  console.log('Response:', data);
});

// 에러 인터셉터
Api.addErrorInterceptor(async (error, options) => {
  if (error.status === 401) {
    // 인증 만료 처리
    window.location.href = '/login';
  }
});
```

## 🎨 통합 사용 예제

### 1. 검색 기능

```javascript
// 디바운스된 검색 + API + 로딩
Debounce.onSearch('#search', async (query) => {
  const results = await Api.get('/api/search', { 
    params: { q: query },
    showLoading: true 
  });
  
  displaySearchResults(results);
  Toast.success(`${results.length}개의 결과를 찾았습니다`);
}, { minLength: 2 });
```

### 2. 폼 제출

```javascript
// 디바운스된 폼 제출 + API + 알림
Debounce.onSubmit('#contact-form', async (event, form) => {
  try {
    const result = await Api.submitForm(form, {
      showLoading: true
    });
    
    Toast.success('메시지가 전송되었습니다!');
    form.reset();
  } catch (error) {
    Alert.error('전송 실패', '다시 시도해 주세요.');
  }
});
```

### 3. 데이터 삭제

```javascript
async function deleteItem(id) {
  const confirmed = await Alert.confirm(
    '정말 삭제하시겠습니까?',
    '이 작업은 되돌릴 수 없습니다.'
  );
  
  if (confirmed) {
    try {
      await Api.delete(`/api/items/${id}`, {
        showLoading: true
      });
      
      Toast.success('항목이 삭제되었습니다');
      location.reload();
    } catch (error) {
      Toast.error('삭제 중 오류가 발생했습니다');
    }
  }
}
```

### 4. 모달 폼

```javascript
function showEditModal(item) {
  const modal = Modal.form('항목 수정', `
    <div class="space-y-4">
      <input type="text" name="name" value="${item.name}" class="form-input w-full">
      <textarea name="description" class="form-textarea w-full">${item.description}</textarea>
    </div>
  `, { size: 'lg' });
  
  modal.open();
  
  // 폼 제출 처리
  const form = modal.element.querySelector('form');
  Debounce.onSubmit(form, async (event, formEl) => {
    const formData = new FormData(formEl);
    
    await Api.put(`/api/items/${item.id}`, formData, {
      showLoading: true,
      showSuccess: true
    });
    
    modal.close();
    location.reload();
  });
}
```

## 🔧 설정 및 커스터마이징

### 테마 설정

```javascript
// 다크 모드 활성화
Toast.setTheme('dark');
Modal.setTheme('dark');
Loading.setTheme('dark');
```

### 기본값 변경

```javascript
// API 기본 설정
Api.defaultOptions.timeout = 15000;
Api.defaultOptions.retries = 5;

// Toast 기본 위치 변경
Toast.setPosition('bottom-center');
```

## 📱 반응형 지원

모든 UI 시스템은 모바일 친화적으로 설계되었습니다:

- **모바일에서 토스트**는 전체 너비로 표시
- **모바일에서 모달**은 전체 화면 스타일
- **터치 제스처** 지원
- **스크린 리더** 접근성 지원

## 🎯 성능 최적화

### 자동 최적화 기능

- **요청 중복 방지**: 동일한 API 요청 자동 병합
- **캐싱**: GET 요청 결과 자동 캐싱
- **디바운싱**: 사용자 입력 자동 최적화
- **스로틀링**: 스크롤/리사이즈 이벤트 최적화

### 성능 모니터링

```javascript
// 시스템 상태 확인
console.log(Debounce.getPerformanceStats());
console.log(Api.getStats());

// 캐시 관리
Api.clearCache();
Debounce.clearAll();
```

## 🚀 빠른 시작

1. **HTML에 스크립트 포함** (이미 `layouts/main.hbs`에 포함됨)
2. **UI Demo 페이지 방문**: `/ui-demo`
3. **각 시스템 테스트**: 버튼들을 클릭해서 기능 확인
4. **개발자 도구에서 API 확인**: `Toast`, `Modal`, `Alert`, `Loading`, `Debounce`, `Api` 객체들 사용

## 📚 추가 리소스

- **Interactive Demo**: `/interactive-demo` - HBS 인터랙티브 개발 시스템
- **Style Guide**: `/style-guide` - Tailwind CSS 컴포넌트 가이드
- **UI Demo**: `/ui-demo` - 모든 UI 시스템 통합 데모

모든 시스템은 서로 완벽하게 통합되어 있으며, Turbo/Hotwire와 호환됩니다. 🎉