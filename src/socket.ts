import type { Server as HttpServer } from 'http';
import type { Drop } from '@prisma/client';
import { Server } from 'socket.io';
import { env } from './utils/env';

type StockPayload = Pick<Drop, 'id' | 'availableStock' | 'reservedStock' | 'soldStock'>;

let io: Server | null = null;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => undefined);
  });

  return io;
}

export function emitStockUpdate(drop: StockPayload) {
  io?.emit('stock:update', {
    dropId: drop.id,
    availableStock: drop.availableStock,
    reservedStock: drop.reservedStock,
    soldStock: drop.soldStock,
  });
}

export function emitPurchaseUpdate(dropId: string, latestPurchasers: string[]) {
  io?.emit('purchase:update', {
    dropId,
    latestPurchasers,
  });
}
