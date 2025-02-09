import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Session } from '../sessions/session.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { sessionIds, clientName, clientEmail, clientPhone } = createBookingDto;

    // Fetch sessions based on the provided array of IDs
    const sessions = await this.sessionRepository.find({
      where: { id: In(sessionIds) },
    });

    if (!sessions || sessions.length !== sessionIds.length) {
      throw new NotFoundException('One or more sessions not found');
    }

    // Check that every session is available
    const unavailableSessions = sessions.filter(session => !session.available);
    if (unavailableSessions.length > 0) {
      const details = unavailableSessions
        .map(session => `${session.type} session at ${session.timeSlot} with ${session.trainer}`)
        .join('; ');
      throw new ConflictException(
        `The following sessions are no longer available: ${details}. Please refresh the page and try again.`
      );
    }

    // Validate that none of the sessions overlap in time
    if (this.checkForOverlaps(sessions)) {
      throw new ConflictException('Selected sessions have overlapping time slots. Please adjust your selection.');
    }

    // Calculate the total cost
    const totalCost = sessions.reduce(
      (sum, session) => sum + Number(session.price), 0);

    const booking = this.bookingRepository.create({
      clientName,
      clientEmail,
      clientPhone,
      sessions,
      totalCost,
    });

    // Mark sessions as unavailable
    for (const session of sessions) {
      session.available = false;
    }

    await this.sessionRepository.save(sessions);
    return this.bookingRepository.save(booking);
  }

  async findAll(query : { clientName?: string }): Promise<Booking[]> {
    const { clientName } = query;
    const where = clientName ? { clientName } : {};
    return this.bookingRepository.find({ where });
  }

  /** Helper function: Calculate start and end times for a session */
  private getSessionTimeRange(session: Session): { start: Date; end: Date } {
    // Assume session.timeSlot is in the format "HH:MM-HH:MM" and session.date is "YYYY-MM-DD"
    const [startStr, ] = session.timeSlot.split('-');
    const start = new Date(`${session.date}T${startStr}`);

    // Calculate the end time using the stored duration (in minutes)
    const end = new Date(start.getTime() + session.duration * 60 * 1000);
    return { start, end };
  }

  /** Check if any two sessions in the list overlap */
  private checkForOverlaps(sessions: Session[]): boolean {
    for (let i = 0; i < sessions.length; i++) {
      const { start: startA, end: endA } = this.getSessionTimeRange(sessions[i]);
      for (let j = i + 1; j < sessions.length; j++) {
        const { start: startB, end: endB } = this.getSessionTimeRange(sessions[j]);
        // Overlap if startA < endB and startB < endA
        if (startA < endB && startB < endA) {
          return true;
        }
      }
    }
    return false;
  }
}
