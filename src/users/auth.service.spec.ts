import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    let users: User[] = [];
    fakeUsersService = {
      find: (email: string) =>
        Promise.resolve(users.filter((user) => user.email === email)),
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email: email,
          password: password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Assert password salted and hashed', async () => {
    const user = await service.signup('test@test.com', 'test');
    const [salt, hash] = user.password.split('.');
    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
  });

  it('Throws an error if user signs up with email in use', async () => {
    await service.signup('test@test.com', 'password');
    await expect(service.signup('test@test.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('Throws an error if user tries to sign in with invalid email', async () => {
    await expect(service.signin('test@test.com', 'password')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Throws an error if password is invalid', async () => {
    await service.signup('test@test.com', 'password');
    await expect(
      service.signin('test@test.com', 'wrongPassword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Sign in returns a user if correct password is provided', async () => {
    await service.signup('test@test.com', 'password');
    const user = await service.signin('test@test.com', 'password');
    expect(user).toBeDefined();
  });
});
