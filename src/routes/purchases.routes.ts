import { Router } from 'express';
import { purchaseReservationHandler } from '../controllers/purchases.controller';

export const purchasesRouter = Router();

purchasesRouter.post('/reservations/:reservationId/purchase', purchaseReservationHandler);
