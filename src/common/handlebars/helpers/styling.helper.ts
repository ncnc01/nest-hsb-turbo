import { HelperOptions } from 'handlebars';

/**
 * 버튼 스타일링 헬퍼
 * @example {{btn "primary" "lg"}}
 * @example {{btn variant="danger" size="sm"}}
 */
export function btn(variant: string = 'primary', size: string = '', options?: HelperOptions): string {
  // 옵션에서 해시 파라미터 추출
  if (typeof size === 'object' && size && (size as any).hash) {
    const hash = (size as any).hash;
    variant = hash.variant || variant;
    size = hash.size || '';
  }
  
  let classes = ['btn'];
  
  // 버튼 변형
  switch (variant) {
    case 'primary':
      classes.push('btn-primary');
      break;
    case 'secondary':
      classes.push('btn-secondary');
      break;
    case 'success':
      classes.push('btn-success');
      break;
    case 'danger':
      classes.push('btn-danger');
      break;
    case 'warning':
      classes.push('btn-warning');
      break;
    case 'outline':
      classes.push('btn-outline');
      break;
    case 'ghost':
      classes.push('btn-ghost');
      break;
    default:
      classes.push('btn-primary');
  }
  
  // 버튼 크기
  if (size) {
    switch (size) {
      case 'xs':
        classes.push('btn-xs');
        break;
      case 'sm':
        classes.push('btn-sm');
        break;
      case 'lg':
        classes.push('btn-lg');
        break;
      case 'xl':
        classes.push('btn-xl');
        break;
    }
  }
  
  return classes.join(' ');
}

/**
 * 카드 스타일링 헬퍼
 * @example {{card "elevated"}}
 */
export function card(variant: string = ''): string {
  let classes = ['card'];
  
  switch (variant) {
    case 'compact':
      classes.push('card-compact');
      break;
    case 'elevated':
      classes.push('card-elevated');
      break;
  }
  
  return classes.join(' ');
}

/**
 * 뱃지 스타일링 헬퍼
 * @example {{badge "success"}}
 */
export function badge(variant: string = 'primary'): string {
  let classes = ['badge'];
  
  switch (variant) {
    case 'primary':
      classes.push('badge-primary');
      break;
    case 'secondary':
      classes.push('badge-secondary');
      break;
    case 'success':
      classes.push('badge-success');
      break;
    case 'danger':
      classes.push('badge-danger');
      break;
    case 'warning':
      classes.push('badge-warning');
      break;
    case 'info':
      classes.push('badge-info');
      break;
    default:
      classes.push('badge-primary');
  }
  
  return classes.join(' ');
}

/**
 * 알림 스타일링 헬퍼
 * @example {{alert "success"}}
 */
export function alert(variant: string = 'info'): string {
  let classes = ['alert'];
  
  switch (variant) {
    case 'success':
      classes.push('alert-success');
      break;
    case 'error':
    case 'danger':
      classes.push('alert-error');
      break;
    case 'warning':
      classes.push('alert-warning');
      break;
    case 'info':
      classes.push('alert-info');
      break;
    default:
      classes.push('alert-info');
  }
  
  return classes.join(' ');
}

/**
 * 폼 입력 스타일링 헬퍼
 * @example {{formInput error=true}}
 */
export function formInput(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes = ['form-input'];
  
  if (hash.error) {
    classes.push('form-input-error');
  }
  
  return classes.join(' ');
}

/**
 * 네비게이션 링크 헬퍼
 * @example {{navLink active=true}}
 */
export function navLink(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes = [];
  
  if (hash.active) {
    classes.push('nav-link-active');
  } else {
    classes.push('nav-link-inactive');
  }
  
  return classes.join(' ');
}

/**
 * 네비게이션 아이콘 헬퍼
 * @example {{navIcon active=true}}
 */
export function navIcon(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes = [];
  
  if (hash.active) {
    classes.push('nav-icon-active');
  } else {
    classes.push('nav-icon-inactive');
  }
  
  return classes.join(' ');
}

/**
 * 테이블 셀 스타일링 헬퍼
 * @example {{tableCell secondary=true}}
 */
export function tableCell(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes = [];
  
  if (hash.secondary) {
    classes.push('table-cell-secondary');
  } else {
    classes.push('table-cell');
  }
  
  return classes.join(' ');
}

/**
 * 그리드 시스템 헬퍼
 * @example {{grid cols=3 gap=4}}
 */
export function grid(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes = ['grid'];
  
  // 컬럼 설정
  if (hash.cols) {
    const colsMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12'
    };
    if (colsMap[hash.cols]) {
      classes.push(colsMap[hash.cols]);
    }
  }
  
  // 간격 설정
  if (hash.gap) {
    classes.push(`gap-${hash.gap}`);
  }
  
  // 반응형 설정
  if (hash.sm) {
    classes.push(`sm:grid-cols-${hash.sm}`);
  }
  if (hash.md) {
    classes.push(`md:grid-cols-${hash.md}`);
  }
  if (hash.lg) {
    classes.push(`lg:grid-cols-${hash.lg}`);
  }
  
  return classes.join(' ');
}

/**
 * 플렉스 컨테이너 헬퍼
 * @example {{flex direction="col" justify="center" items="center"}}
 */
export function flex(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes = ['flex'];
  
  // 방향
  if (hash.direction === 'col') {
    classes.push('flex-col');
  }
  
  // 정렬
  if (hash.justify) {
    classes.push(`justify-${hash.justify}`);
  }
  
  if (hash.items) {
    classes.push(`items-${hash.items}`);
  }
  
  // 간격
  if (hash.gap) {
    classes.push(`gap-${hash.gap}`);
  }
  
  return classes.join(' ');
}

/**
 * 스페이싱 헬퍼
 * @example {{spacing p=4 m=2}}
 */
export function spacing(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes: string[] = [];
  
  // Padding
  if (hash.p) classes.push(`p-${hash.p}`);
  if (hash.px) classes.push(`px-${hash.px}`);
  if (hash.py) classes.push(`py-${hash.py}`);
  if (hash.pt) classes.push(`pt-${hash.pt}`);
  if (hash.pb) classes.push(`pb-${hash.pb}`);
  if (hash.pl) classes.push(`pl-${hash.pl}`);
  if (hash.pr) classes.push(`pr-${hash.pr}`);
  
  // Margin
  if (hash.m) classes.push(`m-${hash.m}`);
  if (hash.mx) classes.push(`mx-${hash.mx}`);
  if (hash.my) classes.push(`my-${hash.my}`);
  if (hash.mt) classes.push(`mt-${hash.mt}`);
  if (hash.mb) classes.push(`mb-${hash.mb}`);
  if (hash.ml) classes.push(`ml-${hash.ml}`);
  if (hash.mr) classes.push(`mr-${hash.mr}`);
  
  return classes.join(' ');
}

/**
 * 텍스트 스타일링 헬퍼
 * @example {{text size="lg" weight="bold" color="gray-700"}}
 */
export function text(options: HelperOptions): string {
  const hash = options.hash || {};
  let classes: string[] = [];
  
  // 크기
  if (hash.size) classes.push(`text-${hash.size}`);
  
  // 굵기
  if (hash.weight) classes.push(`font-${hash.weight}`);
  
  // 색상
  if (hash.color) classes.push(`text-${hash.color}`);
  
  // 정렬
  if (hash.align) classes.push(`text-${hash.align}`);
  
  return classes.join(' ');
}