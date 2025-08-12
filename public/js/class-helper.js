/**
 * 클래스 자동완성을 위한 헬퍼 유틸리티
 * 개발 중에 클래스 목록을 콘솔에서 확인할 수 있도록 지원
 */

// 이미 정의되어 있으면 스킵
if (typeof availableClasses !== 'undefined') {
  console.log('class-helper.js 이미 로드됨, 스킵');
} else {

// 사용 가능한 모든 클래스들을 정의
const availableClasses = {
  // 버튼 컴포넌트
  buttons: [
    'btn', 'btn-primary', 'btn-secondary', 'btn-success', 
    'btn-danger', 'btn-warning', 'btn-outline', 'btn-ghost',
    'btn-xs', 'btn-sm', 'btn-lg', 'btn-xl'
  ],
  
  // 폼 컴포넌트
  forms: [
    'form-input', 'form-input-error', 'form-select', 'form-textarea',
    'form-checkbox', 'form-radio', 'form-label', 'form-error', 'form-help'
  ],
  
  // 카드 컴포넌트
  cards: [
    'card', 'card-header', 'card-body', 'card-footer', 
    'card-compact', 'card-elevated'
  ],
  
  // 네비게이션
  navigation: [
    'nav-link', 'nav-link-active', 'nav-link-inactive',
    'nav-icon', 'nav-icon-active', 'nav-icon-inactive'
  ],
  
  // 뱃지
  badges: [
    'badge', 'badge-primary', 'badge-secondary', 'badge-success',
    'badge-danger', 'badge-warning', 'badge-info'
  ],
  
  // 알림
  alerts: [
    'alert', 'alert-success', 'alert-error', 'alert-warning', 'alert-info'
  ],
  
  // 테이블
  tables: [
    'table', 'table-header', 'table-header-cell', 'table-body',
    'table-row', 'table-cell', 'table-cell-secondary'
  ],
  
  // 레이아웃 유틸리티
  layout: [
    'center', 'v-center', 'h-center', 'stack', 'inline-stack',
    'grid-responsive', 'grid-auto'
  ],
  
  // 컬러 유틸리티
  colors: [
    'text-primary', 'text-secondary', 'text-success', 'text-danger',
    'text-warning', 'text-info', 'bg-primary', 'bg-secondary',
    'bg-success', 'bg-danger', 'bg-warning', 'bg-info'
  ],
  
  // 간격 유틸리티
  spacing: [
    'gap-xs', 'gap-sm', 'gap-md', 'gap-lg', 'gap-xl'
  ],
  
  // 애니메이션
  animations: [
    'fade-in', 'slide-up', 'scale-in', 'loading-state'
  ],
  
  // 상태
  states: [
    'disabled', 'loading'
  ],
  
  // 반응형
  responsive: [
    'mobile-only', 'desktop-only', 'mobile-menu-button'
  ],
  
  // 디자인 토큰
  designTokens: [
    'design-token-text', 'design-token-spacing', 'design-token-card'
  ]
};

// Handlebars 헬퍼 사용 예제
const handlebarsExamples = {
  btn: [
    "{{btn 'primary'}}",
    "{{btn 'secondary' 'sm'}}",
    "{{btn variant='danger' size='lg'}}"
  ],
  card: [
    "{{card}}",
    "{{card 'compact'}}",
    "{{card 'elevated'}}"
  ],
  grid: [
    "{{grid cols=2}}",
    "{{grid cols=3 gap=4}}",
    "{{grid cols=2 md=4 lg=6}}"
  ],
  flex: [
    "{{flex direction='col'}}",
    "{{flex justify='center' items='center'}}",
    "{{flex justify='between' gap=4}}"
  ],
  spacing: [
    "{{spacing p=4}}",
    "{{spacing m=2 p=6}}",
    "{{spacing px=4 py=2}}"
  ],
  text: [
    "{{text size='lg' weight='bold'}}",
    "{{text color='primary-600'}}",
    "{{text size='xl' weight='semibold' color='gray-800'}}"
  ]
};

// 개발자 도구용 헬퍼 함수들
window.ClassHelper = {
  // 모든 사용 가능한 클래스 출력
  showAllClasses() {
    console.group('🎨 Available CSS Classes');
    Object.entries(availableClasses).forEach(([category, classes]) => {
      console.group(`📁 ${category.toUpperCase()}`);
      classes.forEach(cls => console.log(`  • ${cls}`));
      console.groupEnd();
    });
    console.groupEnd();
  },
  
  // 특정 카테고리의 클래스 출력
  showCategory(category) {
    if (availableClasses[category]) {
      console.group(`🎨 ${category.toUpperCase()} Classes`);
      availableClasses[category].forEach(cls => console.log(`  • ${cls}`));
      console.groupEnd();
    } else {
      console.warn(`❌ Category "${category}" not found. Available categories:`, Object.keys(availableClasses));
    }
  },
  
  // 클래스 검색
  search(query) {
    const results = [];
    Object.entries(availableClasses).forEach(([category, classes]) => {
      const matches = classes.filter(cls => 
        cls.toLowerCase().includes(query.toLowerCase())
      );
      if (matches.length > 0) {
        results.push({ category, matches });
      }
    });
    
    if (results.length > 0) {
      console.group(`🔍 Search results for "${query}"`);
      results.forEach(({ category, matches }) => {
        console.group(`📁 ${category}`);
        matches.forEach(cls => console.log(`  • ${cls}`));
        console.groupEnd();
      });
      console.groupEnd();
    } else {
      console.warn(`❌ No classes found for "${query}"`);
    }
  },
  
  // Handlebars 헬퍼 예제 출력
  showHandlebarsExamples(helper = null) {
    if (helper && handlebarsExamples[helper]) {
      console.group(`🔧 ${helper} Helper Examples`);
      handlebarsExamples[helper].forEach(example => {
        console.log(`  • ${example}`);
      });
      console.groupEnd();
    } else if (!helper) {
      console.group('🔧 All Handlebars Helper Examples');
      Object.entries(handlebarsExamples).forEach(([helperName, examples]) => {
        console.group(`📝 ${helperName}`);
        examples.forEach(example => console.log(`  • ${example}`));
        console.groupEnd();
      });
      console.groupEnd();
    } else {
      console.warn(`❌ Helper "${helper}" not found. Available helpers:`, Object.keys(handlebarsExamples));
    }
  },
  
  // 모든 카테고리 목록
  getCategories() {
    return Object.keys(availableClasses);
  },
  
  // 도움말
  help() {
    console.group('📖 ClassHelper Usage Guide');
    console.log('🎨 ClassHelper.showAllClasses()           - Show all available classes');
    console.log('📁 ClassHelper.showCategory("buttons")    - Show specific category');
    console.log('🔍 ClassHelper.search("primary")          - Search for classes');
    console.log('🔧 ClassHelper.showHandlebarsExamples()   - Show helper examples');
    console.log('📝 ClassHelper.showHandlebarsExamples("btn") - Show specific helper');
    console.log('📋 ClassHelper.getCategories()            - List all categories');
    console.groupEnd();
  }
};

// 개발 환경에서만 도움말 표시
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🎨 ClassHelper loaded! Type ClassHelper.help() for usage guide.');
}

// 키보드 단축키로 빠른 접근 (개발 환경에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('keydown', (e) => {
    // Alt + Shift + H: 도움말
    if (e.altKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      ClassHelper.help();
      console.log('🎨 ClassHelper 도움말이 표시되었습니다!');
    }
    // Alt + Shift + C: 모든 클래스 출력
    if (e.altKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      ClassHelper.showAllClasses();
      console.log('🎨 모든 클래스 목록이 표시되었습니다!');
    }
    // Alt + Shift + S: 클래스 검색 모드
    if (e.altKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      const query = prompt('🔍 검색할 클래스 키워드를 입력하세요:');
      if (query) {
        ClassHelper.search(query);
      }
    }
  });
}

} // availableClasses 정의 체크 종료