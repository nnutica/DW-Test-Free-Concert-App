import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConcertDto } from './dto/create-concert.dto';

@Injectable()
export class ConcertService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateConcertDto) {
    return this.prisma.concert.create({ data: dto });
  }

  async remove(id: number) {
    const concert = await this.prisma.concert.findUnique({ where: { id } });
    if (!concert) throw new NotFoundException('Concert not found');
    return this.prisma.concert.delete({ where: { id } });
  }

  findAll() {
    return this.prisma.concert.findMany({
      include: {
        reservations: true, // Check List Reservations if Full to Notice Admin
      },
    });
  }
}
