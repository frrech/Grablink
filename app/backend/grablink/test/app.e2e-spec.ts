import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Grablink API (e2e)', () => {
  let app: INestApplication<App>;
  let shareCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 30000);

  describe('Share Endpoints', () => {
    it('POST /share - should create a new share with valid URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/share')
        .send({ url: 'https://www.example.com' })
        .expect(201);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.code).toMatch(/^\d{6}$/);
      shareCode = response.body.code;
    });

    it('POST /share - should reject invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/share')
        .send({ url: 'not-a-url' })
        .expect(400);
    });

    it('GET /share/:code - should retrieve existing share', async () => {
      if (!shareCode) {
        // Create a share first
        const createRes = await request(app.getHttpServer())
          .post('/share')
          .send({ url: 'https://www.test.com' });
        shareCode = createRes.body.code;
      }

      const response = await request(app.getHttpServer())
        .get(`/share/${shareCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('code', shareCode);
      expect(response.body).toHaveProperty('accessCount');
      expect(response.body).toHaveProperty('qrCodeData');
    });

    it('GET /share/:code - should increment access count', async () => {
      if (!shareCode) {
        const createRes = await request(app.getHttpServer())
          .post('/share')
          .send({ url: 'https://www.test.com' });
        shareCode = createRes.body.code;
      }

      const firstAccess = await request(app.getHttpServer())
        .get(`/share/${shareCode}`)
        .expect(200);

      const initialCount = firstAccess.body.accessCount;

      const secondAccess = await request(app.getHttpServer())
        .get(`/share/${shareCode}`)
        .expect(200);

      expect(secondAccess.body.accessCount).toBe(initialCount + 1);
    });

    it('GET /share/:code - should return 404 for non-existent code', async () => {
      await request(app.getHttpServer())
        .get('/share/999999')
        .expect(404);
    });
  });

  describe('Health Check', () => {
    it('GET / - should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .expect(200);

      expect(response.text).toBe('Hello World!');
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 10000);
});
