import { Injectable } from '@nestjs/common';

@Injectable()
export class StackComparisonService {
  
  getComparisonData() {
    const stacks = this.getStacks();
    const comparisonMatrix = this.getComparisonMatrix();
    
    // 스택별로 스코어와 총점을 미리 계산
    const stacksWithScores = stacks.map(stack => {
      const scores = comparisonMatrix.scores[stack.id] || [];
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      return {
        ...stack,
        scores,
        totalScore
      };
    });
    
    return {
      stacks: stacksWithScores,
      comparisonMatrix,
      useCases: this.getUseCases(),
      performanceMetrics: this.getPerformanceMetrics(),
      learningCurve: this.getLearningCurve(),
      ecosystemComparison: this.getEcosystemComparison()
    };
  }

  private getStacks() {
    return [
      {
        id: 'nestjs-hbs',
        name: 'NestJS + Handlebars',
        type: 'Node.js SSR',
        description: 'TypeScript 기반 엔터프라이즈급 서버사이드 렌더링',
        logo: '🟢',
        color: 'green',
        currentProject: true
      },
      {
        id: 'ruby-rails',
        name: 'Ruby on Rails',
        type: 'Ruby SSR',
        description: '컨벤션 기반 풀스택 웹 프레임워크',
        logo: '💎',
        color: 'red'
      },
      {
        id: 'php-ci',
        name: 'PHP CodeIgniter',
        type: 'PHP SSR',
        description: '경량화된 PHP MVC 프레임워크',
        logo: '🐘',
        color: 'blue'
      },
      {
        id: 'wordpress',
        name: 'WordPress',
        type: 'PHP CMS',
        description: 'CMS 기반 웹사이트 구축 플랫폼',
        logo: '📝',
        color: 'blue'
      },
      {
        id: 'spring-jsp',
        name: 'Spring + JSP',
        type: 'Java SSR',
        description: '엔터프라이즈 Java 웹 애플리케이션',
        logo: '☕',
        color: 'orange'
      },
      {
        id: 'react-spa',
        name: 'Pure React SPA',
        type: 'JavaScript SPA',
        description: '클라이언트 사이드 렌더링 싱글 페이지 앱',
        logo: '⚛️',
        color: 'cyan'
      },
      {
        id: 'nextjs-nest',
        name: 'Next.js + NestJS',
        type: 'Hybrid SSR/SPA',
        description: 'React SSR/SSG + API 서버 분리',
        logo: '🔺',
        color: 'gray'
      }
    ];
  }

  private getComparisonMatrix() {
    return {
      categories: [
        '개발 속도',
        'SEO 친화성',
        '성능',
        '확장성',
        '유지보수성',
        '학습 곡선',
        '생태계',
        '팀 협업',
        '배포 복잡도',
        '비용 효율성'
      ],
      scores: {
        'nestjs-hbs': [8, 9, 8, 9, 9, 7, 8, 9, 7, 8],
        'ruby-rails': [9, 9, 7, 8, 8, 6, 9, 8, 6, 7],
        'php-ci': [8, 9, 7, 6, 7, 8, 7, 7, 8, 9],
        'wordpress': [10, 8, 6, 5, 5, 9, 10, 6, 9, 8],
        'spring-jsp': [6, 9, 9, 10, 9, 5, 8, 9, 6, 6],
        'react-spa': [7, 4, 9, 8, 7, 7, 9, 8, 8, 7],
        'nextjs-nest': [7, 9, 9, 9, 8, 6, 8, 8, 6, 6]
      }
    };
  }

  private getUseCases() {
    return [
      {
        scenario: '기업용 관리 시스템',
        recommended: ['nestjs-hbs', 'spring-jsp', 'nextjs-nest'],
        reasons: '복잡한 비즈니스 로직, 높은 보안성, 확장성 요구'
      },
      {
        scenario: '콘텐츠 관리 웹사이트',
        recommended: ['wordpress', 'ruby-rails', 'nestjs-hbs'],
        reasons: 'SEO 최적화, 빠른 개발, 관리 편의성'
      },
      {
        scenario: '전자상거래 플랫폼',
        recommended: ['nextjs-nest', 'ruby-rails', 'nestjs-hbs'],
        reasons: '사용자 경험, SEO, 결제 보안, 확장성'
      },
      {
        scenario: '소규모 비즈니스 웹사이트',
        recommended: ['wordpress', 'php-ci', 'nestjs-hbs'],
        reasons: '저비용, 빠른 구축, 간단한 유지보수'
      },
      {
        scenario: '대화형 웹 애플리케이션',
        recommended: ['react-spa', 'nextjs-nest', 'nestjs-hbs'],
        reasons: '반응성, 사용자 인터랙션, 실시간 업데이트'
      },
      {
        scenario: '스타트업 MVP',
        recommended: ['ruby-rails', 'nestjs-hbs', 'nextjs-nest'],
        reasons: '빠른 프로토타이핑, 유연성, 확장 가능성'
      }
    ];
  }

  private getPerformanceMetrics() {
    return {
      loadTime: {
        'nestjs-hbs': 1.2,
        'ruby-rails': 1.8,
        'php-ci': 1.1,
        'wordpress': 2.5,
        'spring-jsp': 1.5,
        'react-spa': 2.8,
        'nextjs-nest': 1.0
      },
      throughput: {
        'nestjs-hbs': 8500,
        'ruby-rails': 3200,
        'php-ci': 7800,
        'wordpress': 2100,
        'spring-jsp': 12000,
        'react-spa': 15000,
        'nextjs-nest': 9200
      },
      memoryUsage: {
        'nestjs-hbs': 150,
        'ruby-rails': 280,
        'php-ci': 45,
        'wordpress': 120,
        'spring-jsp': 320,
        'react-spa': 80,
        'nextjs-nest': 200
      }
    };
  }

  private getLearningCurve() {
    return {
      'nestjs-hbs': {
        timeToBasic: 15,
        timeToAdvanced: 60,
        difficulty: '중급',
        prerequisites: 'TypeScript, Node.js, 웹 기초'
      },
      'ruby-rails': {
        timeToBasic: 10,
        timeToAdvanced: 45,
        difficulty: '초급-중급',
        prerequisites: 'Ruby 기초, 웹 기초'
      },
      'php-ci': {
        timeToBasic: 7,
        timeToAdvanced: 30,
        difficulty: '초급',
        prerequisites: 'PHP 기초, 웹 기초'
      },
      'wordpress': {
        timeToBasic: 3,
        timeToAdvanced: 20,
        difficulty: '초급',
        prerequisites: '웹 기초'
      },
      'spring-jsp': {
        timeToBasic: 25,
        timeToAdvanced: 90,
        difficulty: '고급',
        prerequisites: 'Java, Spring 프레임워크'
      },
      'react-spa': {
        timeToBasic: 12,
        timeToAdvanced: 50,
        difficulty: '중급',
        prerequisites: 'JavaScript, React'
      },
      'nextjs-nest': {
        timeToBasic: 20,
        timeToAdvanced: 70,
        difficulty: '중급-고급',
        prerequisites: 'React, Node.js, TypeScript'
      }
    };
  }

  private getEcosystemComparison() {
    return {
      packageCount: {
        'nestjs-hbs': 2100000,  // npm 패키지 수
        'ruby-rails': 170000,   // gem 패키지 수
        'php-ci': 320000,       // packagist 패키지 수
        'wordpress': 60000,     // 플러그인 수
        'spring-jsp': 400000,   // maven 패키지 수
        'react-spa': 2100000,   // npm 패키지 수
        'nextjs-nest': 2100000  // npm 패키지 수
      },
      communitySize: {
        'nestjs-hbs': 85,
        'ruby-rails': 78,
        'php-ci': 65,
        'wordpress': 95,
        'spring-jsp': 88,
        'react-spa': 98,
        'nextjs-nest': 90
      },
      jobMarket: {
        'nestjs-hbs': 85,
        'ruby-rails': 70,
        'php-ci': 60,
        'wordpress': 75,
        'spring-jsp': 90,
        'react-spa': 95,
        'nextjs-nest': 88
      }
    };
  }
}