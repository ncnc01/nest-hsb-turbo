# NestJS + Handlebars + Turbo 프로젝트

## 프로젝트 개요
이 프로젝트는 전통적인 서버 사이드 렌더링(SSR)과 현대적인 SPA 경험을 결합한 풀스택 웹 애플리케이션입니다.
Turbo(Hotwire)를 통해 페이지 새로고침 없이 빠른 인터랙션을 제공합니다.

## 기술 스택

### Backend
- **Framework**: NestJS 10.x
- **Template Engine**: Handlebars (HBS)
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Session
- **Validation**: class-validator, class-transformer

### Frontend  
- **HTML Over-the-Wire**: Turbo (Drive, Frames, Streams)
- **Interactivity**: Alpine.js 3.x
- **Styling**: TailwindCSS 3.x
- **Template**: Handlebars with layouts and partials

### DevOps
- **Container**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest (Unit/Integration), Cypress/Playwright (E2E)

## 프로젝트 구조

```
nest-hbs-turbo/
├── src/
│   ├── modules/          # 기능별 모듈
│   │   ├── auth/        # 인증/인가
│   │   ├── users/       # 사용자 관리
│   │   └── [feature]/   # 기능별 모듈
│   ├── common/          # 공통 유틸리티
│   │   ├── guards/      # 가드
│   │   ├── interceptors/# 인터셉터
│   │   ├── filters/     # 예외 필터
│   │   └── decorators/  # 커스텀 데코레이터
│   ├── database/        # 데이터베이스
│   │   ├── entities/    # TypeORM 엔티티
│   │   ├── migrations/  # 마이그레이션
│   │   └── seeds/       # 시드 데이터
│   └── config/          # 설정 파일
├── views/               # Handlebars 템플릿
│   ├── layouts/         # 레이아웃
│   ├── partials/        # 재사용 컴포넌트
│   └── pages/           # 페이지 템플릿
├── public/              # 정적 파일
│   ├── css/            # 스타일시트
│   ├── js/             # JavaScript
│   └── images/         # 이미지
├── docs/                # 프로젝트 문서
│   ├── README.md       # 문서 가이드
│   └── *.md           # 각종 가이드 문서
├── logs/                # 로그 파일
│   └── server.log     # 서버 로그
├── test/                # 테스트
│   ├── unit/           # 단위 테스트
│   ├── integration/    # 통합 테스트
│   └── e2e/            # E2E 테스트
└── .claude/
    └── agents/         # Claude 에이전트 정의
```

## 시스템 아키텍처

### 데이터 흐름 아키텍처
```
Browser Request → Controller → DataModeService → Service Layer → Repository/Mock → Database/Mock Data
                    ↓
Template Rendering ← SSR Data ← Business Logic ← Data Layer ← Data Source
```

### Mock/Real 데이터 전환 시스템
**핵심 컴포넌트:**
- `DataModeService`: Mock/Real 모드 관리 (src/common/services/data-mode.service.ts)
- `DatabaseStatusService`: DB 연결 상태 확인 (src/common/services/database-status.service.ts)
- 각 모듈의 Service/ServiceMock: 실제 데이터 vs Mock 데이터 제공

**데이터 모드 전환 흐름:**
1. 사용자가 Mock/Real 토글 클릭
2. `/dev-tools/api/data-mode/preference` API 호출
3. `DataModeService.setUserPreference()` 실행
4. 모든 Controller에서 `getActiveService()` 메서드가 적절한 서비스 선택
5. SSR 시 `ControllerHelpers.getBaseTemplateData()`가 현재 모드 정보 전달

**의존성 주입 구조:**
- ServicesModule: 모든 공통 서비스 제공 (DataModeService, DatabaseStatusService 등)
- 각 기능 모듈: Real Service + Mock Service 모두 주입받아 런타임에 선택

### Turbo + Alpine.js 상호작용
**Turbo 역할:**
- 페이지 간 네비게이션 (Turbo Drive)
- 부분 업데이트 (Turbo Frames)
- 실시간 업데이트 (Turbo Streams)

**Alpine.js 역할:**
- 컴포넌트 상태 관리 (x-data)
- 조건부 렌더링 (x-show, x-if)
- 이벤트 처리 (@click, @submit)

**SSR 데이터 전달:**
- Controller → Template에서 `{{{json dataMode}}}` 형태로 전달
- Alpine.js에서 `x-data="component({{{json dataMode}}})"` 형태로 수신

### 디버깅 포인트
**문제 진단 체크리스트:**
1. DataModeService 상태: `curl /dev-tools/api/data-mode/status`
2. Controller 서비스 선택: Console에서 `🔍 DashboardController` 로그 확인
3. SSR 데이터 전달: 브라우저에서 페이지 소스의 `x-data` 속성 값 확인
4. Alpine.js 상태: 개발자 도구에서 `$el.__x.$data` 확인

## 코딩 규칙

### TypeScript/NestJS
- TypeScript strict mode 사용
- 의존성 주입 패턴 준수
- DTO를 통한 입력 검증 필수
- 커스텀 예외 사용
- 서비스 레이어에 비즈니스 로직 집중

### Handlebars Templates
- 레이아웃 사용으로 일관성 유지
- Partial로 컴포넌트 재사용
- 템플릿 내 로직 최소화
- XSS 방지를 위해 `{{}}` 사용 (not `{{{}}}`)

### Turbo 사용 패턴
- 모든 링크와 폼은 Turbo Drive 활용
- 부분 업데이트는 Turbo Frames 사용
- 실시간 업데이트는 Turbo Streams 사용
- data-turbo-frame 속성으로 업데이트 영역 지정
- 로딩 상태 표시 구현

### Alpine.js
- 간단한 인터랙션만 처리
- 복잡한 상태는 서버에서 관리
- x-data로 컴포넌트 스코프 지정
- x-show/x-if로 조건부 렌더링

## 주요 명령어

```bash
# 개발
npm run start:dev        # 개발 서버 (watch mode)
npm run build           # 프로덕션 빌드
npm run start:prod      # 프로덕션 실행

# 테스트
npm run test            # 단위 테스트
npm run test:watch      # 테스트 watch mode
npm run test:cov        # 커버리지 리포트
npm run test:e2e        # E2E 테스트

# 코드 품질
npm run lint            # ESLint 실행
npm run format          # Prettier 포맷팅

# 데이터베이스
npm run migration:generate  # 마이그레이션 생성
npm run migration:run       # 마이그레이션 실행
npm run migration:revert    # 마이그레이션 롤백
npm run seed                # 시드 데이터 실행
```

## 환경 변수

```env
# .env.example
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nest_hbs_turbo

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=session-secret-key

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API 엔드포인트 규칙

### RESTful 원칙
- GET /resources - 목록 조회
- GET /resources/:id - 단일 조회
- POST /resources - 생성
- PUT /resources/:id - 전체 수정
- PATCH /resources/:id - 부분 수정
- DELETE /resources/:id - 삭제

### Turbo 응답 형식
- Accept: text/vnd.turbo-stream.html - Turbo Stream 응답
- Accept: text/html - Turbo Frame 또는 전체 HTML
- Accept: application/json - JSON API 응답

## 테스트 전략

### 테스트 피라미드
1. **단위 테스트 (70%)**: 서비스, 유틸리티
2. **통합 테스트 (20%)**: API 엔드포인트, DB 연동
3. **E2E 테스트 (10%)**: 주요 사용자 시나리오

### 커버리지 목표
- 전체: 80% 이상
- 핵심 비즈니스 로직: 90% 이상

## 보안 체크리스트

- [ ] 모든 입력 검증 (DTO + class-validator)
- [ ] SQL Injection 방지 (파라미터화된 쿼리)
- [ ] XSS 방지 (템플릿 이스케이핑)
- [ ] CSRF 토큰 구현
- [ ] Rate Limiting 설정
- [ ] 민감한 데이터 암호화
- [ ] 환경 변수로 시크릿 관리

## 성능 최적화

### Backend
- 쿼리 최적화 (적절한 인덱스, JOIN)
- N+1 문제 방지
- 캐싱 전략 (Redis)
- 페이지네이션 구현

### Frontend
- Turbo 캐싱 활용
- 이미지 lazy loading
- CSS/JS 번들 최적화
- 스켈레톤 스크린

## 배포 체크리스트

- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 프로덕션 빌드 생성
- [ ] 테스트 전체 통과
- [ ] 헬스체크 엔드포인트 확인
- [ ] 로깅 및 모니터링 설정

## 간단한 디버깅 가이드

**기본 진단:** `curl -s http://localhost:3000/dev-tools/api/data-mode/status`

**로그 패턴:**
- Controller: `console.log('🔍 [Controller] Mode:', mode)`
- Service: `console.log('🎯 [Service] Using:', type)`

## Alpine.js + Handlebars 디버깅 가이드

### 문제 발생 시 체크 순서
1. **API 데이터 확인**: `curl -s http://localhost:PORT/api/endpoint`
2. **템플릿 렌더링**: 브라우저 소스 보기에서 실제 HTML 확인
3. **Alpine.js 로딩**: 콘솔에서 `window.Alpine` 존재 확인
4. **x-data 파싱**: 콘솔에서 Alpine Expression Error 확인
5. **상태 변화**: 개발자 도구에서 Alpine 컴포넌트 상태 확인

### 권장 패턴
```javascript
// ✅ 데이터 분리 패턴
<script>window.pageData = {{{json data}}};</script>
<div x-data="component()" x-cloak>

// ❌ 피해야 할 패턴  
<div x-data="component({{{json this}}})">
```

### 조건부 렌더링
```handlebars
<!-- ✅ 권장: CSS 클래스 바인딩 -->
<div :class="active ? 'block' : 'hidden'">

<!-- ❌ 문제 가능: x-show (Turbo 충돌) -->
<div x-show="active">
```

## 문제 해결

### 자주 발생하는 이슈
1. **Turbo Frame이 업데이트되지 않음**
   - Frame ID 매칭 확인
   - 응답 Content-Type 확인

2. **TypeORM 관계 로딩 문제**
   - relations 옵션 확인
   - lazy/eager loading 설정 검토

3. **Handlebars 파셜 찾지 못함**
   - 파셜 등록 확인
   - 경로 설정 검토

## Claude 작업 템플릿

### 문제 해결 요청 시 사용할 템플릿
```
**문제 설명:** [구체적인 문제 상황]

**요청사항:**
1. 아키텍처 관점에서 문제 분석
2. 관련 컴포넌트와 데이터 흐름 파악
3. 현재 상태 진단 (API 호출, 로그 확인)
4. 단계별 수정 계획 수립
5. 디버깅 로그 추가 후 수정 실행
6. 사이드 이펙트 검증
```

### Claude가 따라야 할 작업 순서
```
1. CLAUDE.md의 "시스템 아키텍처" 섹션 참조
2. "문제 해결 방법론" 4단계 순서대로 실행
3. 각 단계마다 결과 보고 후 다음 단계 진행
4. 코드 수정 전 반드시 디버깅 로그 추가
5. 한 번에 하나의 컴포넌트만 수정
```

### 디버깅 우선 접근법
**모든 작업 시작 전 실행할 진단 명령어:**
```bash
# 1. 기본 상태 확인
curl -s http://localhost:3000/dev-tools/api/data-mode/status

# 2. 특정 API 테스트 (Mock/Real 모드 각각)
curl -s -X POST -H "Content-Type: application/json" -d '{"mode":"mock"}' http://localhost:3000/dev-tools/api/data-mode/preference
curl -s http://localhost:3000/dashboard/api/stats

curl -s -X POST -H "Content-Type: application/json" -d '{"mode":"real"}' http://localhost:3000/dev-tools/api/data-mode/preference  
curl -s http://localhost:3000/dashboard/api/stats

# 3. 브라우저에서 확인
# - 개발자 도구 콘솔 로그
# - Network 탭에서 API 호출 확인
# - Elements 탭에서 x-data 속성 값 확인
```

## 팀 규칙

1. 모든 코드는 PR을 통해 머지
2. 최소 1명의 코드 리뷰 필수
3. 테스트 없는 기능 코드 금지
4. 커밋 메시지는 conventional commits 형식
5. 브랜치명: feature/*, bugfix/*, hotfix/*

## 참고 자료

- [NestJS 공식 문서](https://nestjs.com)
- [Turbo (Hotwire) 문서](https://turbo.hotwired.dev)
- [Alpine.js 문서](https://alpinejs.dev)
- [TypeORM 문서](https://typeorm.io)
- [Handlebars 문서](https://handlebarsjs.com)