import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginOtp } from './entities/login-otp.entity';
import { ReliabilityModule } from '../reliability/reliability.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-jwt-secret'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
    UserModule,
    TypeOrmModule.forFeature([LoginOtp]),
    ReliabilityModule,
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [JwtModule, RolesGuard, AuthService],
})
export class AuthModule {}
