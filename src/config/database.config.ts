import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { Inquiry } from "../database/entities/inquiry.entity";
import { User } from "../database/entities/user.entity";

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get("NODE_ENV") === "production";
    const databaseUrl = this.configService.get("DATABASE_URL");
    const dbUser = this.configService.get("DB_USER");
    const dbPassword = this.configService.get("DB_PASSWORD");

    // DATABASE_URL이 없으면 SQLite 메모리 DB 사용 (더미데이터)
    if (!databaseUrl) {
      console.log("🔄 더미데이터로 실행합니다...");
      return {
        type: "sqlite",
        database: ":memory:",
        entities: [User, Inquiry],
        synchronize: true,
        logging: false,
      };
    }

    return {
      type: "postgres",
      url: databaseUrl,
      entities: [User, Inquiry],
      synchronize: !isProduction,
      logging: !isProduction,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      migrations: ["dist/database/migrations/*.js"],
      migrationsRun: isProduction,
      // 연결 재시도 설정
      retryAttempts: 3,
      retryDelay: 3000,
      // IPv6 문제 해결
      extra: {
        charset: "utf8mb4_unicode_ci",
      },
    };
  }
}
