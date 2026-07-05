import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Share } from '../share/entities/share.entity';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'sqlite',
    database: ':memory:',
    entities: [Share],
    synchronize: true,
    logging: false,
  };
};
