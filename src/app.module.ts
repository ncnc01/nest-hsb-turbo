import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

import { AuthModule } from "./modules/auth/auth.module";
import { InquiryModule } from "./modules/inquiry/inquiry.module";
import { StackComparisonModule } from "./modules/stack-comparison/stack-comparison.module";
import { HandlebarsModule } from "./common/handlebars/handlebars.module";
import { DevReloadModule } from "./modules/dev-reload/dev-reload.module";
import { DevToolsModule } from './dev-tools/dev-tools.module';
import { User } from './database/entities/user.entity';
import { Inquiry } from './database/entities/inquiry.entity';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      serveRoot: "/public/",
    }),
    HandlebarsModule,
    ...(process.env.NODE_ENV !== 'production' ? [DevReloadModule] : []),
    AuthModule,
    DashboardModule,
    InquiryModule,
    StackComparisonModule,
    DevToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
