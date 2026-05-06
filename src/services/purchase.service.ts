import { ReservationStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { emitPurchaseUpdate, emitStockUpdate } from '../socket';
import { AppError } from '../utils/app-error';
import { clearReservationExpiry } from './reservation-scheduler.service';
import { getLatestPurchasers, refreshDropStatuses } from './drop.service';

type PurchaseReservationInput = {
  reservationId: string;
  userId: string;
};

export async function purchaseReservation(input: PurchaseReservationInput) {
  await refreshDropStatuses();

  const result = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const reservation = await tx.reservation.findUnique({
      where: {
        id: input.reservationId,
      },
    });

    if (!reservation) {
      throw new AppError(404, 'Reservation not found');
    }

    if (reservation.userId !== input.userId) {
      throw new AppError(403, 'User does not own reservation');
    }

    if (reservation.status === ReservationStatus.PURCHASED) {
      throw new AppError(400, 'Reservation already purchased');
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new AppError(400, 'Reservation expired');
    }

    if (reservation.expiresAt <= now) {
      const expired = await tx.reservation.updateMany({
        where: {
          id: reservation.id,
          status: ReservationStatus.ACTIVE,
          expiresAt: {
            lte: now,
          },
        },
        data: {
          status: ReservationStatus.EXPIRED,
        },
      });

      let expiredDrop = null;

      if (expired.count > 0) {
        expiredDrop = await tx.drop.update({
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
      }

      return {
        status: 'expired' as const,
        drop: expiredDrop,
      };
    }

    const updatedReservation = await tx.reservation.updateMany({
      where: {
        id: reservation.id,
        userId: input.userId,
        status: ReservationStatus.ACTIVE,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        status: ReservationStatus.PURCHASED,
      },
    });

    if (updatedReservation.count === 0) {
      const latestReservation = await tx.reservation.findUnique({
        where: {
          id: reservation.id,
        },
      });

      if (latestReservation?.status === ReservationStatus.PURCHASED) {
        throw new AppError(400, 'Reservation already purchased');
      }

      throw new AppError(400, 'Reservation expired');
    }

    const purchase = await tx.purchase.create({
      data: {
        userId: input.userId,
        dropId: reservation.dropId,
        reservationId: reservation.id,
      },
    });

    const drop = await tx.drop.update({
      where: {
        id: reservation.dropId,
      },
      data: {
        reservedStock: {
          decrement: 1,
        },
        soldStock: {
          increment: 1,
        },
      },
    });

    const latestPurchasers = await getLatestPurchasers(reservation.dropId, tx);

    return {
      status: 'purchased' as const,
      purchase,
      drop,
      latestPurchasers,
    };
  });

  if (result.status === 'expired') {
    clearReservationExpiry(input.reservationId);

    if (result.drop) {
      emitStockUpdate(result.drop);
    }

    throw new AppError(400, 'Reservation expired');
  }

  clearReservationExpiry(input.reservationId);
  emitStockUpdate(result.drop);
  emitPurchaseUpdate(result.drop.id, result.latestPurchasers);

  return {
    purchase: {
      id: result.purchase.id,
      userId: result.purchase.userId,
      dropId: result.purchase.dropId,
      reservationId: result.purchase.reservationId,
      createdAt: result.purchase.createdAt.toISOString(),
    },
  };
}
