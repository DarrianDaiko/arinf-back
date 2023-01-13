import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthDTO } from './auth/auth.dto';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly authService : AuthService) {}


  @Post('auth/login')
  async login(@Body() dto : AuthDTO) {
    return this.authService.login(dto);
  }
}
