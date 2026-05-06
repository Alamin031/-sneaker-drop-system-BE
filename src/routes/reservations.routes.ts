import { Router } from 'express';
import { listActiveReservationsHandler } from '../controllers/reservations.controller';

export const reservationsRouter = Router();

reservationsRouter.get('/', listActiveReservationsHandler);
