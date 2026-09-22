import { CURRENCIES } from '../data/sareesData';

export function formatPrice(priceInINR: number, currencyCode: string = 'INR'): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = priceInINR * currency.rateFromINR;
  
  if (currency.code === 'INR') {
    return `${currency.symbol}${converted.toLocaleString('en-IN')}`;
  }
  
  return `${currency.symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
