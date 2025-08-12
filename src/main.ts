import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as hbs from 'hbs';
import { HandlebarsService } from './common/handlebars/handlebars.service';
import { TemplateContextInterceptor } from './common/interceptors/template-context.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Store app instance globally for dev reload
  if (process.env.NODE_ENV !== 'production') {
    global['app'] = app;
  }

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Global template context interceptor
  app.useGlobalInterceptors(new TemplateContextInterceptor());

  // View engine setup
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Get HandlebarsService and use its Handlebars instance
  const handlebarsService = app.get(HandlebarsService);
  const handlebarsInstance = handlebarsService.getHandlebars();

  // Register Handlebars partials
  const fs = require('fs');
  const path = require('path');
  
  // Function to recursively register partials
  function registerPartials(dir: string, prefix: string = '') {
    console.log('Registering partials from:', dir);
    
    if (!fs.existsSync(dir)) {
      console.log('Directory does not exist:', dir);
      return;
    }
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        const newPrefix = prefix ? `${prefix}/${item}` : item;
        registerPartials(itemPath, newPrefix);
      } else if (item.endsWith('.hbs')) {
        // Register partial files
        const baseName = path.basename(item, '.hbs');
        const partialName = prefix ? `${prefix}/${baseName}` : baseName;
        const partialContent = fs.readFileSync(itemPath, 'utf8');
        
        // Register to both HandlebarsService and Express HBS
        handlebarsService.registerPartial(partialName, partialContent);
        hbs.registerPartial(partialName, partialContent);
        
        console.log(`Registered partial: ${partialName}`);
      }
    });
  }
  
  // Register partials from views/partials
  const partialsDir = join(__dirname, '..', 'views', 'partials');
  registerPartials(partialsDir);
  
  // Register partials from views/components
  const componentsDir = join(__dirname, '..', 'views', 'components');
  registerPartials(componentsDir);

  // Sync helpers from HandlebarsService to Express HBS
  // This ensures Express HBS uses the same helpers
  const helperNames = handlebarsService.getHelperNames();
  helperNames.forEach(name => {
    hbs.registerHelper(name, handlebarsInstance.helpers[name]);
  });
  
  console.log(`Registered ${helperNames.length} helpers to Express HBS`);

  // Middleware
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // CORS for Turbo
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();