import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  
  // Si DATABASE_URL existe, l'utiliser
  if (databaseUrl) {
    return {
      url: databaseUrl,
      type: 'mysql',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
      charset: 'utf8mb4',
      timezone: '+00:00',
    };
  }
  
  // Sinon utiliser les variables séparées
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', 'oumaima1'),
    database: configService.get<string>('DB_DATABASE', 'skillswap_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
    charset: 'utf8mb4',
    timezone: '+00:00',
  };
};
