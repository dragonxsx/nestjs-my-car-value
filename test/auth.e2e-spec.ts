import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

    it('handles a signup request', () => {
        const user = {
            email: 'asdasc1@sds.com',
            password: 'e3r3dsd'
        };
        
        return request(app.getHttpServer())
            .post('/auth/signup')
            .send(user)
            .expect(201)
            .then(res => {
                const { email, id } = res.body;
                expect(id).toBeDefined();
                expect(email).toEqual(user.email);
          });
    });

    it('signup as a new user then get the currently logged in user', async () => {
      const email = 'skfajdsf@asj.com';

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({email, password: 'asdcv'})
        .expect(201);

      const cookie = res.get('Set-Cookie');

      const {body} = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(body.email).toEqual(email);
    })
});
