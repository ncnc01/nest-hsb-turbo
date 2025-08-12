# Tailwind CSS 생산성 향상 가이드

이 프로젝트는 Tailwind CSS 클래스명을 외우지 않아도 높은 생산성을 유지할 수 있도록 설계된 시스템을 제공합니다.

## 🎯 목표

- **암기 부담 없이** 퀄리티 높은 UI 개발
- **일관된 디자인 시스템** 유지
- **개발 속도 향상** 및 **유지보수성** 개선

## 🛠 제공하는 솔루션

### 1. CSS 컴포넌트 라이브러리 (`public/css/components.css`)

미리 정의된 컴포넌트 클래스들로 Tailwind의 `@apply` 지시어를 활용합니다.

```html
<!-- 기존 방식: 클래스명 외워야 함 -->
<button class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  버튼
</button>

<!-- 새로운 방식: 간단한 컴포넌트 클래스 -->
<button class="btn btn-primary">버튼</button>
```

#### 주요 컴포넌트들:

- **버튼**: `btn`, `btn-primary`, `btn-secondary`, `btn-danger` 등
- **폼**: `form-input`, `form-select`, `form-textarea`, `form-label` 등  
- **카드**: `card`, `card-header`, `card-body`, `card-footer`
- **네비게이션**: `nav-link`, `nav-link-active`, `nav-icon`
- **뱃지/알림**: `badge`, `badge-success`, `alert`, `alert-error`
- **테이블**: `table`, `table-header`, `table-cell`

### 2. Design Token 시스템

CSS 변수를 통한 일관된 디자인 토큰 시스템:

```css
:root {
  /* Colors */
  --color-primary-500: #3b82f6;
  --color-success-500: #22c55e;
  
  /* Spacing */
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Typography */
  --text-lg: 1.125rem;
  
  /* Shadows */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### 3. VS Code IntelliSense 설정

Handlebars 파일에서 Tailwind CSS 자동완성을 지원하는 설정:

```json
// .vscode/settings.json
{
  "tailwindCSS.includeLanguages": {
    "handlebars": "html",
    "hbs": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["class:\\\\s*['\"`]([^'\"`]*)['\"`]", "([^'\"`]*)"]
  ]
}
```

### 4. Handlebars 스타일링 헬퍼

템플릿에서 동적으로 스타일을 생성하는 헬퍼들:

```handlebars
<!-- 버튼 헬퍼 -->
<button class="{{btn 'primary' 'lg'}}">큰 버튼</button>
<button class="{{btn variant='danger' size='sm'}}">작은 위험 버튼</button>

<!-- 그리드 헬퍼 -->
<div class="{{grid cols=3 gap=4}}">
  <div>아이템 1</div>
  <div>아이템 2</div>  
  <div>아이템 3</div>
</div>

<!-- 플렉스 헬퍼 -->
<div class="{{flex justify='between' items='center'}}">
  <span>왼쪽</span>
  <span>오른쪽</span>
</div>

<!-- 간격 헬퍼 -->
<div class="{{spacing p=4 m=2}}">패딩과 마진이 적용된 요소</div>

<!-- 텍스트 헬퍼 -->
<h1 class="{{text size='2xl' weight='bold' color='primary-700'}}">제목</h1>
```

### 5. 유틸리티 클래스들

자주 사용하는 패턴들을 간단한 클래스로:

```html
<!-- 레이아웃 -->
<div class="center">완전 중앙 정렬</div>
<div class="v-center">세로 중앙 정렬</div>
<div class="stack">세로로 쌓인 요소들</div>
<div class="inline-stack">가로로 나열된 요소들</div>

<!-- 컬러 -->
<p class="text-primary">파란색 텍스트</p>
<p class="text-success">녹색 텍스트</p>
<div class="bg-danger">빨간색 배경</div>

<!-- 간격 -->
<div class="gap-md">중간 간격</div>
<div class="gap-lg">큰 간격</div>

<!-- 반응형 그리드 -->
<div class="grid-responsive">자동으로 반응형</div>
<div class="grid-auto">자동 크기 조절</div>

<!-- 애니메이션 -->
<div class="fade-in">페이드 인</div>
<div class="slide-up">슬라이드 업</div>
```

## 🚀 사용 방법

### 1. 기본 워크플로우

1. **컴포넌트 클래스 우선 사용**: `btn`, `card`, `form-input` 등
2. **Handlebars 헬퍼 활용**: 동적 스타일링이 필요한 경우
3. **유틸리티 클래스 조합**: 세부 조정이 필요한 경우
4. **필요시 Tailwind 클래스 직접 사용**: 특수한 경우

### 2. 예시: 대시보드 카드 만들기

```handlebars
<div class="{{card 'elevated'}}">
  <div class="card-header">
    <h3 class="{{text size='lg' weight='semibold'}}">매출 현황</h3>
    <span class="{{badge 'success'}}">+12%</span>
  </div>
  <div class="card-body">
    <div class="{{grid cols=2 gap=4}}">
      <div>
        <p class="{{text size='sm' color='gray-500'}}">이번 달</p>
        <p class="{{text size='2xl' weight='bold' color='primary-600'}}">₩1,234,567</p>
      </div>
      <div>
        <p class="{{text size='sm' color='gray-500'}}">지난 달</p>
        <p class="{{text size='xl' color='gray-700'}}">₩1,098,765</p>
      </div>
    </div>
  </div>
  <div class="card-footer">
    <button class="{{btn 'primary' 'sm'}}">자세히 보기</button>
  </div>
</div>
```

### 3. 예시: 폼 레이아웃

```handlebars
<form class="stack">
  <div class="{{grid cols=2 gap=6}}">
    <div>
      <label class="form-label">이름</label>
      <input type="text" class="{{formInput}}" placeholder="이름을 입력하세요">
    </div>
    <div>
      <label class="form-label">이메일</label>
      <input type="email" class="{{formInput}}" placeholder="email@example.com">
    </div>
  </div>
  
  <div>
    <label class="form-label">메시지</label>
    <textarea class="form-textarea" rows="4" placeholder="메시지를 입력하세요"></textarea>
  </div>
  
  <div class="{{flex justify='end' gap='md'}}">
    <button type="button" class="{{btn 'secondary'}}">취소</button>
    <button type="submit" class="{{btn 'primary'}}">전송</button>
  </div>
</form>
```

## 📚 스타일 가이드

스타일 가이드 페이지 (`/style-guide`)에서 모든 컴포넌트와 사용 예제를 확인할 수 있습니다.

## 🎨 커스터마이징

### 새로운 컴포넌트 추가

`public/css/components.css`에서 새로운 컴포넌트를 추가할 수 있습니다:

```css
.my-custom-component {
  @apply bg-white shadow-lg rounded-xl p-6 border border-gray-200;
}

.my-custom-component:hover {
  @apply shadow-xl transform -translate-y-1 transition-all duration-200;
}
```

### 새로운 Handlebars 헬퍼 추가

`src/common/handlebars/helpers/styling.helper.ts`에서 새로운 헬퍼를 추가할 수 있습니다:

```typescript
export function myHelper(variant: string = 'default', options?: HelperOptions): string {
  let classes = ['my-component'];
  
  switch (variant) {
    case 'special':
      classes.push('my-component-special');
      break;
    default:
      classes.push('my-component-default');
  }
  
  return classes.join(' ');
}
```

## ✅ 장점

1. **학습 곡선 완화**: Tailwind 클래스명을 외우지 않아도 됨
2. **일관성**: 디자인 시스템 기반의 일관된 스타일
3. **생산성**: 빠른 개발과 프로토타이핑
4. **유지보수성**: 중앙화된 스타일 관리
5. **확장성**: 필요시 Tailwind 클래스 직접 사용 가능
6. **IntelliSense**: VS Code에서 자동완성 지원

## 🔧 개발팀 가이드라인

1. **컴포넌트 클래스 우선 사용**하세요
2. **Handlebars 헬퍼**로 동적 스타일링하세요  
3. **스타일 가이드**를 참조하여 일관성을 유지하세요
4. **새로운 패턴이 반복**되면 컴포넌트로 추가하세요
5. **Design Token**을 활용하여 테마를 관리하세요

이 시스템을 통해 Tailwind CSS의 장점을 그대로 살리면서도 학습 부담을 줄이고 개발 생산성을 크게 향상시킬 수 있습니다.