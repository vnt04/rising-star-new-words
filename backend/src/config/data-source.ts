import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm.config';

export default new DataSource({
  ...buildTypeOrmOptions({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    name: process.env.DB_NAME!,
  }),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
