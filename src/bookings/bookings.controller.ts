import { Controller, Post, Body, Get, Query, DefaultValuePipe } from "@nestjs/common";
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { Booking } from './booking.entity';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking with multiple sessions' })
  @ApiResponse({ status: 201, description: 'Booking created', type: Booking })
  createBooking(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.createBooking(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings, filterable by clientName' })
  @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
  @ApiQuery({
    name: "clientName",
    description: "The name of the client to which the bookings belong",
    required: false,
    type: String
  })
  async findAll(@Query('clientName', new DefaultValuePipe(null)) clientName?: string): Promise<Booking[]> {
    return this.bookingsService.findAll({ clientName });
  }
}
