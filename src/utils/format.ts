import { Currency } from '../types';

const PHP_TO_USD_RATE = 57.5;

export function formatPrice(pricePhp: number, currency: Currency): string {
  if (currency === 'USD') {
    const usd = pricePhp / PHP_TO_USD_RATE;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usd);
  }

  return (
    '₱' +
    new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pricePhp)
  );
}
