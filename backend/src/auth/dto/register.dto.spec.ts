//Pretend this payload came from the client and check whether the DTO accepts it.
import { validateDto } from '../../../test/utils/validate-dto';
import { RegisterDto } from './register.dto';

describe('RegisterDto Validation', () => {
  it('should pass with valid data', async () => {
    const  { errors } = await validateDto(RegisterDto, {
      name: 'Jovin',
      email: 'jovin@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      captchaToken: 'captcha',
    });

    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const  { errors } = await validateDto(RegisterDto, {
      name: 'Jovin',
      email: 'invalid-email',
      password: 'Password123',
      confirmPassword: 'Password123',
      captchaToken: 'captcha',
    });

    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('should fail with short password', async () => {
    const  { errors } = await validateDto(RegisterDto, {
      name: 'Jovin',
      email: 'jovin@example.com',
      password: '123',
      confirmPassword: '123',
      captchaToken: 'captcha',
    });

    expect(errors.some(e => e.property === 'password')).toBe(true);
  });

  it('should fail when name missing', async () => {
    const  { errors }  = await validateDto(RegisterDto, {
      email: 'jovin@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      captchaToken: 'captcha',
    } as any);

    expect(errors.some(e => e.property === 'name')).toBe(true);
  });
});