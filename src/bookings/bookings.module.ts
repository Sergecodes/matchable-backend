import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./booking.entity";
import { Session } from "../sessions/session.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Session])],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
