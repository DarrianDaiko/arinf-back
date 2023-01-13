import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  private bcrypt = require('bcrypt');

  async validateUser(email: string, pass: string): Promise<any> {
    if (!email || !pass)
      return null;

    const user = await this.userService.getByEmail(email);

    if (!user || !await this.bcrypt.compare(pass, user.password)) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {

    let result = await this.validateUser(user.email, user.password);
    if (!result)
      throw new HttpException(`Invalid credentials`, HttpStatus.BAD_REQUEST);

    let now = new Date(Date.now());

    const payload = { name: result.email, userId: result.id, account: result.role, emit: now.getDate() };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
