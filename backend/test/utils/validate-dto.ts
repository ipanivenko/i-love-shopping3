import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateDto<T extends object>(
  cls: new () => T,
  payload: Partial<T>,
) {
  const instance = plainToInstance(cls, payload, {
    enableImplicitConversion: true,
  });

  const errors = await validate(instance);

  return { instance, errors };
}