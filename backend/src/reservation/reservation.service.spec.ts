import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

/* Mock PrismaService */
const mockPrisma = {
  concert: { findUnique: jest.fn() },
  reservation: { findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn(), update: jest.fn() },
};

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // Case 1: Success — จองสำเร็จ
  // ──────────────────────────────────────────────
  it('should create a reservation successfully', async () => {
    const userId = 'user-1';
    const dto = { concertId: 'concert-1' };

    mockPrisma.concert.findUnique.mockResolvedValue({
      id: 'concert-1',
      totalSeats: 500,
      reservations: [], // ยังไม่มีใครจอง
    });

    mockPrisma.reservation.findUnique.mockResolvedValue(null); // ยังไม่เคยจอง

    const expected = { id: 'res-1', userId, concertId: dto.concertId, action: 'Reserve' };
    mockPrisma.reservation.upsert.mockResolvedValue(expected);

    const result = await service.create(userId, dto);

    expect(result).toEqual(expected);
    expect(mockPrisma.concert.findUnique).toHaveBeenCalledWith({
      where: { id: dto.concertId },
      include: { reservations: { where: { action: 'Reserve' } } },
    });
    expect(mockPrisma.reservation.upsert).toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────
  // Case 2: Concert Full — ที่นั่งเต็ม (400)
  // ──────────────────────────────────────────────
  it('should throw BadRequestException when concert is fully booked', async () => {
    const userId = 'user-2';
    const dto = { concertId: 'concert-full' };

    /* สร้าง reservations จำลอง 500 คน (เต็มพอดี) */
    const fakeReservations = Array.from({ length: 500 }, (_, i) => ({
      id: `res-${i}`,
      userId: `other-user-${i}`,
      action: 'Reserve',
    }));

    mockPrisma.concert.findUnique.mockResolvedValue({
      id: 'concert-full',
      totalSeats: 500,
      reservations: fakeReservations,
    });

    await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(userId, dto)).rejects.toThrow('Concert is fully booked');
  });

  // ──────────────────────────────────────────────
  // Case 3: Duplicate Booking — จองซ้ำ (409)
  // ──────────────────────────────────────────────
  it('should throw ConflictException when user already booked the same concert', async () => {
    const userId = 'user-3';
    const dto = { concertId: 'concert-2' };

    mockPrisma.concert.findUnique.mockResolvedValue({
      id: 'concert-2',
      totalSeats: 500,
      reservations: [{ id: 'res-exist', userId, action: 'Reserve' }],
    });

    /* มีการจองอยู่แล้วในระบบ */
    mockPrisma.reservation.findUnique.mockResolvedValue({
      id: 'res-exist',
      userId,
      concertId: dto.concertId,
      action: 'Reserve',
    });

    await expect(service.create(userId, dto)).rejects.toThrow(ConflictException);
    await expect(service.create(userId, dto)).rejects.toThrow('You have already booked this concert');
  });

  // ──────────────────────────────────────────────
  // Case 4: Invalid Data — Concert ID ไม่มีอยู่ (404)
  // ──────────────────────────────────────────────
  it('should throw NotFoundException when concert does not exist', async () => {
    const userId = 'user-4';
    const dto = { concertId: 'non-existent-id' };

    mockPrisma.concert.findUnique.mockResolvedValue(null); // ไม่พบคอนเสิร์ต

    await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    await expect(service.create(userId, dto)).rejects.toThrow('Concert not found');
  });
});
