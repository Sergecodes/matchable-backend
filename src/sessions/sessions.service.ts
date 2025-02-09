import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from "typeorm";
import { Session } from './session.entity';
import { CreateSessionDto } from "./dto/create-session.dto";

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  findAll(query: { date?: string; from?: string; to?: string }): Promise<Session[]> {
    if (query.from && query.to) {
      // Return sessions whose date is between the provided dates
      return this.sessionRepository.find({
        where: { date: Between(query.from, query.to) },
      });
    } else if (query.date) {
      return this.sessionRepository.find({
        where: { date: query.date },
      });
    }

    // If no date filtering provided, return all sessions
    return this.sessionRepository.find();
  }

  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    const duration = this.calculateDuration(createSessionDto.timeSlot);
    const session = this.sessionRepository.create({
      ...createSessionDto,
      duration, // calculated duration in minutes
    });
    return this.sessionRepository.save(session);
  }

  private calculateDuration(timeSlot: string): number {
    // Expecting timeSlot in the format "HH:MM-HH:MM"
    const parts = timeSlot.split('-');
    if (parts.length !== 2) {
      throw new BadRequestException('timeSlot must be in format "HH:MM-HH:MM"');
    }
    const [start, end] = parts;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (
      isNaN(startHour) || isNaN(startMinute) ||
      isNaN(endHour) || isNaN(endMinute)
    ) {
      throw new BadRequestException('Invalid timeSlot format');
    }

    // Create Date objects on the same day (the actual date is irrelevant)
    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    // Calculate difference in minutes
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (diff < 0) {
      throw new BadRequestException('End time must be after start time');
    }
    return diff;
  }

}
