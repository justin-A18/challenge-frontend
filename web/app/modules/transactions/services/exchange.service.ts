import { z } from 'zod';
import { KAMBISTA_ENDPOINTS } from '~/shared/constants/api';
import type { Currency } from '~/shared/constants/currencies';
const numeric = z.union([z.number(), z.string().trim().regex(/^-?\d+(?:\.\d+)?$/).transform(Number)]).pipe(z.number().finite());
export const ratesSchema = z.object({ bid: numeric.pipe(z.number().positive()), ask: numeric.pipe(z.number().positive()) });
export const calculationSchema = z.object({
  exchange: numeric.pipe(z.number().nonnegative()), rate: numeric.pipe(z.number().positive()),
  savings: z.object({ amount: numeric, currency: z.string().optional() }).nullable().optional(),
});
export type ExchangeRates = z.infer<typeof ratesSchema>;
export interface ExchangeCalculation { exchange: number; rate: number; savings: number | null }
export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { name?: unknown; cause?: unknown };
  return candidate.name === 'AbortError' || isAbortError(candidate.cause);
}
function errorMessage(error: unknown) {
  const candidate = error as { data?: { data?: { message?: string }; message?: string; statusMessage?: string } };
  return candidate?.data?.data?.message || candidate?.data?.message || candidate?.data?.statusMessage || 'No pudimos consultar la cotización. Intenta nuevamente.';
}
export async function getExchangeRates(signal?: AbortSignal): Promise<ExchangeRates> {
  try { return ratesSchema.parse(await $fetch(KAMBISTA_ENDPOINTS.currentExchange, { signal, retry: 0 })); }
  catch (error) { if (signal?.aborted || isAbortError(error)) throw error; throw new Error(errorMessage(error)); }
}
export async function calculateExchange(amount: number, origin: Currency, destination: Currency, signal?: AbortSignal): Promise<ExchangeCalculation> {
  if (origin === destination) throw new Error('Selecciona monedas diferentes.');
  try {
    const result = calculationSchema.parse(await $fetch(KAMBISTA_ENDPOINTS.calculateExchange, {
      query: { originCurrency: origin, destinationCurrency: destination, amount, active: 'S' }, signal, retry: 0,
    }));
    return { exchange: result.exchange, rate: result.rate, savings: result.savings?.amount ?? null };
  } catch (error) { if (signal?.aborted || isAbortError(error)) throw error; throw new Error(errorMessage(error)); }
}

