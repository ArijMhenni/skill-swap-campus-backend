import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  url: configService.get<string>('DATABASE_URL'),
  type: 'mysql',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // force sync
  logging: true,
  charset: 'utf8mb4',
  timezone: '+00:00',
  extra: {
    connectionLimit: 10,
  },
});
