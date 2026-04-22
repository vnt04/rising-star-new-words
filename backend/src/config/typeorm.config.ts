import { DataSourceOptions } from 'typeorm';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export function buildTypeOrmOptions(db: DbConfig): DataSourceOptions {
  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.password,
    database: db.name,
    synchronize: true,
  };
}
