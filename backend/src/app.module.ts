import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAuthModule } from './firebase/firebase-admin.module';
import { AuthModule } from './auth/auth.module';
import { FamilyModule } from './family/family.module';

@Module({
  imports: [
    FirebaseAuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://habito:otibah@localhost:27017/habito?authSource=admin'),
    AuthModule,
    FamilyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
