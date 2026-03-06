import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import supabaseConfig from './config/supabase.config';
import stellarConfig from './config/stellar.config';
import trustlessWorkConfig from './config/trustless-work.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { WalletsModule } from './modules/wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [
        appConfig,
        jwtConfig,
        supabaseConfig,
        stellarConfig,
        trustlessWorkConfig,
      ],
    }),
    DatabaseModule,
    WalletsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
