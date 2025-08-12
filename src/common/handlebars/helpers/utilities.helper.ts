import { HelperOptions } from 'handlebars';

/**
 * 범위 생성 헬퍼 (페이지네이션 등에 유용)
 * @example {{#each (range 1 10)}}...{{/each}}
 */
export function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

/**
 * 객체를 배열로 변환하는 헬퍼
 * @example {{#each (toArray object)}}...{{/each}}
 */
export function toArray(obj: Record<string, any>): Array<{ key: string; value: any }> {
  if (!obj || typeof obj !== 'object') return [];
  
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value,
  }));
}

/**
 * 배열 정렬 헬퍼
 * @example {{#each (sort items "name")}}...{{/each}}
 * @example {{#each (sort items "price" "desc")}}...{{/each}}
 */
export function sort(array: any[], key?: string, order: 'asc' | 'desc' = 'asc'): any[] {
  if (!Array.isArray(array)) return [];
  
  const sorted = [...array];
  
  if (!key) {
    // 키가 없으면 원시 값으로 정렬
    sorted.sort((a, b) => {
      if (order === 'asc') {
        return a > b ? 1 : a < b ? -1 : 0;
      } else {
        return a < b ? 1 : a > b ? -1 : 0;
      }
    });
  } else {
    // 키가 있으면 객체 속성으로 정렬
    sorted.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }
  
  return sorted;
}

/**
 * 배열 필터링 헬퍼
 * @example {{#each (filter items "status" "active")}}...{{/each}}
 */
export function filter(array: any[], key: string, value: any): any[] {
  if (!Array.isArray(array)) return [];
  
  return array.filter(item => {
    if (typeof item === 'object' && item !== null) {
      return item[key] === value;
    }
    return false;
  });
}

/**
 * 배열 슬라이스 헬퍼
 * @example {{#each (slice items 0 5)}}...{{/each}}
 */
export function slice(array: any[], start: number, end?: number): any[] {
  if (!Array.isArray(array)) return [];
  return array.slice(start, end);
}

/**
 * 배열의 첫 번째 요소 반환
 * @example {{first items}}
 */
export function first(array: any[]): any {
  return Array.isArray(array) ? array[0] : undefined;
}

/**
 * 배열의 마지막 요소 반환
 * @example {{last items}}
 */
export function last(array: any[]): any {
  return Array.isArray(array) ? array[array.length - 1] : undefined;
}

/**
 * 인덱스 추가 헬퍼 (each 내에서 사용)
 * @example {{#each items}}{{withIndex @index}}{{/each}}
 */
export function withIndex(index: number): number {
  return index + 1;
}

/**
 * 선택된 옵션 체크 헬퍼 (select 태그용)
 * @example <option value="1" {{selected selectedValue "1"}}>Option 1</option>
 */
export function selected(current: any, value: any): string {
  return current === value ? 'selected' : '';
}

/**
 * 체크된 상태 헬퍼 (checkbox, radio용)
 * @example <input type="checkbox" {{checked isActive}}>
 */
export function checked(value: any): string {
  return value ? 'checked' : '';
}

/**
 * 비활성화 상태 헬퍼
 * @example <button {{disabled isDisabled}}>Submit</button>
 */
export function disabled(value: any): string {
  return value ? 'disabled' : '';
}

/**
 * CSS 클래스 조건부 추가 헬퍼
 * @example <div class="{{className 'active' isActive}}">
 */
export function className(className: string, condition: any): string {
  return condition ? className : '';
}

/**
 * 다중 CSS 클래스 결합 헬퍼
 * @example <div class="{{classNames 'btn' btnType (className 'active' isActive)}}">
 */
export function classNames(...args: any[]): string {
  // 마지막 인자는 HelperOptions이므로 제외
  const classes = args.slice(0, -1);
  return classes.filter(Boolean).join(' ');
}

/**
 * 현재 페이지 체크 헬퍼 (네비게이션용)
 * @example <a class="{{activePage currentPath '/home'}}">Home</a>
 */
export function activePage(currentPath: string, targetPath: string, activeClass: string = 'active'): string {
  return currentPath === targetPath ? activeClass : '';
}

/**
 * 쿼리 스트링 생성 헬퍼
 * @example <a href="/search?{{queryString filters}}">
 */
export function queryString(params: Record<string, any>): string {
  if (!params || typeof params !== 'object') return '';
  
  const query = Object.entries(params)
    .filter(([_, value]) => value != null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
    
  return query;
}

/**
 * 디폴트 값 설정 헬퍼
 * @example {{default value "N/A"}}
 */
export function defaultValue(value: any, defaultVal: any): any {
  return value != null && value !== '' ? value : defaultVal;
}

/**
 * 반복 헬퍼 (n번 반복)
 * @example {{#repeat 5}}...{{/repeat}}
 */
export function repeat(times: number, options: HelperOptions): string {
  let result = '';
  for (let i = 0; i < times; i++) {
    result += options.fn({ index: i, count: i + 1, first: i === 0, last: i === times - 1 });
  }
  return result;
}

/**
 * 객체 병합 헬퍼
 * @example {{#with (merge defaults userSettings)}}...{{/with}}
 */
export function merge(...args: any[]): Record<string, any> {
  // 마지막 인자는 HelperOptions이므로 제외
  const objects = args.slice(0, -1);
  return Object.assign({}, ...objects);
}

/**
 * 객체에서 특정 키 선택 헬퍼
 * @example {{#with (pick user "name" "email")}}...{{/with}}
 */
export function pick(obj: Record<string, any>, ...args: any[]): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  // 마지막 인자는 HelperOptions이므로 제외
  const keys = args.slice(0, -1);
  const result: Record<string, any> = {};
  
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  
  return result;
}

/**
 * 객체에서 특정 키 제외 헬퍼
 * @example {{#with (omit user "password" "token")}}...{{/with}}
 */
export function omit(obj: Record<string, any>, ...args: any[]): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {};
  
  // 마지막 인자는 HelperOptions이므로 제외
  const keys = args.slice(0, -1);
  const result = { ...obj };
  
  keys.forEach(key => {
    delete result[key];
  });
  
  return result;
}