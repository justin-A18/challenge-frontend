import { describe, expect, it } from 'vitest';
import { bankAccountSchema } from '../../../app/modules/transactions/schemas/bankAccount.schema';

describe('Validación de cuentas bancarias', () => {
  it('conserva ceros iniciales y rechaza caracteres no numéricos', () => {
    const account = {
      bankId: '1',
      accountType: 'AHORRO',
      currency: 'PEN',
      accountNumber: '0012345678',
    };
    expect(bankAccountSchema.parse(account).accountNumber).toBe('0012345678');
    expect(bankAccountSchema.safeParse({ ...account, accountNumber: '001-234' }).success).toBe(
      false,
    );
  });
});
