import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NestJS Admin Panel with HBS + Turbo + Tailwind';
  }
}