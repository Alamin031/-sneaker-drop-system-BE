import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi';
import { dropsRouter } from './routes/drops.routes';
import { purchasesRouter } from './routes/purchases.routes';
import { reservationsRouter } from './routes/reservations.routes';
import { usersRouter } from './routes/users.routes';
import { env } from './utils/env';
import { errorHandler, notFoundHandler } from './utils/error-handler';

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/openapi.json', (_request, response) => {
  response.json(openApiDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/users', usersRouter);
app.use('/api/drops', dropsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api', purchasesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
