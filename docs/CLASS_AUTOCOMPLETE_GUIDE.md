# HBS 파일에서 클래스 자동완성 가이드

HBS 파일에서 CSS 클래스를 입력할 때 자동완성과 참조를 쉽게 할 수 있는 방법들을 제공합니다.

## 🚀 자동완성 시스템

### 1. VS Code IntelliSense 설정

`.vscode/settings.json`에서 Handlebars 파일의 Tailwind CSS 자동완성을 지원합니다:

```json
{
  "tailwindCSS.includeLanguages": {
    "handlebars": "html",
    "hbs": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    // 다양한 패턴의 클래스 속성 감지
    ["class=\\s*[\"']([^\"']*)[\"']", "([^\"']*)"],
    ["{{[^}]*class[^}]*[\"']([^\"']*)[\"'][^}]*}}", "([^\"']*)"]
  ]
}
```

### 2. 코드 스니펫

`.vscode/snippets/handlebars.json`에서 자주 사용하는 패턴들을 스니펫으로 제공:

#### 자주 사용하는 스니펫들:
- `btn-primary` → 기본 버튼 생성
- `card` → 카드 컴포넌트 생성
- `form-input` → 폼 입력 필드 생성
- `grid-layout` → 그리드 레이아웃 생성
- `flex-layout` → 플렉스 레이아웃 생성

#### 사용 방법:
1. HBS 파일에서 스니펫 프리픽스 입력 (예: `btn-primary`)
2. `Tab` 키 또는 `Enter` 키로 자동완성
3. `Tab`으로 플레이스홀더 간 이동

### 3. 브라우저 콘솔에서 클래스 확인

개발 환경에서 `ClassHelper`를 통해 사용 가능한 클래스들을 실시간으로 확인:

```javascript
// 모든 클래스 보기
ClassHelper.showAllClasses()

// 특정 카테고리 클래스 보기
ClassHelper.showCategory('buttons')
ClassHelper.showCategory('forms')
ClassHelper.showCategory('layout')

// 클래스 검색
ClassHelper.search('primary')
ClassHelper.search('btn')

// Handlebars 헬퍼 예제 보기
ClassHelper.showHandlebarsExamples()
ClassHelper.showHandlebarsExamples('btn')

// 도움말
ClassHelper.help()
```

#### 키보드 단축키:
- `Alt + Shift + H`: 도움말 표시
- `Alt + Shift + C`: 모든 클래스 목록 표시  
- `Alt + Shift + S`: 클래스 검색 팝업

## 📚 사용 가능한 클래스 카테고리

### 1. 버튼 (Buttons)
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-sm">Small Secondary</button>
<button class="{{btn 'danger' 'lg'}}">Large Danger</button>
```

**사용 가능한 클래스:**
- `btn`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`, `btn-warning`, `btn-outline`, `btn-ghost`
- `btn-xs`, `btn-sm`, `btn-lg`, `btn-xl`

### 2. 폼 (Forms)
```html
<input type="text" class="form-input" placeholder="텍스트 입력">
<input type="text" class="{{formInput error=true}}" placeholder="오류 상태">
<select class="form-select">...</select>
```

**사용 가능한 클래스:**
- `form-input`, `form-input-error`, `form-select`, `form-textarea`, `form-checkbox`, `form-radio`
- `form-label`, `form-error`, `form-help`

### 3. 카드 (Cards)
```html
<div class="card">
  <div class="card-header">...</div>
  <div class="card-body">...</div>
</div>
<div class="{{card 'elevated'}}">...</div>
```

**사용 가능한 클래스:**
- `card`, `card-header`, `card-body`, `card-footer`, `card-compact`, `card-elevated`

### 4. 레이아웃 (Layout)
```html
<div class="center">중앙 정렬</div>
<div class="stack">세로 스택</div>
<div class="{{grid cols=3 gap=4}}">그리드</div>
<div class="{{flex justify='between' items='center'}}">플렉스</div>
```

**사용 가능한 클래스:**
- `center`, `v-center`, `h-center`, `stack`, `inline-stack`
- `grid-responsive`, `grid-auto`

### 5. 컬러 (Colors)
```html
<p class="text-primary">파란색 텍스트</p>
<div class="bg-success">녹색 배경</div>
<span class="{{text color='danger'}}">빨간색 텍스트</span>
```

**사용 가능한 클래스:**
- `text-primary`, `text-secondary`, `text-success`, `text-danger`, `text-warning`, `text-info`
- `bg-primary`, `bg-secondary`, `bg-success`, `bg-danger`, `bg-warning`, `bg-info`

### 6. 뱃지 & 알림 (Badges & Alerts)
```html
<span class="badge badge-success">성공</span>
<div class="alert alert-warning">경고 메시지</div>
<span class="{{badge 'danger'}}">위험</span>
```

**사용 가능한 클래스:**
- `badge`, `badge-primary`, `badge-secondary`, `badge-success`, `badge-danger`, `badge-warning`, `badge-info`
- `alert`, `alert-success`, `alert-error`, `alert-warning`, `alert-info`

## 🔧 개발 워크플로우

### 1. 클래스 입력 시 권장 순서:

1. **VS Code 자동완성 활용**
   - HBS 파일에서 `class="`를 입력하면 자동완성 시작
   - Tailwind CSS 클래스와 커스텀 컴포넌트 클래스 모두 표시

2. **스니펫 활용**
   - 자주 사용하는 패턴은 스니펫으로 빠르게 생성
   - `btn-primary`, `card`, `form-input` 등

3. **브라우저 콘솔 참조**
   - 클래스명이 기억나지 않을 때 `ClassHelper.search('키워드')` 사용
   - 전체 목록이 필요할 때 `ClassHelper.showAllClasses()` 사용

4. **스타일 가이드 참조**
   - `/style-guide` 페이지에서 시각적으로 확인
   - 실제 렌더링 결과와 코드 예제 동시 확인

### 2. 예시 워크플로우:

```html
<!-- 1. 스니펫으로 기본 구조 생성 -->
<div class="card">  <!-- card 스니펫 사용 -->
  <div class="card-header">
    <!-- 2. 자동완성으로 클래스 추가 -->
    <h3 class="text-">  <!-- 자동완성에서 text-primary 선택 -->
  </div>
  <div class="card-body">
    <!-- 3. Handlebars 헬퍼 사용 -->
    <div class="{{grid cols=2 gap=4}}">
      <div>내용 1</div>
      <div>내용 2</div>
    </div>
  </div>
</div>
```

### 3. 클래스명 찾기 팁:

1. **기능별 검색**:
   ```javascript
   ClassHelper.search('btn')      // 버튼 관련
   ClassHelper.search('form')     // 폼 관련
   ClassHelper.search('primary')  // Primary 색상 관련
   ```

2. **카테고리별 확인**:
   ```javascript
   ClassHelper.showCategory('buttons')
   ClassHelper.showCategory('layout')
   ```

3. **Handlebars 헬퍼 확인**:
   ```javascript
   ClassHelper.showHandlebarsExamples('btn')
   ClassHelper.showHandlebarsExamples('grid')
   ```

## 📦 추가 도구

### 1. 권장 VS Code 확장 프로그램:
- **Tailwind CSS IntelliSense**: Tailwind 클래스 자동완성
- **HTML CSS Class Completion**: CSS 클래스 자동완성 강화
- **CSS Peek**: 클래스 정의로 빠르게 이동
- **Auto Rename Tag**: HTML 태그 자동 리네임

### 2. 클래스 목록 파일:
- `tailwind-classes.json`: 모든 사용 가능한 클래스를 JSON 형태로 정리
- IDE에서 참조용으로 활용 가능

## ⚡ 생산성 향상 팁

1. **자주 사용하는 패턴을 스니펫으로 만들기**
2. **ClassHelper 키보드 단축키 활용하기**
3. **스타일 가이드 페이지를 북마크에 추가**
4. **VS Code 설정에서 자동완성 딜레이 줄이기**
5. **팀원들과 공통 클래스 네이밍 규칙 공유**

이 시스템을 통해 클래스명을 외우지 않아도 빠르고 정확하게 스타일링을 할 수 있습니다! 🚀