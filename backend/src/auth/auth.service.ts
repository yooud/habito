import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async verifyAndCreateUser(decodedToken: DecodedIdToken) {
    let user = await this.userModel.findOne({ uid: decodedToken.uid });

    if (!user) {
      user = await this.userModel.create({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: (decodedToken.name as string) || '',
        role: null,
        familyId: null,
      });
    }

    return user;
  }
}
