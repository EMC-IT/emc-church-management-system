'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, CURRENCIES } from '@/lib/utils';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatAmount: (amount: number, options?: { showSymbol?: boolean; showCode?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('GHS');

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency') as CurrencyCode;
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
    // Optional: You can add a toast notification here if you want immediate feedback
  };

  const formatAmount = (amount: number, options?: { showSymbol?: boolean; showCode?: boolean }) => {
    const currencyInfo = CURRENCIES[currency];
    const { showSymbol = true, showCode = false } = options || {};
    
    // Format the number with proper decimal places
    const formattedNumber = new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: currencyInfo.decimalPlaces,
      maximumFractionDigits: currencyInfo.decimalPlaces,
    }).format(amount);
    
    if (showSymbol && showCode) {
        return `${currencyInfo.symbol}${formattedNumber} (${currencyInfo.code})`;
    } else if (showSymbol) {
        return `${currencyInfo.symbol}${formattedNumber}`;
    } else if (showCode) {
          return `${formattedNumber} ${currencyInfo.code}`;
    } else {
      return formattedNumber;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}