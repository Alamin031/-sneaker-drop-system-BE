import type { RequestHandler } from 'express';
import { createDrop, listDrops, reserveDrop } from '../services/drop.service';
import { asyncHandler } from '../utils/async-handler';
import {
  optionalDate,
  optionalString,
  requireDate,
  requirePositiveInteger,
  requirePositiveNumber,
  requireString,
} from '../utils/validation';

export const listDropsHandler: RequestHandler = asyncHandler(async (_request, response) => {
  const drops = await listDrops();
  response.json(drops);
});

export const createDropHandler: RequestHandler = asyncHandler(async (request, response) => {
  const drop = await createDrop({
    name: requireString(request.body.name, 'name'),
    description: optionalString(request.body.description),
    price: requirePositiveNumber(request.body.price, 'price'),
    totalStock: requirePositiveInteger(request.body.totalStock, 'totalStock'),
    startsAt: requireDate(request.body.startsAt, 'startsAt'),
    endsAt: optionalDate(request.body.endsAt, 'endsAt'),
  });

  response.status(201).json(drop);
});

export const reserveDropHandler: RequestHandler = asyncHandler(async (request, response) => {
  const reservation = await reserveDrop({
    dropId: requireString(request.params.dropId, 'dropId'),
    userId: requireString(request.body.userId, 'userId'),
  });

  response.status(201).json(reservation);
});
