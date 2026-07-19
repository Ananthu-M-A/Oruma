import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entities/user.entity';
import { AvailabilityController } from './availability.controller';

function getRoles(methodName: keyof AvailabilityController) {
  const method: unknown = Object.getOwnPropertyDescriptor(
    AvailabilityController.prototype,
    methodName,
  )?.value;

  if (typeof method !== 'function') {
    throw new Error(`Controller method ${String(methodName)} was not found`);
  }

  return Reflect.getMetadata(ROLES_KEY, method) as Role[];
}

describe('AvailabilityController authorization', () => {
  it('keeps arbitrary-therapist slot creation admin-only', () => {
    expect(getRoles('create')).toEqual([Role.ADMIN]);
    expect(getRoles('bulkCreate')).toEqual([Role.ADMIN]);
  });

  it('keeps the own-slot endpoint therapist-only', () => {
    expect(getRoles('createOwn')).toEqual([Role.THERAPIST]);
  });
});
