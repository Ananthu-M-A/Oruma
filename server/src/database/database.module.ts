import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? fallback : parsed;
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: toNumber(configService.get<string>('DATABASE_PORT'), 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'oruma'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DATABASE_SYNC') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
