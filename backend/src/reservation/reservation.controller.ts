import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() dto: CreateReservationDto) {
    // Both ADMIN and USER can book tickets using this endpoint
    return this.reservationService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    // Only Admin can view all booking history
    return this.reservationService.findAll();
  }

  @Delete(':concertId')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('concertId') concertId: string) {
    return this.reservationService.remove(req.user.id, concertId);
  }
}
