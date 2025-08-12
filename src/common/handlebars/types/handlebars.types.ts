import { HelperOptions } from 'handlebars';

/**
 * Handlebars 헬퍼 함수 타입
 */
export type HandlebarsHelper = (...args: any[]) => any;

/**
 * Handlebars 헬퍼 딕셔너리 타입
 */
export interface HandlebarsHelpers {
  [key: string]: HandlebarsHelper;
}

/**
 * Handlebars 파셜 딕셔너리 타입
 */
export interface HandlebarsPartials {
  [key: string]: string;
}

/**
 * Handlebars 설정 옵션
 */
export interface HandlebarsConfig {
  helpers?: HandlebarsHelpers;
  partials?: HandlebarsPartials;
  defaultLayout?: string;
  layoutsDir?: string;
  partialsDir?: string;
  extname?: string;
}

/**
 * 템플릿 렌더링 컨텍스트
 */
export interface TemplateContext {
  [key: string]: any;
  user?: any;
  session?: any;
  flash?: any;
  csrfToken?: string;
  currentPath?: string;
  turbo?: TurboContext;
}

/**
 * Turbo 관련 컨텍스트
 */
export interface TurboContext {
  frame?: string;
  stream?: boolean;
  action?: 'advance' | 'replace' | 'restore';
}

/**
 * 페이지네이션 컨텍스트
 */
export interface PaginationContext {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  pages: number[];
}

/**
 * 폼 필드 컨텍스트
 */
export interface FormFieldContext {
  name: string;
  value?: any;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  options?: Array<{
    value: any;
    label: string;
    selected?: boolean;
  }>;
}

/**
 * 알림 메시지 컨텍스트
 */
export interface NotificationContext {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  dismissible?: boolean;
  autoClose?: number;
}

/**
 * 네비게이션 아이템 컨텍스트
 */
export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: string;
  children?: NavigationItem[];
  turboFrame?: string;
  turboAction?: string;
}

/**
 * 테이블 컬럼 정의
 */
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: string;
}

/**
 * 모달 컨텍스트
 */
export interface ModalContext {
  id: string;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  backdrop?: boolean | 'static';
}

/**
 * 커스텀 헬퍼 등록 옵션
 */
export interface RegisterHelperOptions {
  name: string;
  helper: HandlebarsHelper;
  override?: boolean;
}

/**
 * 헬퍼 카테고리
 */
export enum HelperCategory {
  FORMATTERS = 'formatters',
  CONDITIONALS = 'conditionals',
  UTILITIES = 'utilities',
  TURBO = 'turbo',
  CUSTOM = 'custom',
}

/**
 * 헬퍼 메타데이터
 */
export interface HelperMetadata {
  name: string;
  category: HelperCategory;
  description?: string;
  example?: string;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
}