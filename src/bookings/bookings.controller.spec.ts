import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from '../sessions/session.entity';
import { Repository } from 'typeorm';

describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let sessionRepository: Repository<Session>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Use validation pipe globally
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    sessionRepository = moduleFixture.get<Repository<Session>>(getRepositoryToken(Session));

    // Seed the database with sample sessions
    await sessionRepository.save([
      {
        type: 'padel',
        timeSlot: '09:00-09:45',
        duration: 45,
        trainer: 'Alice',
        price: 30,
        available: true,
        date: '2025-02-09',
      },
      {
        type: 'fitness',
        timeSlot: '10:00-10:45',
        duration: 45,
        trainer: 'Bob',
        price: 25,
        available: true,
        date: '2025-02-09',
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/sessions (GET) should return sessions for a given date', async () => {
    const response = await request(app.getHttpServer())
      .get('/sessions?date=2025-02-09')
      .expect(200);
    expect(response.body).toHaveLength(2);
  });

  it('/bookings (POST) should create a booking when sessions do not overlap', async () => {
    const bookingData = {
      sessionIds: [1, 2], // IDs of seeded sessions
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '1234567890',
    };

    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send(bookingData)
      .expect(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.totalCost).toBe('55'); // Assuming the price fields are strings from DB decimal
  });

  it('/bookings (POST) should reject booking when sessions overlap', async () => {
    // For the purpose of testing overlapping sessions, assume that overlapping validation is triggered
    // by seeding two sessions that overlap. Here, we assume the service checkForOverlaps throws a ConflictException.
    // This example presumes you have overlapping sessions configured in your test DB.
    // For instance, we could create a new session that overlaps with an existing session.
    const overlappingSession = await sessionRepository.save({
      type: 'tennis',
      timeSlot: '09:30-10:15', // Overlaps with session 1 (09:00-09:45)
      duration: 45,
      trainer: 'Charlie',
      price: 35,
      available: true,
      date: '2025-02-09',
    });

    const bookingData = {
      sessionIds: [1, overlappingSession.id],
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      clientPhone: '0987654321',
    };

    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send(bookingData)
      .expect(409); // Conflict status
    expect(response.body.message).toContain('overlapping time slots');
  });
});
