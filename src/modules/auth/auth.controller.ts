import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Render, 
  Redirect, 
  UseGuards,
  Request,
  Response,
  Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @Render('pages/auth/login')
  loginPage() {
    return {
      title: 'Admin Login',
      layout: 'layouts/auth',
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Session() session, @Response() res) {
    const result = await this.authService.login(req.user);
    session.user = result.user;
    session.access_token = result.access_token;
    
    // Turbo redirect
    if (req.headers.accept?.includes('turbo-stream')) {
      res.set('Content-Type', 'text/vnd.turbo-stream.html');
      return res.send(`
        <turbo-stream action="replace" target="main">
          <template>
            <script>window.location.href = '/dashboard';</script>
          </template>
        </turbo-stream>
      `);
    }
    
    return res.redirect('/dashboard');
  }

  @Post('logout')
  async logout(@Session() session, @Response() res) {
    session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
    });
    
    if (res.req.headers.accept?.includes('turbo-stream')) {
      res.set('Content-Type', 'text/vnd.turbo-stream.html');
      return res.send(`
        <turbo-stream action="replace" target="main">
          <template>
            <script>window.location.href = '/auth/login';</script>
          </template>
        </turbo-stream>
      `);
    }
    
    return res.redirect('/auth/login');
  }
}