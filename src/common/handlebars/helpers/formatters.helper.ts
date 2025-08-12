import { HelperOptions } from 'handlebars';

/**
 * 날짜 포맷팅 헬퍼
 * @example {{dateFormat date "YYYY-MM-DD"}}
 */
export function dateFormat(date: Date | string, format?: string): string {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  // 기본 포맷: YYYY-MM-DD HH:mm:ss
  if (!format || format === 'default') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 간단한 포맷 지원
  const formats: Record<string, () => string> = {
    'YYYY-MM-DD': () => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    'MM/DD/YYYY': () => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    },
    'relative': () => {
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}일 전`;
      if (hours > 0) return `${hours}시간 전`;
      if (minutes > 0) return `${minutes}분 전`;
      return '방금 전';
    },
  };

  return formats[format] ? formats[format]() : d.toISOString();
}

/**
 * 숫자 포맷팅 헬퍼
 * @example {{numberFormat price}}
 * @example {{numberFormat price "currency"}}
 */
export function numberFormat(value: number | string, format?: string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
      }).format(num);
    
    case 'percent':
      return `${(num * 100).toFixed(2)}%`;
    
    case 'comma':
    default:
      return new Intl.NumberFormat('ko-KR').format(num);
  }
}

/**
 * 문자열 자르기 헬퍼
 * @example {{truncate description 100}}
 */
export function truncate(str: string, length: number = 100): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

/**
 * JSON 문자열화 헬퍼 (디버깅용)
 * @example {{json data}}
 */
export function json(context: any): string {
  return JSON.stringify(context, null, 2);
}

/**
 * 대문자 변환 헬퍼
 * @example {{uppercase title}}
 */
export function uppercase(str: string): string {
  return str ? str.toUpperCase() : '';
}

/**
 * 소문자 변환 헬퍼
 * @example {{lowercase title}}
 */
export function lowercase(str: string): string {
  return str ? str.toLowerCase() : '';
}

/**
 * 첫 글자 대문자 변환 헬퍼
 * @example {{capitalize name}}
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * URL 인코딩 헬퍼
 * @example {{urlEncode query}}
 */
export function urlEncode(str: string): string {
  return encodeURIComponent(str || '');
}

/**
 * HTML 이스케이프 헬퍼 (안전한 HTML 출력)
 * @example {{htmlEscape userInput}}
 */
export function htmlEscape(str: string): string {
  if (!str) return '';
  
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'\/]/g, (char) => escapeMap[char]);
}

/**
 * 배열 길이 반환 헬퍼
 * @example {{length items}}
 */
export function length(array: any[]): number {
  return Array.isArray(array) ? array.length : 0;
}