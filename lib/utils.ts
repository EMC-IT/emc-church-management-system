import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency utilities
export const CURRENCIES = {
  GHS: {
    code: 'GHS',
    name: 'Ghana Cedi',
    symbol: '₵',
    position: 'before' as const,
    decimalPlaces: 2,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '₵',
    position: 'before' as const,
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    position: 'before' as const,
    decimalPlaces: 2,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    position: 'before' as const,
    decimalPlaces: 2,
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    position: 'before' as const,
    decimalPlaces: 2,
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    position: 'before' as const,
    decimalPlaces: 2,
  },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'GHS',
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
  }
): string {
  const currency = CURRENCIES[currencyCode];
  const { showSymbol = true, showCode = false } = options || {};
  
  // Format the number with proper decimal places
  const formattedNumber = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(amount);
  
  if (showSymbol && showCode) {
      return `${currency.symbol}${formattedNumber} (${currency.code})`;
  } else if (showSymbol) {
    return `${currency.symbol}${formattedNumber}`;
  } else if (showCode) {
      return `${formattedNumber} ${currency.code}`;
  } else {
    return formattedNumber;
  }
}

export function getCurrencyOptions() {
  return Object.entries(CURRENCIES).map(([code, currency]) => ({
    value: code,
    label: `${currency.name} (${currency.symbol})`,
  }));
}
