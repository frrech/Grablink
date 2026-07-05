import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Share } from '../share/entities/share.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const environment = process.env.NODE_ENV || 'development';

  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'grablink',
    password: process.env.DATABASE_PASSWORD || 'grablink',
    database: process.env.DATABASE_NAME || 'grablink_db',
    entities: [Share],
    synchronize: environment === 'development',
    logging: environment === 'development' ? ['error', 'warn'] : false,
    migrations: ['dist/database/migrations/*.js'],
    migrationsTableName: 'typeorm_migrations',
  };

  return config;
};
