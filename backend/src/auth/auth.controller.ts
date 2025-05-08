import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RequestWithUser } from './types/request.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async authenticate(@Req() req: RequestWithUser) {
    const user = await this.authService.verifyAndCreateUser(req.user);
    return { user };
  }
} 