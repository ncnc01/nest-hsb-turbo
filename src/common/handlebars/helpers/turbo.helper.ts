import { HelperOptions } from 'handlebars';

/**
 * Turbo Frame 태그 생성 헬퍼
 * @example {{turboFrame "user-profile" "lazy"}}
 */
export function turboFrame(id: string, loading?: 'eager' | 'lazy'): string {
  const loadingAttr = loading ? ` loading="${loading}"` : '';
  return `id="${id}" data-turbo-frame="${id}"${loadingAttr}`;
}

/**
 * Turbo Frame 타겟 설정 헬퍼
 * @example <a href="/users/1" {{turboTarget "user-details"}}>View User</a>
 */
export function turboTarget(frameId: string): string {
  return `data-turbo-frame="${frameId}"`;
}

/**
 * Turbo 액션 설정 헬퍼
 * @example <form {{turboAction "replace"}}>
 */
export function turboAction(action: 'advance' | 'replace' | 'restore'): string {
  return `data-turbo-action="${action}"`;
}

/**
 * Turbo Stream 소스 설정 헬퍼
 * @example <turbo-stream-source {{turboStreamSrc "/streams/notifications"}}>
 */
export function turboStreamSrc(url: string): string {
  return `src="${url}"`;
}

/**
 * Turbo 비활성화 헬퍼
 * @example <a href="/download" {{turboDisable}}>Download</a>
 */
export function turboDisable(): string {
  return 'data-turbo="false"';
}

/**
 * Turbo 영구 요소 설정 헬퍼
 * @example <div {{turboPermanent "sidebar"}}>
 */
export function turboPermanent(id: string): string {
  return `data-turbo-permanent id="${id}"`;
}

/**
 * Turbo 프리페치 설정 헬퍼
 * @example <a href="/page" {{turboPrefetch}}>Link</a>
 */
export function turboPrefetch(): string {
  return 'data-turbo-prefetch="true"';
}

/**
 * Turbo 프리로드 설정 헬퍼
 * @example <a href="/page" {{turboPreload}}>Link</a>
 */
export function turboPreload(): string {
  return 'data-turbo-preload="true"';
}

/**
 * Turbo 확인 다이얼로그 설정 헬퍼
 * @example <form {{turboConfirm "정말 삭제하시겠습니까?"}}>
 */
export function turboConfirm(message: string): string {
  return `data-turbo-confirm="${message}"`;
}

/**
 * Turbo 메서드 설정 헬퍼 (링크에 HTTP 메서드 지정)
 * @example <a href="/logout" {{turboMethod "delete"}}>Logout</a>
 */
export function turboMethod(method: string): string {
  return `data-turbo-method="${method}"`;
}

/**
 * Turbo 캐시 제어 헬퍼
 * @example <meta name="turbo-cache-control" {{turboCacheControl "no-cache"}}>
 */
export function turboCacheControl(directive: 'no-cache' | 'no-preview'): string {
  return `content="${directive}"`;
}

/**
 * Turbo Stream 액션 래퍼 헬퍼
 * @example 
 * {{#turboStream "append" "messages"}}
 *   <div id="message_1">New message</div>
 * {{/turboStream}}
 */
export function turboStream(
  action: 'append' | 'prepend' | 'replace' | 'update' | 'remove' | 'before' | 'after',
  target: string,
  options: HelperOptions
): string {
  const content = options.fn(this);
  return `
    <turbo-stream action="${action}" target="${target}">
      <template>${content}</template>
    </turbo-stream>
  `;
}

/**
 * Turbo Frame 래퍼 헬퍼
 * @example
 * {{#turboFrameTag "user-profile"}}
 *   <h1>User Profile</h1>
 * {{/turboFrameTag}}
 */
export function turboFrameTag(id: string, options: HelperOptions): string {
  const content = options.fn(this);
  const attrs = options.hash;
  
  let attributes = `id="${id}"`;
  
  // 추가 속성 처리
  if (attrs.loading) {
    attributes += ` loading="${attrs.loading}"`;
  }
  if (attrs.src) {
    attributes += ` src="${attrs.src}"`;
  }
  if (attrs.disabled) {
    attributes += ` disabled`;
  }
  if (attrs.target) {
    attributes += ` target="${attrs.target}"`;
  }
  
  return `<turbo-frame ${attributes}>${content}</turbo-frame>`;
}

/**
 * Turbo 로딩 상태 표시 헬퍼
 * @example
 * {{#turboLoading}}
 *   <div class="spinner">Loading...</div>
 * {{/turboLoading}}
 */
export function turboLoading(options: HelperOptions): string {
  const content = options.fn(this);
  return `
    <template id="turbo-loading">
      ${content}
    </template>
    <div class="turbo-progress-bar" aria-hidden="true"></div>
  `;
}

/**
 * Turbo 네비게이션 상태 클래스 헬퍼
 * @example <body class="{{turboNavigationClass}}">
 */
export function turboNavigationClass(): string {
  return 'turbo-loading:opacity-50 turbo-loading:pointer-events-none';
}