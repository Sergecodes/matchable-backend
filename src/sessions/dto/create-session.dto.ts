import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsIn, IsDateString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'padel', description: 'Type of session (padel, fitness, tennis)' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['padel', 'fitness', 'tennis'], { message: 'Type must be one of: padel, fitness, tennis' })
  type: string;

  @ApiProperty({ example: '09:00-09:45', description: 'Time slot for the session' })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;

  @ApiProperty({ example: '2025-02-08', description: 'Date of the session (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Alice', description: 'Trainer name' })
  @IsString()
  @IsNotEmpty()
  trainer: string;

  @ApiProperty({ example: 30, description: 'Price for the session' })
  @IsNumber()
  price: number;

  @ApiProperty({ example: true, description: 'Whether the session is available' })
  @IsBoolean()
  available: boolean;
}
