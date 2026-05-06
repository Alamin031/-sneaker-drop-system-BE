import { Prisma, ReservationStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { emitStockUpdate } from '../socket';
import { clearReservationExpiry, scheduleReservationExpiry } from './reservation-scheduler.service';

export function serializeReservation<T extends { id: string; userId: string; dropId: string; status: ReservationStatus; expiresAt: Date; createdAt: Date; updatedAt: Date }>(
  reservation: T,
) {
  return {
    id: reservation.id,
    userId: reservation.userId,
    dropId: reservation.dropId,
    status: reservation.status,
    expiresAt: reservation.expiresAt.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

export async function expireReservation(reservationId: string) {
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const now = new Date();
    const reservation = await tx.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    if (!reservation || reservation.status !== ReservationStatus.ACTIVE || reservation.expiresAt > now) {
      return null;
    }

    const updatedReservation = await tx.reservation.updateMany({
      where: {
        id: reservationId,
        status: ReservationStatus.ACTIVE,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: ReservationStatus.EXPIRED,
      },
    });

    if (updatedReservation.count === 0) {
      return null;
    }

    const drop = await tx.drop.update({
      where: {
        id: reservation.dropId,
      },
      data: {
        availableStock: {
          increment: 1,
        },
        reservedStock: {
          decrement: 1,
        },
      },
    });

    return {
      drop,
    };
  });

  clearReservationExpiry(reservationId);

  if (result) {
    emitStockUpdate(result.drop);
  }
}

export async function recoverReservationsOnStartup() {
  const now = new Date();
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: {
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });

  for (const reservation of expiredReservations) {
    await expireReservation(reservation.id);
  }

  const activeReservations = await prisma.reservation.findMany({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  for (const reservation of activeReservations) {
    scheduleReservationExpiry(reservation.id, reservation.expiresAt, expireReservation);
  }
}

export async function listUserActiveReservations(userId: string) {
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      userId,
      status: ReservationStatus.ACTIVE,
      expiresAt: {
        lte: new Date(),
      },
    },
    select: {
      id: true,
    },
  });

  for (const reservation of expiredReservations) {
    await expireReservation(reservation.id);
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      userId,
      status: ReservationStatus.ACTIVE,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reservations.map(serializeReservation);
}
