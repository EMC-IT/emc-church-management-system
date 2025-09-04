'use client';

import { useCurrency } from '@/lib/contexts/currency-context';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  className?: string;
}

export function CurrencyDisplay({ 
  amount, 
  currency,
  showSymbol = true, 
  showCode = false, 
  className = "" 
}: CurrencyDisplayProps) {
  const { formatAmount } = useCurrency();
  
  return (
    <span className={className}>
      {formatAmount(amount, { showSymbol, showCode })}
    </span>
  );
}