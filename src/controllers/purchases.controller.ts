import type { RequestHandler } from 'express';
import { purchaseReservation } from '../services/purchase.service';
import { asyncHandler } from '../utils/async-handler';
import { requireString } from '../utils/validation';

export const purchaseReservationHandler: RequestHandler = asyncHandler(
  async (request, response) => {
    const result = await purchaseReservation({
      reservationId: requireString(request.params.reservationId, 'reservationId'),
      userId: requireString(request.body.userId, 'userId'),
    });

    response.json(result);
  },
);
