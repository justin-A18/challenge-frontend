import { describe, expect, it } from 'vitest';
import {
  readAccounts,
  writeAccounts,
} from '../../../app/modules/transactions/services/accounts.storage';
import { voucherSchema } from '../../../app/modules/transactions/schemas/operation.schema';
import { calculationSchema } from '../../../app/modules/transactions/services/exchange.service';

describe('Reglas de operación', () => {
  it('preserva cuentas, ceros iniciales y aislamiento por usuario', () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (key: string) => map.get(key) || null,
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
    };
    const account = {
      id: 'demo',
      bankId: '1',
      accountType: 'AHORRO' as const,
      currency: 'PEN' as const,
      accountNumber: '0012345678',
    };

    writeAccounts(storage, 'demo@kambista.com', [account]);
    expect(readAccounts(storage, 'demo@kambista.com')).toEqual([account]);
    expect(readAccounts(storage, 'other@example.com')).toEqual([]);
    map.set('kambista.accounts.v1:demo@kambista.com', 'invalid');
    expect(readAccounts(storage, 'demo@kambista.com')).toEqual([]);
  });

  it('valida formato y peso de la constancia', () => {
    for (const name of ['voucher.png', 'voucher.pdf', 'voucher.doc', 'voucher.docx']) {
      expect(voucherSchema.safeParse({ file: new File(['demo'], name) }).success).toBe(true);
    }
    expect(voucherSchema.safeParse({ file: new File(['demo'], 'bad.exe') }).success).toBe(false);
    expect(
      voucherSchema.safeParse({
        file: new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf'),
      }).success,
    ).toBe(false);
  });

  it('interpreta savings.amount y conserva el ahorro cero', () => {
    expect(calculationSchema.safeParse({ exchange: null, rate: 3.428 }).success).toBe(false);
    expect(
      calculationSchema.parse({
        exchange: 342.8,
        rate: 3.428,
        savings: { amount: '5.14', currency: 'S/' },
      }).savings?.amount,
    ).toBe(5.14);
    expect(
      calculationSchema.parse({
        exchange: 0,
        rate: 3.428,
        savings: { amount: '0' },
      }).savings?.amount,
    ).toBe(0);
  });
});
