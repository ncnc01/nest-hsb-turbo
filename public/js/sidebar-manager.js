/**
 * Sidebar Manager - Alpine.js 기반 사이드바 상태 관리
 */

if (typeof SidebarManager !== 'undefined') {
  console.log('sidebar-manager.js 이미 로드됨, 스킵');
} else {

// Alpine.js Store for Menu State Management
document.addEventListener('alpine:init', () => {
  Alpine.store('sidebarManager', {
    getMenuState(menuId, defaultState = true) {
      const menuStates = JSON.parse(localStorage.getItem('menuStates') || '{}');
      return menuStates[menuId] !== undefined ? menuStates[menuId] : defaultState;
    },
    saveMenuState(menuId, state) {
      const menuStates = JSON.parse(localStorage.getItem('menuStates') || '{}');
      menuStates[menuId] = state;
      localStorage.setItem('menuStates', JSON.stringify(menuStates));
    },
    clearMenuStates() {
      localStorage.removeItem('menuStates');
    }
  });
});

function sidebarManager() {
  return {
    sidebarOpen: false,
    isMobile: false,

    initSidebar() {
      // 화면 크기 감지
      this.updateScreenSize();
      window.addEventListener('resize', () => this.updateScreenSize());

      // 저장된 사이드바 상태 복원 (데스크탑만)
      if (!this.isMobile) {
        const savedState = localStorage.getItem('sidebarOpen');
        this.sidebarOpen = savedState === 'true';
      } else {
        this.sidebarOpen = false;
      }

      // 현재 페이지 감지 및 활성화
      this.highlightCurrentPage();

      // Body 클래스 초기 설정
      this.updateBodyClass();

      // Turbo navigation 이벤트 리스닝
      document.addEventListener('turbo:load', () => {
        this.highlightCurrentPage();
        this.updateBodyClass();
      });

      // 모바일 사이드바 토글 이벤트 리스닝
      window.addEventListener('toggle-mobile-sidebar', () => {
        console.log('모바일 사이드바 이벤트 수신');
        if (this.isMobile) {
          this.sidebarOpen = !this.sidebarOpen;
          console.log('사이드바 상태 변경:', this.sidebarOpen);
        }
      });
    },

    updateScreenSize() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 768; // md breakpoint

      // 데스크탑에서 모바일로 전환될 때만 사이드바 닫기
      if (!wasMobile && this.isMobile) {
        this.sidebarOpen = false;
      }

      // 화면 크기 변경 시 body 클래스 업데이트
      this.updateBodyClass();

      // console.log('화면 크기 업데이트:', {
      //   isMobile: this.isMobile,
      //   sidebarOpen: this.sidebarOpen,
      //   width: window.innerWidth
      // });
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;

      // 데스크탑에서만 상태 저장
      if (!this.isMobile) {
        localStorage.setItem('sidebarOpen', this.sidebarOpen.toString());
      }

      // Body 클래스 업데이트 (CSS 레이아웃용)
      this.updateBodyClass();
    },

    closeSidebar() {
      this.sidebarOpen = false;
      if (!this.isMobile) {
        localStorage.setItem('sidebarOpen', 'false');
      }
    },

    clearSidebarState() {
      localStorage.removeItem('sidebarOpen');
      Alpine.store('sidebarManager').clearMenuStates();
    },

    isCurrentPage(path, query = '') {
      const currentPath = window.location.pathname;
      const currentQuery = window.location.search;

      if (query) {
        return currentPath === path && currentQuery.includes(query);
      }

      return currentPath === path || currentPath.startsWith(path + '/');
    },

    highlightCurrentPage() {
      // 현재 페이지 링크 하이라이트
      const currentPath = window.location.pathname;
      const links = document.querySelectorAll('.sidebar-link');

      links.forEach(link => {
        link.classList.remove('current-page');
        const href = link.getAttribute('href');
        if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
          link.classList.add('current-page');
        }
      });
    },

    hasCurrentPageInSection(paths) {
      const currentPath = window.location.pathname;
      const currentQuery = window.location.search;

      return paths.some(path => {
        if (path.includes('?')) {
          const [pathPart, queryPart] = path.split('?');
          return currentPath === pathPart && currentQuery.includes(queryPart);
        }
        return currentPath === path || currentPath.startsWith(path + '/');
      });
    },

    updateBodyClass() {
      // 데스크탑에서 사이드바가 닫힌 경우에만 collapsed 클래스 추가
      const isCollapsed = !this.isMobile && !this.sidebarOpen;
      if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
    }
  };
}

// 전역 객체에 등록
window.SidebarManager = {
  sidebarManager: sidebarManager
};

} // SidebarManager 정의 체크 종료