import { Controller, Get, Render } from '@nestjs/common';

@Controller('dev-tools')
export class DevToolsController {
  @Get()
  @Render('pages/dev-tools/index')
  getDevTools() {
    return {
      title: 'Developer Tools',
      subtitle: '개발자 도구 및 로깅 시스템',
    };
  }

  @Get('interaction-logger')
  @Render('pages/dev-tools/interaction-logger')
  getInteractionLogger() {
    return {
      title: 'Interaction Logger',
      subtitle: '브라우저 상호작용 종합 로깅 시스템',
      features: [
        {
          icon: '📜',
          name: '스크롤 로깅',
          description: '스크롤 위치, 방향, 백분율 추적',
          details: ['위치 변경 감지', '스크롤 방향 분석', '페이지 진행률 측정'],
        },
        {
          icon: '🖱️',
          name: '클릭 로깅',
          description: '클릭 이벤트와 요소 정보 수집',
          details: ['클릭 좌표 추적', '대상 요소 정보', '수정키 상태 기록'],
        },
        {
          icon: '🖐️',
          name: '드래그 로깅',
          description: '드래그 동작 감지 및 분석',
          details: ['시작/종료 위치', '이동 거리 계산', '드래그 시간 측정'],
        },
        {
          icon: '⌨️',
          name: '키보드 로깅',
          description: '키 입력 및 단축키 감지',
          details: ['키 입력 추적', '단축키 조합 인식', '입력 필드 정보'],
        },
        {
          icon: '📏',
          name: '리사이즈 로깅',
          description: '브라우저 크기 변경 모니터링',
          details: ['창 크기 추적', '화면 정보 수집', 'DPR 모니터링'],
        },
        {
          icon: '⚡',
          name: '성능 로깅',
          description: '페이지 성능 메트릭 수집',
          details: ['로딩 시간 측정', '메모리 사용량', 'Paint 타이밍'],
        },
        {
          icon: '🚀',
          name: 'Turbo 로깅',
          description: 'Turbo 네비게이션 이벤트 추적',
          details: ['페이지 전환 감지', '프레임 로딩', '캐시 이벤트'],
        },
      ],
      commands: [
        {
          name: 'exportInteractionLogs()',
          description: '수집된 로그를 JSON 파일로 내보내기',
          usage: '콘솔에서 실행하면 로그 파일이 다운로드됩니다',
        },
        {
          name: 'clearInteractionLogs()',
          description: '저장된 모든 로그 삭제',
          usage: 'localStorage에 저장된 로그를 완전히 제거합니다',
        },
        {
          name: 'showLoggerStatus()',
          description: '현재 로거 상태 확인',
          usage: '활성화된 기능과 저장된 로그 수를 표시합니다',
        },
        {
          name: 'window.interactionLogger',
          description: '로거 인스턴스 접근',
          usage: '로거 객체에 직접 접근하여 세부 설정 가능',
        },
      ],
      shortcuts: [
        {
          keys: 'Ctrl + Shift + L',
          action: '개발자 도구 모달 열기/닫기',
        },
        {
          keys: 'ESC',
          action: '모달 닫기',
        },
      ],
    };
  }
}