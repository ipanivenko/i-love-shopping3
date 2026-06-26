import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto Validation', () => {
  it('should pass with valid login data', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'test@example.com',
      password: 'Password123!',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email format', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'invalid-email',
      password: 'Password123!',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when email is missing', async () => {
    const dto = plainToInstance(LoginDto, {
      password: 'Password123!',
    } as Partial<LoginDto>);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should fail when password is missing', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'test@example.com',
    } as Partial<LoginDto>);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail when password is empty', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'test@example.com',
      password: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});