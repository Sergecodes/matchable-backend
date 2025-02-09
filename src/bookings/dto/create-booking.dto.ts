import { IsNotEmpty, IsEmail, IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Array of session IDs to book',
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  sessionIds: number[];

  @ApiProperty({ description: 'Client name', example: 'John Doe' })
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({ description: 'Client email', example: 'john.doe@example.com' })
  @IsEmail()
  clientEmail: string;

  @ApiProperty({ description: 'Client phone number', example: '123-456-7890' })
  @IsNotEmpty()
  clientPhone: string;
}
