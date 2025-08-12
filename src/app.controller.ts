import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('pages/auth/login')
  login() {
    return {
      title: 'Admin Login',
      layout: 'layouts/auth',
    };
  }

  @Get('/dashboard')
  @Render('pages/dashboard/index')
  dashboard(@Req() request: Request) {
    // Turbo Frame 요청인지 확인
    const isTurboFrame = request.headers['turbo-frame'];
    
    const data = {
      title: 'Dashboard',
      user: { name: 'Admin User' },
      isDevelopment: process.env.NODE_ENV === 'development',
    };

    if (isTurboFrame) {
      // Turbo Frame 요청시: 컨텐츠만 렌더링
      return {
        ...data,
        layout: false // 레이아웃 없이 콘텐츠만
      };
    } else {
      // 일반 요청시: 전체 페이지 렌더링
      return {
        ...data,
        layout: 'layouts/main'
      };
    }
  }

  @Get('/interactive-demo')
  @Render('pages/interactive-demo')
  interactiveDemo(@Req() request: Request) {
    const isTurboFrame = request.headers['turbo-frame'];
    
    const data = {
      title: 'Interactive Development Demo',
      isDevelopment: process.env.NODE_ENV === 'development',
    };

    if (isTurboFrame) {
      return {
        ...data,
        layout: false
      };
    } else {
      return {
        ...data,
        layout: 'layouts/main'
      };
    }
  }

  @Get('/style-guide')
  @Render('pages/style-guide')
  styleGuide(@Req() request: Request) {
    const isTurboFrame = request.headers['turbo-frame'];
    
    const data = {
      title: 'Style Guide',
      isDevelopment: process.env.NODE_ENV === 'development',
    };

    if (isTurboFrame) {
      return {
        ...data,
        layout: false
      };
    } else {
      return {
        ...data,
        layout: 'layouts/main'
      };
    }
  }

  @Get('/ui-demo')
  @Render('pages/ui-demo')
  uiDemo(@Req() request: Request) {
    const isTurboFrame = request.headers['turbo-frame'];
    
    const data = {
      title: 'UI System Demo',
      isDevelopment: process.env.NODE_ENV === 'development',
    };

    if (isTurboFrame) {
      return {
        ...data,
        layout: false
      };
    } else {
      return {
        ...data,
        layout: 'layouts/main'
      };
    }
  }
}