import { Module, Global } from '@nestjs/common';
import { HandlebarsService } from './handlebars.service';

@Global()
@Module({
  providers: [HandlebarsService],
  exports: [HandlebarsService],
})
export class HandlebarsModule {}