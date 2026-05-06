import type { RequestHandler } from 'express';
import { createOrGetUser } from '../services/user.service';
import { asyncHandler } from '../utils/async-handler';
import { requireString } from '../utils/validation';

export const createUserHandler: RequestHandler = asyncHandler(async (request, response) => {
  const username = requireString(request.body.username, 'username');
  const user = await createOrGetUser(username);

  response.status(201).json(user);
});
