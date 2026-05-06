import { Router } from 'express';
import {
  createDropHandler,
  listDropsHandler,
  reserveDropHandler,
} from '../controllers/drops.controller';

export const dropsRouter = Router();

dropsRouter.get('/', listDropsHandler);
dropsRouter.post('/', createDropHandler);
dropsRouter.post('/:dropId/reserve', reserveDropHandler);
