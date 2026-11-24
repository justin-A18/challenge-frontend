import { afterEach, describe, expect, it, vi } from 'vitest';
import { KAMBISTA_ENDPOINTS } from '../../../app/shared/constants/api';
import {
  calculateExchange,
  getExchangeRates,
} from '../../../app/modules/transactions/services/exchange.service';

afterEach(() => vi.unstubAllGlobals());

describe('Servicio de cotización', () => {
  it('consulta las tasas desde el endpoint público de Kambista', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ bid: '3.428', ask: 3.467 });
    vi.stubGlobal('$fetch', fetchMock);

    await expect(getExchangeRates()).resolves.toEqual({ bid: 3.428, ask: 3.467 });
    expect(fetchMock).toHaveBeenCalledWith(KAMBISTA_ENDPOINTS.currentExchange, {
      signal: undefined,
      retry: 0,
    });
  });

  it('envía los parámetros de cálculo al endpoint público de Kambista', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      exchange: 342.8,
      rate: 3.428,
      savings: { amount: '5.14', currency: 'S/' },
    });
    vi.stubGlobal('$fetch', fetchMock);

    await expect(calculateExchange(100, 'USD', 'PEN')).resolves.toEqual({
      exchange: 342.8,
      rate: 3.428,
      savings: 5.14,
    });
    expect(fetchMock).toHaveBeenCalledWith(KAMBISTA_ENDPOINTS.calculateExchange, {
      query: {
        originCurrency: 'USD',
        destinationCurrency: 'PEN',
        amount: 100,
        active: 'S',
      },
      signal: undefined,
      retry: 0,
    });
  });
});
