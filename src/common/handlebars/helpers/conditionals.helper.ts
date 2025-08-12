import { HelperOptions } from 'handlebars';

/**
 * 동등 비교 헬퍼
 * @example {{#if (eq status "active")}}...{{/if}}
 */
export function eq(a: any, b: any): boolean {
  return a === b;
}

/**
 * 부등 비교 헬퍼
 * @example {{#if (ne status "inactive")}}...{{/if}}
 */
export function ne(a: any, b: any): boolean {
  return a !== b;
}

/**
 * 초과 비교 헬퍼
 * @example {{#if (gt count 10)}}...{{/if}}
 */
export function gt(a: number, b: number): boolean {
  return a > b;
}

/**
 * 이상 비교 헬퍼
 * @example {{#if (gte count 10)}}...{{/if}}
 */
export function gte(a: number, b: number): boolean {
  return a >= b;
}

/**
 * 미만 비교 헬퍼
 * @example {{#if (lt count 10)}}...{{/if}}
 */
export function lt(a: number, b: number): boolean {
  return a < b;
}

/**
 * 이하 비교 헬퍼
 * @example {{#if (lte count 10)}}...{{/if}}
 */
export function lte(a: number, b: number): boolean {
  return a <= b;
}

/**
 * AND 논리 연산 헬퍼
 * @example {{#if (and isActive isVerified)}}...{{/if}}
 */
export function and(...args: any[]): boolean {
  // 마지막 인자는 HelperOptions이므로 제외
  const values = args.slice(0, -1);
  return values.every(Boolean);
}

/**
 * OR 논리 연산 헬퍼
 * @example {{#if (or isAdmin isModerator)}}...{{/if}}
 */
export function or(...args: any[]): boolean {
  // 마지막 인자는 HelperOptions이므로 제외
  const values = args.slice(0, -1);
  return values.some(Boolean);
}

/**
 * NOT 논리 연산 헬퍼
 * @example {{#if (not isDisabled)}}...{{/if}}
 */
export function not(value: any): boolean {
  return !value;
}

/**
 * 배열 포함 여부 확인 헬퍼
 * @example {{#if (includes tags "javascript")}}...{{/if}}
 */
export function includes(array: any[], value: any): boolean {
  return Array.isArray(array) && array.includes(value);
}

/**
 * 빈 값 체크 헬퍼
 * @example {{#if (isEmpty items)}}...{{/if}}
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

/**
 * 빈 값이 아닌지 체크 헬퍼
 * @example {{#if (isNotEmpty items)}}...{{/if}}
 */
export function isNotEmpty(value: any): boolean {
  return !isEmpty(value);
}

/**
 * 타입 체크 헬퍼
 * @example {{#if (typeof value "string")}}...{{/if}}
 */
export function typeOf(value: any, type: string): boolean {
  return typeof value === type;
}

/**
 * 인스턴스 체크 헬퍼
 * @example {{#if (isArray items)}}...{{/if}}
 */
export function isArray(value: any): boolean {
  return Array.isArray(value);
}

/**
 * 객체 체크 헬퍼
 * @example {{#if (isObject data)}}...{{/if}}
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 숫자 체크 헬퍼
 * @example {{#if (isNumber value)}}...{{/if}}
 */
export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 문자열 체크 헬퍼
 * @example {{#if (isString value)}}...{{/if}}
 */
export function isString(value: any): boolean {
  return typeof value === 'string';
}

/**
 * Boolean 체크 헬퍼
 * @example {{#if (isBoolean value)}}...{{/if}}
 */
export function isBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

/**
 * Switch 문과 유사한 조건부 렌더링 헬퍼
 * @example
 * {{#switch status}}
 *   {{#case "active"}}활성{{/case}}
 *   {{#case "inactive"}}비활성{{/case}}
 *   {{#default}}알 수 없음{{/default}}
 * {{/switch}}
 */
export function switchHelper(this: any, value: any, options: HelperOptions): string {
  this.switch_value = value;
  this.switch_break = false;
  const html = options.fn(this);
  delete this.switch_value;
  delete this.switch_break;
  return html;
}

export function caseHelper(this: any, value: any, options: HelperOptions): string {
  if (value === this.switch_value && !this.switch_break) {
    this.switch_break = true;
    return options.fn(this);
  }
  return '';
}

export function defaultHelper(this: any, options: HelperOptions): string {
  if (!this.switch_break) {
    return options.fn(this);
  }
  return '';
}