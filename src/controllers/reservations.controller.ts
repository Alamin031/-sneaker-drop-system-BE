import type { RequestHandler } from 'express';
import { listUserActiveReservations } from '../services/reservation.service';
import { asyncHandler } from '../utils/async-handler';
import { requireString } from '../utils/validation';

export const listActiveReservationsHandler: RequestHandler = asyncHandler(
  async (request, response) => {
    const userId = requireString(request.query.userId, 'userId');
    const reservations = await listUserActiveReservations(userId);
    response.json(reservations);
  },
);
