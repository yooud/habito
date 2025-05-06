import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthService } from './firebase-auth.service';
import * as path from 'path';

@Global()
@Module({
  providers: [
    FirebaseAuthService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set');
        }
        const serviceAccountPath = path.resolve(
          process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        );

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
          });
        }

        return admin;
      },
    },
  ],
  exports: [FirebaseAuthService],
})
export class FirebaseAuthModule {}
