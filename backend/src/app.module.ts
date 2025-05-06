import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthModule } from './firebase/firebase-admin.module';

@Module({
  imports: [FirebaseAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
