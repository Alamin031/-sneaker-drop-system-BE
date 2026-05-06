import { AppError } from './app-error';

export function requireString(value: unknown, fieldName: string) {
  if (typeof value !== 'string') {
    throw new AppError(400, `${fieldName} is required`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new AppError(400, `${fieldName} is required`);
  }

  return trimmed;
}

export function optionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(400, 'Invalid string value');
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function requirePositiveInteger(value: unknown, fieldName: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, `${fieldName} must be a positive integer`);
  }

  return parsed;
}

export function requirePositiveNumber(value: unknown, fieldName: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AppError(400, `${fieldName} must be a positive number`);
  }

  return parsed;
}

export function requireDate(value: unknown, fieldName: string) {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    throw new AppError(400, `${fieldName} must be a valid date`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, `${fieldName} must be a valid date`);
  }

  return parsed;
}

export function optionalDate(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' && !(value instanceof Date)) {
    throw new AppError(400, `${fieldName} must be a valid date`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, `${fieldName} must be a valid date`);
  }

  return parsed;
}
