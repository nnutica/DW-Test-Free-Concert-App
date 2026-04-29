import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto) {
    const concert = await this.prisma.concert.findUnique({
      where: { id: dto.concertId },
      include: {
        reservations: { where: { action: 'Reserve' } },
      },
    });

    if (!concert) throw new NotFoundException('Concert not found');

    if (concert.reservations.length >= concert.totalSeats) {
      throw new BadRequestException('Concert is fully booked');
    }

    const existing = await this.prisma.reservation.findUnique({
      where: { userId_concertId: { userId, concertId: dto.concertId } },
    });

    if (existing && existing.action === 'Reserve') {
      throw new ConflictException('You have already booked this concert');
    }

    return this.prisma.reservation.upsert({
      where: { userId_concertId: { userId, concertId: dto.concertId } },
      update: { action: 'Reserve', createdAt: new Date() },
      create: {
        userId,
        concertId: dto.concertId,
        action: 'Reserve',
      },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        concert: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, concertId: string) {
    const existing = await this.prisma.reservation.findUnique({
      where: { userId_concertId: { userId, concertId } },
    });

    if (!existing || existing.action === 'Cancel') {
      throw new NotFoundException('Reservation not found');
    }

    return this.prisma.reservation.update({
      where: { userId_concertId: { userId, concertId } },
      data: { action: 'Cancel', createdAt: new Date() },
    });
  }
}
