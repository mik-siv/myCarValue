import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(email: string, password: string) {
    //see if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    //Hash user password
    // Generate a salt
    const salt = randomBytes(8).toString('hex'); // generating a random binary 8 bytes of info and turning it into a string
    //hash salt and a password together
    const hash = (await scrypt(password, salt, 32)) as Buffer; // encrypting the password + salt into a 32-symbol hash, marking it as buffer to help typescript
    //Join the hashed result and salt together
    const result = salt + '.' + hash.toString('hex'); // adding . and salt as string to the hash to store in DB
    //Create a new user
    const user = this.usersService.create(email, result);
    //return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
