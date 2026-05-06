import { createServer } from 'http';
import { app } from './app';
import { prisma } from './prisma';
import { recoverReservationsOnStartup } from './services/reservation.service';
import { initializeSocket } from './socket';
import { env } from './utils/env';

const server = createServer(app);

initializeSocket(server);

const startServer = async () => {
  try {
    await prisma.$connect();
    await recoverReservationsOnStartup();
    console.log('Reservation recovery completed.');

    server.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed.', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

void startServer();

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});
