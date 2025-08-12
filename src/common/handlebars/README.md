# Handlebars Helpers

이 디렉토리는 프로젝트에서 사용되는 Handlebars 헬퍼들을 관리합니다.

## 디렉토리 구조

```
handlebars/
├── helpers/
│   ├── formatters.helper.ts   # 포맷팅 관련 헬퍼
│   ├── conditionals.helper.ts # 조건문 관련 헬퍼
│   ├── utilities.helper.ts    # 유틸리티 헬퍼
│   ├── turbo.helper.ts        # Turbo 관련 헬퍼
│   └── index.ts               # 헬퍼 export
├── types/
│   └── handlebars.types.ts   # 타입 정의
├── handlebars.service.ts     # 헬퍼 등록 서비스
└── handlebars.module.ts      # NestJS 모듈
```

## 사용 가능한 헬퍼

### Formatters (포맷팅)

- `dateFormat` - 날짜 포맷팅
- `numberFormat` - 숫자 포맷팅 (통화, 퍼센트 등)
- `truncate` - 문자열 자르기
- `json` - JSON 문자열화
- `uppercase` - 대문자 변환
- `lowercase` - 소문자 변환
- `capitalize` - 첫 글자 대문자
- `urlEncode` - URL 인코딩
- `htmlEscape` - HTML 이스케이프
- `length` - 배열 길이

### Conditionals (조건문)

- `eq` - 동등 비교 (===)
- `ne` - 부등 비교 (!==)
- `gt` - 초과 (>)
- `gte` - 이상 (>=)
- `lt` - 미만 (<)
- `lte` - 이하 (<=)
- `and` - AND 논리 연산
- `or` - OR 논리 연산
- `not` - NOT 논리 연산
- `includes` - 배열 포함 여부
- `isEmpty` - 빈 값 체크
- `isNotEmpty` - 빈 값이 아닌지 체크
- `typeof` - 타입 체크
- `isArray` - 배열 체크
- `isObject` - 객체 체크
- `isNumber` - 숫자 체크
- `isString` - 문자열 체크
- `isBoolean` - Boolean 체크
- `switch/case/default` - Switch 문

### Utilities (유틸리티)

- `range` - 범위 생성
- `toArray` - 객체를 배열로 변환
- `sort` - 배열 정렬
- `filter` - 배열 필터링
- `slice` - 배열 슬라이스
- `first` - 첫 번째 요소
- `last` - 마지막 요소
- `withIndex` - 인덱스 + 1
- `selected` - select 옵션 선택
- `checked` - checkbox/radio 체크
- `disabled` - 비활성화 상태
- `className` - 조건부 클래스
- `classNames` - 다중 클래스 결합
- `activePage` - 현재 페이지 체크
- `queryString` - 쿼리 스트링 생성
- `defaultValue` - 기본값 설정
- `repeat` - n번 반복
- `merge` - 객체 병합
- `pick` - 특정 키 선택
- `omit` - 특정 키 제외

### Turbo (Turbo/Hotwire)

- `turboFrame` - Turbo Frame 속성
- `turboTarget` - Turbo Frame 타겟
- `turboAction` - Turbo 액션
- `turboStreamSrc` - Turbo Stream 소스
- `turboDisable` - Turbo 비활성화
- `turboPermanent` - 영구 요소
- `turboPrefetch` - 프리페치
- `turboPreload` - 프리로드
- `turboConfirm` - 확인 다이얼로그
- `turboMethod` - HTTP 메서드
- `turboCacheControl` - 캐시 제어
- `turboStream` - Turbo Stream 래퍼
- `turboFrameTag` - Turbo Frame 태그
- `turboLoading` - 로딩 상태
- `turboNavigationClass` - 네비게이션 클래스

## 사용 예제

### 날짜 포맷팅
```handlebars
{{dateFormat createdAt "YYYY-MM-DD"}}
{{dateFormat updatedAt "relative"}}
```

### 조건문
```handlebars
{{#if (eq status "active")}}
  <span class="badge badge-success">활성</span>
{{else if (eq status "inactive")}}
  <span class="badge badge-secondary">비활성</span>
{{/if}}

{{#if (and isLoggedIn (or isAdmin isModerator))}}
  <button>관리자 메뉴</button>
{{/if}}
```

### 배열 처리
```handlebars
{{#each (sort items "price" "desc")}}
  <div>{{name}} - {{numberFormat price "currency"}}</div>
{{/each}}

{{#each (filter users "role" "admin")}}
  <li>{{name}}</li>
{{/each}}
```

### Turbo 사용
```handlebars
<turbo-frame {{turboFrame "user-list" "lazy"}}>
  <!-- 콘텐츠 -->
</turbo-frame>

<a href="/users/1" {{turboTarget "user-details"}}>상세보기</a>

{{#turboStream "append" "messages"}}
  <div id="message_{{id}}">{{content}}</div>
{{/turboStream}}
```

## 커스텀 헬퍼 추가

### 1. 새 헬퍼 파일 생성

`src/common/handlebars/helpers/custom.helper.ts`:

```typescript
export function myCustomHelper(value: any): string {
  // 헬퍼 로직
  return processedValue;
}
```

### 2. index.ts에 export 추가

```typescript
// src/common/handlebars/helpers/index.ts
import { myCustomHelper } from './custom.helper';

export const allHelpers = {
  // ... 기존 헬퍼
  myCustomHelper,
};
```

### 3. 사용

```handlebars
{{myCustomHelper someValue}}
```

## 런타임 헬퍼 등록

컨트롤러나 서비스에서 동적으로 헬퍼를 추가할 수 있습니다:

```typescript
@Injectable()
export class MyService {
  constructor(private handlebarsService: HandlebarsService) {}

  registerCustomHelpers() {
    this.handlebarsService.registerCustomHelper('myHelper', (value) => {
      return value.toUpperCase();
    });
  }
}
```

## 주의사항

1. 헬퍼 이름은 camelCase를 사용합니다
2. 헬퍼는 순수 함수로 작성해야 합니다 (부작용 없음)
3. 마지막 인자는 항상 HelperOptions 객체입니다
4. HTML을 반환하는 경우 SafeString을 사용하여 이스케이프 방지
5. 성능을 위해 복잡한 연산은 피하고 캐싱을 고려하세요