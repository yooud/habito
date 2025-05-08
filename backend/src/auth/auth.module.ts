import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../schemas/user.schema';
import { FirebaseAuthModule } from '../firebase/firebase-admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    FirebaseAuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {} 