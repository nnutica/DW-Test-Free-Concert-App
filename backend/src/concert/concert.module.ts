import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConcertService } from './concert.service';
import { ConcertController } from './concert.controller';

@Module({
  imports: [PrismaModule],
  providers: [ConcertService],
  controllers: [ConcertController],
})
export class ConcertModule {}
