export const RESERVATION_WINDOW_MS = 60_000;

const activeTimeouts = new Map<string, NodeJS.Timeout>();

export function scheduleReservationExpiry(
  reservationId: string,
  expiresAt: Date,
  handler: (reservationId: string) => Promise<void>,
) {
  clearReservationExpiry(reservationId);

  const delay = Math.max(expiresAt.getTime() - Date.now(), 0);
  const timeout = setTimeout(async () => {
    clearReservationExpiry(reservationId);

    try {
      await handler(reservationId);
    } catch (error) {
      console.error(`Failed to expire reservation ${reservationId}.`, error);
    }
  }, delay);

  activeTimeouts.set(reservationId, timeout);
}

export function clearReservationExpiry(reservationId: string) {
  const timeout = activeTimeouts.get(reservationId);

  if (timeout) {
    clearTimeout(timeout);
    activeTimeouts.delete(reservationId);
  }
}
