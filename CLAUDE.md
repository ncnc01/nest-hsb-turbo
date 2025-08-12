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