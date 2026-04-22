import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DecksModule } from './decks/decks.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...buildTypeOrmOptions({
          host: config.get<string>('database.host')!,
          port: config.get<number>('database.port')!,
          user: config.get<string>('database.user')!,
          password: config.get<string>('database.password')!,
          name: config.get<string>('database.name')!,
        }),
        autoLoadEntities: true,
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
      }),
    }),
    AuthModule,
    UsersModule,
    DecksModule,
    CardsModule,
  ],
})
export class AppModule {}
