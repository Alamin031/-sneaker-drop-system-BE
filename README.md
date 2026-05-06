# Backend README

The backend powers the Limited Edition Sneaker Drop inventory engine: drop creation, atomic reservations, purchase completion, reservation expiry recovery, and Socket.io broadcasts.

For the full project overview, see the root [README.md](../README.md).

## Live Deployment

- Backend: `https://sneaker-drop-system-be.onrender.com`
- Swagger UI: `https://sneaker-drop-system-be.onrender.com/api-docs`
- OpenAPI JSON: `https://sneaker-drop-system-be.onrender.com/openapi.json`

## Stack

- Node.js
- Express
- TypeScript
- Prisma 7
- `@prisma/adapter-pg`
- PostgreSQL
- Socket.io

## Main Responsibilities

- create or reuse simple username-based users
- create merch drops with stock counters and start timestamps
- prevent overselling with transaction-safe reservation logic
- expire 60-second reservations and restore stock automatically
- emit `stock:update` and `purchase:update` events
- return top 3 latest purchasers per drop

## Project Structure

```text
src/
  app.ts
  prisma.ts
  server.ts
  socket.ts
  controllers/
  routes/
  services/
  utils/
prisma/
  schema.prisma
  seed.js
```

## Environment Variables

Create `backend/.env` from `.env.example`:

```env
DATABASE_URL="postgresql://user:password@host:5432/db"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Notes:

- `DATABASE_URL` must be a direct PostgreSQL connection string.
- `prisma+postgres://...` URLs are not supported by the running backend.
- `CLIENT_URL` must be the exact frontend origin allowed to call this API and open Socket.io connections.
- For Supabase local development, a working example is:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=no-verify"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

## Install and Run

```bash
cd backend
npm install
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

## Useful Commands

```bash
npm run dev
npm run build
npm run prisma:generate
npx prisma db push
npm run seed
npm run prisma:studio
```

## API Docs

Swagger UI is available at:

```text
http://localhost:5000/api-docs
```

Raw OpenAPI JSON is available at:

```text
http://localhost:5000/openapi.json
```

## API Summary

### `POST /api/users`

Create or return a user by username.

### `POST /api/drops`

Create a new merch drop with initialized stock values.

### `GET /api/drops`

Return active and upcoming drops plus the latest 3 successful purchasers.

### `POST /api/drops/:dropId/reserve`

Reserve one item for 60 seconds using an atomic stock update.

### `POST /api/reservations/:reservationId/purchase`

Complete purchase for a valid active reservation owned by the current user.

### `GET /api/reservations?userId=...`

Restore active reservations for the frontend after reloads or tab changes.

## Real-Time Events

### `stock:update`

```json
{
  "dropId": "drop_id",
  "availableStock": 10,
  "reservedStock": 2,
  "soldStock": 5
}
```

### `purchase:update`

```json
{
  "dropId": "drop_id",
  "latestPurchasers": ["alamin", "rahim", "karim"]
}
```

## Reservation and Concurrency Notes

- Reserving stock uses `updateMany` with `availableStock > 0` inside a Prisma transaction.
- This prevents multiple users from successfully claiming the same last item.
- Reservation expiry is handled by both in-memory timers and startup recovery.
- Stock restoration and purchase completion emit Socket.io updates only after successful database changes.

## Demo Seed

The seed script resets demo data and inserts:

- 5 users
- 2 active drops
- 1 upcoming drop
- 4 successful purchases

Run:

```bash
npm run seed
```

## Deploy on Render

Render is a good fit for this backend because Socket.io needs a long-lived Node process.

### Render service settings

Create a new Web Service and use:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm run start`

Note: this project runs `npm run build` automatically in a `postinstall` script, so `npm install` is enough to produce `dist/` on Render.

### Render environment variables

Set these in the Render dashboard:

- `DATABASE_URL`
- `CLIENT_URL`
- `PORT`

Example production values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
CLIENT_URL="https://sneaker-drop-system-fe.vercel.app/"
PORT=10000
```

Notes:

- Render usually injects `PORT` automatically. Keeping it as an env var is still fine because the server already reads `process.env.PORT`.
- Use a direct PostgreSQL connection string, not `prisma+postgres://...`.
- If you use Supabase or Neon in production, prefer their normal SSL-enabled production URL.

### Apply the schema on Render

After the service is created, apply the Prisma schema to the production database once:

```bash
npx prisma db push
```

If you later switch to checked-in Prisma migrations, use:

```bash
npx prisma migrate deploy
```

### Frontend connection

If your frontend is deployed on Vercel:

- set frontend `VITE_API_URL` to your Render backend URL
- set frontend `VITE_SOCKET_URL` to the same Render backend URL
- set backend `CLIENT_URL` to the Vercel frontend origin
