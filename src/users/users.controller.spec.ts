import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password: 'asd'} as User]);
      },
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'asd@asdf.com', password: 'asd'} as User);
      },
      // remove: () => {},
      // update: () => {}
    };

    fakeAuthService = {
      // signup: () => {},
      // signin: () => {}
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: fakeAuthService
        }, {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdsf@asd.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdsf@asd.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    
    expect.assertions(1);
    try {
      await controller.findUser('1');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
    }
  });
});
