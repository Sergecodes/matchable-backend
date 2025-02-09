import { Body, Controller, DefaultValuePipe, Get, Post, Query } from "@nestjs/common";
import { SessionsService } from './sessions.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Session } from "./session.entity";
import { CreateSessionDto } from "./dto/create-session.dto";

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions or filter by date' })
  @ApiResponse({ status: 200, description: 'List of sessions', type: [Session] })
  @ApiQuery({
    name: "date",
    description: "The date by which the sessions should be filtered",
    required: false,
    type: String
  })
  @ApiQuery({
    name: "from",
    description: "The start date from which the sessions should be filtered",
    required: false,
    type: String
  })
  @ApiQuery({
    name: "to",
    description: "The end date for which the sessions should be filtered",
    required: false,
    type: String
  })
  getAllSessions(
    @Query('date', new DefaultValuePipe(null)) date?: string,
    @Query('from', new DefaultValuePipe(null)) from?: string,
    @Query('to', new DefaultValuePipe(null)) to?: string
) {
    return this.sessionsService.findAll({ date, from, to });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'The session has been successfully created.', type: Session })
  createSession(@Body() createSessionDto: CreateSessionDto): Promise<Session> {
    return this.sessionsService.createSession(createSessionDto);
  }
}
