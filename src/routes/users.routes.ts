import { Router } from 'express';
import { createUserHandler } from '../controllers/users.controller';

export const usersRouter = Router();

usersRouter.post('/', createUserHandler);
