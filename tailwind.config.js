/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.hbs",
    "./views/**/*.html",
    "./src/**/*.{ts,js}",
    "./public/**/*.{js,html}",
    "./public/css/components.css"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
  // CSS 클래스들을 safelist에 추가하여 purge되지 않도록 보장
  safelist: [
    // 버튼 클래스들
    'btn',
    'btn-primary',
    'btn-secondary', 
    'btn-success',
    'btn-danger',
    'btn-warning',
    'btn-outline',
    'btn-ghost',
    'btn-xs',
    'btn-sm',
    'btn-lg',
    'btn-xl',
    
    // 폼 클래스들
    'form-input',
    'form-input-error',
    'form-select',
    'form-textarea',
    'form-checkbox',
    'form-radio',
    'form-label',
    'form-error',
    'form-help',
    
    // 카드 클래스들
    'card',
    'card-header',
    'card-body',
    'card-footer',
    'card-compact',
    'card-elevated',
    
    // 네비게이션 클래스들
    'nav-link',
    'nav-link-active',
    'nav-link-inactive',
    'nav-icon',
    'nav-icon-active',
    'nav-icon-inactive',
    
    // 뱃지 클래스들
    'badge',
    'badge-primary',
    'badge-secondary',
    'badge-success',
    'badge-danger',
    'badge-warning',
    'badge-info',
    
    // 알림 클래스들
    'alert',
    'alert-success',
    'alert-error',
    'alert-warning',
    'alert-info',
    
    // 테이블 클래스들
    'table',
    'table-header',
    'table-header-cell',
    'table-body',
    'table-row',
    'table-cell',
    'table-cell-secondary',
    
    // 유틸리티 클래스들
    'center',
    'v-center',
    'h-center',
    'stack',
    'inline-stack',
    'grid-responsive',
    'grid-auto',
    'text-primary',
    'text-secondary',
    'text-success',
    'text-danger',
    'text-warning',
    'text-info',
    'bg-primary',
    'bg-secondary',
    'bg-success',
    'bg-danger',
    'bg-warning',
    'bg-info',
    'gap-xs',
    'gap-sm',
    'gap-md',
    'gap-lg',
    'gap-xl',
    'fade-in',
    'slide-up',
    'scale-in',
    'loading-state',
    'disabled',
    'loading',
    'mobile-only',
    'desktop-only',
    'mobile-menu-button',
    'design-token-text',
    'design-token-spacing',
    'design-token-card'
  ]
}