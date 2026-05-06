import { DropStatus, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { emitStockUpdate } from '../socket';
import { AppError } from '../utils/app-error';
import { RESERVATION_WINDOW_MS, scheduleReservationExpiry } from './reservation-scheduler.service';
import { expireReservation, serializeReservation } from './reservation.service';

type PrismaExecutor = Prisma.TransactionClient | typeof prisma;

type CreateDropInput = {
  name: string;
  description?: string | null;
  price: number;
  totalStock: number;
  startsAt: Date;
  endsAt?: Date | null;
};

type ReserveDropInput = {
  dropId: string;
  userId: string;
};

export async function refreshDropStatuses(db: PrismaExecutor = prisma) {
  const now = new Date();

  await db.drop.updateMany({
    where: {
      status: {
        in: [DropStatus.UPCOMING, DropStatus.ACTIVE],
      },
      endsAt: {
        not: null,
        lte: now,
      },
    },
    data: {
      status: DropStatus.ENDED,
    },
  });

  await db.drop.updateMany({
    where: {
      status: DropStatus.UPCOMING,
      startsAt: {
        lte: now,
      },
      OR: [
        {
          endsAt: null,
        },
        {
          endsAt: {
            gt: now,
          },
        },
      ],
    },
    data: {
      status: DropStatus.ACTIVE,
    },
  });
}

export async function createDrop(input: CreateDropInput) {
  const now = new Date();
  const status =
    input.endsAt && input.endsAt <= now
      ? DropStatus.ENDED
      : input.startsAt <= now
        ? DropStatus.ACTIVE
        : DropStatus.UPCOMING;

  const drop = await prisma.drop.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      price: new Prisma.Decimal(input.price),
      totalStock: input.totalStock,
      availableStock: input.totalStock,
      reservedStock: 0,
      soldStock: 0,
      startsAt: input.startsAt,
      endsAt: input.endsAt ?? null,
      status,
    },
    include: {
      purchases: {
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  return serializeDropSummary(drop);
}

export async function listDrops() {
  await refreshDropStatuses();

  const drops = await prisma.drop.findMany({
    where: {
      status: {
        in: [DropStatus.ACTIVE, DropStatus.UPCOMING],
      },
    },
    orderBy: [
      {
        startsAt: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
    include: {
      purchases: {
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  return drops.map(serializeDropSummary);
}

export async function reserveDrop(input: ReserveDropInput) {
  await refreshDropStatuses();

  const expiresAt = new Date(Date.now() + RESERVATION_WINDOW_MS);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const stockUpdate = await tx.drop.updateMany({
      where: {
        id: input.dropId,
        status: DropStatus.ACTIVE,
        availableStock: {
          gt: 0,
        },
      },
      data: {
        availableStock: {
          decrement: 1,
        },
        reservedStock: {
          increment: 1,
        },
      },
    });

    if (stockUpdate.count === 0) {
      const drop = await tx.drop.findUnique({
        where: {
          id: input.dropId,
        },
      });

      if (!drop) {
        throw new AppError(404, 'Drop not found');
      }

      if (drop.status !== DropStatus.ACTIVE) {
        throw new AppError(400, 'Drop is not active');
      }

      throw new AppError(409, 'Out of stock');
    }

    const reservation = await tx.reservation.create({
      data: {
        userId: input.userId,
        dropId: input.dropId,
        expiresAt,
      },
    });

    const drop = await tx.drop.findUniqueOrThrow({
      where: {
        id: input.dropId,
      },
    });

    return {
      reservation,
      drop,
    };
  });

  scheduleReservationExpiry(result.reservation.id, result.reservation.expiresAt, expireReservation);
  emitStockUpdate(result.drop);

  return {
    reservation: serializeReservation(result.reservation),
  };
}

export async function getLatestPurchasers(dropId: string, db: PrismaExecutor = prisma) {
  const latestPurchases = await db.purchase.findMany({
    where: {
      dropId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return latestPurchases.map((purchase) => purchase.user.username);
}

function serializeDropSummary(
  drop: Prisma.DropGetPayload<{
    include: {
      purchases: {
        include: {
          user: {
            select: {
              username: true;
            };
          };
        };
      };
    };
  }>,
) {
  return {
    id: drop.id,
    name: drop.name,
    description: drop.description,
    price: Number(drop.price),
    totalStock: drop.totalStock,
    availableStock: drop.availableStock,
    reservedStock: drop.reservedStock,
    soldStock: drop.soldStock,
    startsAt: drop.startsAt.toISOString(),
    endsAt: drop.endsAt?.toISOString() ?? null,
    status: drop.status,
    latestPurchasers: drop.purchases.map((purchase) => purchase.user.username),
    createdAt: drop.createdAt.toISOString(),
    updatedAt: drop.updatedAt.toISOString(),
  };
}
