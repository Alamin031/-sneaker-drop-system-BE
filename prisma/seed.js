const dotenv = require('dotenv');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, DropStatus, ReservationStatus } = require('@prisma/client');

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the seed script.');
}

if (databaseUrl.startsWith('prisma+postgres://')) {
  throw new Error(
    'Use a direct PostgreSQL connection string for seeding. prisma+postgres:// URLs are not supported here.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function createPurchasedReservation({ userId, dropId, createdAt }) {
  const expiresAt = new Date(createdAt.getTime() + 60_000);

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      dropId,
      status: ReservationStatus.PURCHASED,
      expiresAt,
      createdAt,
    },
  });

  await prisma.purchase.create({
    data: {
      userId,
      dropId,
      reservationId: reservation.id,
      createdAt,
    },
  });
}

async function main() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.purchase.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.drop.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const [alamin, rahim, karim, nabila, farhan] = await Promise.all([
    prisma.user.create({ data: { username: 'alamin' } }),
    prisma.user.create({ data: { username: 'rahim' } }),
    prisma.user.create({ data: { username: 'karim' } }),
    prisma.user.create({ data: { username: 'nabila' } }),
    prisma.user.create({ data: { username: 'farhan' } }),
  ]);

  const airJordan = await prisma.drop.create({
    data: {
      name: 'Air Jordan 1 Retro High OG',
      description: 'Chicago-inspired limited release with transaction-safe inventory.',
      price: '250.00',
      totalStock: 25,
      availableStock: 22,
      reservedStock: 0,
      soldStock: 3,
      startsAt: twoHoursAgo,
      endsAt: tomorrow,
      status: DropStatus.ACTIVE,
    },
  });

  const dunkLow = await prisma.drop.create({
    data: {
      name: 'Nike Dunk Low SB Pro',
      description: 'Low-profile skate classic with tight inventory and live stock sync.',
      price: '180.00',
      totalStock: 12,
      availableStock: 11,
      reservedStock: 0,
      soldStock: 1,
      startsAt: oneHourAgo,
      endsAt: tomorrow,
      status: DropStatus.ACTIVE,
    },
  });

  const newBalance = await prisma.drop.create({
    data: {
      name: 'New Balance 9060 Moonrock',
      description: 'Upcoming drop seeded for the upcoming status and start-time flow.',
      price: '210.00',
      totalStock: 18,
      availableStock: 18,
      reservedStock: 0,
      soldStock: 0,
      startsAt: tomorrow,
      endsAt: null,
      status: DropStatus.UPCOMING,
    },
  });

  await createPurchasedReservation({
    userId: karim.id,
    dropId: airJordan.id,
    createdAt: new Date(now.getTime() - 15 * 60 * 1000),
  });

  await createPurchasedReservation({
    userId: rahim.id,
    dropId: airJordan.id,
    createdAt: new Date(now.getTime() - 8 * 60 * 1000),
  });

  await createPurchasedReservation({
    userId: alamin.id,
    dropId: airJordan.id,
    createdAt: new Date(now.getTime() - 3 * 60 * 1000),
  });

  await createPurchasedReservation({
    userId: nabila.id,
    dropId: dunkLow.id,
    createdAt: new Date(now.getTime() - 10 * 60 * 1000),
  });

  console.log('Seed completed successfully.');
  console.log(`Users created: 5`);
  console.log(`Drops created: 3`);
  console.log(`Purchases created: 4`);
  console.log(`Active drops: ${airJordan.name}, ${dunkLow.name}`);
  console.log(`Upcoming drop: ${newBalance.name}`);
  console.log(`Extra demo user ready for live reservation tests: ${farhan.username}`);
}

main()
  .catch((error) => {
    console.error('Seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
