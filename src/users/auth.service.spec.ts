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
        const users: User[] = [];

        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: users.length,email, password} as User;
                users.push(user);
                return Promise.resolve(user);
            }
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
        expect.assertions(2);
        await service.signup('asdf@asdf.com', 'asdf');

        try {
            await service.signup('asdf@asdf.com', 'asdf');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toEqual('email in use');
        }
    });

    it('throws an error if signin is called with an unused email', async() => {
        expect.assertions(1);
        try {
            await service.signin('a@awdas.com', 'asdsd');
        } catch (err) {
            expect(err).toBeInstanceOf(NotFoundException);
        }
    });

    it('throws an error if an invalid password is provided', async () => {
        expect.assertions(2);
        await service.signup('asd@12e.com', 'password');
        
        try {
            await service.signin('asd@12e.com', 'passwordXXXXX');
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toEqual('bad password');
        }
    });

    it('returns a user if correct password is provided', async () => {
        const user = await service.signup('asdsad@123.com', 'myPassword');
        const existedUser = await service.signin(user.email, 'myPassword');
        expect(existedUser).toBeDefined();

    })
})

