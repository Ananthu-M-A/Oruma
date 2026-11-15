import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

async function errorsFor(body: Record<string, unknown>) {
  const errors = await validate(plainToInstance(UpdateProfileDto, body), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((error) => error.property);
}

describe('UpdateProfileDto', () => {
  it('accepts the patient profile form', async () => {
    expect(
      await errorsFor({
        fullName: 'Asha',
        phone: '+91 98765 43210',
        age: null,
        gender: '',
        healthInfo: { primaryConcern: 'Sleep', notes: '' },
      }),
    ).toEqual([]);
  });

  it('rejects non-string names, nested health info and unknown fields', async () => {
    expect(
      await errorsFor({
        fullName: 42,
        healthInfo: { nested: { deep: true } },
        role: 'ADMIN',
      }),
    ).toEqual(expect.arrayContaining(['fullName', 'healthInfo', 'role']));
  });

  it('rejects oversized health info values', async () => {
    expect(
      await errorsFor({ healthInfo: { notes: 'x'.repeat(2001) } }),
    ).toEqual(['healthInfo']);
  });
});
