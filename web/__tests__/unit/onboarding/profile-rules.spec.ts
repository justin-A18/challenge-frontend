import { describe, expect, it } from 'vitest';
import { profileSchema } from '../../../app/modules/onboarding/schemas/profile.schema';
import { createProfile } from '../../../app/modules/onboarding/services/profile.mock';
import { isAdult } from '../../../app/modules/onboarding/utils/isAdult';

const profile = {
  firstName: 'María López',
  documentType: 'DNI' as const,
  documentNumber: '87654321',
  phone: '987654321',
  birthDate: '1990-06-15',
  acceptTerms: true,
  acceptPrivacy: false,
};

describe('Reglas del perfil', () => {
  it('acepta desde el cumpleaños 18 y rechaza fechas inexistentes', () => {
    const today = new Date(2026, 10, 22);
    expect(isAdult('2008-11-22', today)).toBe(true);
    expect(isAdult('2008-11-23', today)).toBe(false);
    expect(isAdult('2000-02-30', today)).toBe(false);
  });

  it('valida el formato del documento según el tipo seleccionado', () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
    expect(profileSchema.safeParse({ ...profile, documentType: 'CE' }).success).toBe(false);
    expect(
      profileSchema.safeParse({ ...profile, documentType: 'CE', documentNumber: '123456789' })
        .success,
    ).toBe(true);
    expect(
      profileSchema.safeParse({ ...profile, documentType: 'PASAPORTE', documentNumber: 'AB123456' })
        .success,
    ).toBe(true);
    expect(profileSchema.safeParse({ ...profile, firstName: 'María123' }).success).toBe(false);
  });

  it('permite la política opcional y exige aceptar los términos', () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
    expect(profileSchema.safeParse({ ...profile, acceptTerms: false }).success).toBe(false);
  });

  it('devuelve los errores de registro del contrato APIError', async () => {
    expect(await createProfile({ ...profile, documentNumber: '12345678' })).toMatchObject({
      success: false,
      data: { name: 'DUPLICATE_DNI' },
    });
    expect(await createProfile({ ...profile, phone: '999999999' })).toMatchObject({
      success: false,
      data: { name: 'INVALID_PHONE' },
    });
  });
});
