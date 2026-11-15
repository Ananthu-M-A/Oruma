import { registerDecorator, ValidationOptions } from 'class-validator';

export const MAX_HEALTH_INFO_KEYS = 20;
export const MAX_HEALTH_INFO_KEY_LENGTH = 64;
export const MAX_HEALTH_INFO_VALUE_LENGTH = 2000;

/**
 * A flat object of short text fields, such as the patient health form.
 * Rejects nested objects and oversized values, so a client cannot store
 * arbitrary or very large JSON in the account record.
 */
export function isBoundedTextRecord(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > MAX_HEALTH_INFO_KEYS) return false;
  return entries.every(
    ([key, entry]) =>
      key.length <= MAX_HEALTH_INFO_KEY_LENGTH &&
      (entry === null ||
        typeof entry === 'boolean' ||
        typeof entry === 'number' ||
        (typeof entry === 'string' &&
          entry.length <= MAX_HEALTH_INFO_VALUE_LENGTH)),
  );
}

export function IsBoundedTextRecord(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isBoundedTextRecord',
      target: target.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be an object of up to ${MAX_HEALTH_INFO_KEYS} short text fields`,
        ...options,
      },
      validator: { validate: isBoundedTextRecord },
    });
}
