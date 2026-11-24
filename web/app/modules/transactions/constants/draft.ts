import type { Currency } from '~/shared/constants/currencies';

export const DEFAULT_QUOTE_DRAFT = {
  amount: 10000,
  origin: 'USD' as Currency,
  destination: 'PEN' as Currency,
} as const;
