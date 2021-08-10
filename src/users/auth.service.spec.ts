import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async() => {
        // Create a fake copy of users service
        fakeUsersService = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) => Promise.resolve({id: 1, email, password} as User)
        };

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    })

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('asdf@asdf.com', 'asdf');

        expect(user.password).not.toEqual('asdf');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in used', async () => {
        fakeUsersService.find = () => Promise.resolve([{id: 1, email: 'as', password: 'wsdsad'} as User]);

        // expect.assertions(2);

        try {
            await service.signup('asdf@asdf.com', 'asdf')
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toEqual('email in use');
        }
    });

    it('throws an error if signin is called with an unused email', async() => {
        try {
            await service.signin('a@awdas.com', 'asdsd');
        } catch (err) {
            expect(err).toBeInstanceOf(NotFoundException);
        }
    });

        fakeUsersService.find = () => Promise.resolve([{email: 'a@asd.com', password: '123'} as User]);

    it('throws an error if an invalid password is provided', async () => {
        try {
            await service.signin('asd@12e.com', 'password');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toEqual('bad password');
        }
    });

    it('returns a user if correct password is provided', async () => {
        const user = await service.signup('asdsad@123.com', 'myPassword');
        fakeUsersService.find = () => Promise.resolve([{email: user.email, password: user.password} as User]);

        const existedUser = await service.signin(user.email, 'myPassword');
        expect(existedUser).toBeDefined();

    })
})

