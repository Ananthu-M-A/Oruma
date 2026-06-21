import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConnectionOptions } from './database-options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...getDatabaseConnectionOptions((key) =>
          configService.get<string>(key),
        ),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DATABASE_SYNC') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
