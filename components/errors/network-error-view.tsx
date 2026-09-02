'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Wifi, RefreshCw } from 'lucide-react';
import { ErrorView, ErrorAction } from './error-view';

export interface NetworkErrorViewProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export function NetworkErrorView({
  onRetry,
  title = 'No Internet Connection',
  description = 'Unable to connect to church servers. Please check your network connection or Wi-Fi settings and try again.',
  className,
}: NetworkErrorViewProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        if (onRetry) onRetry();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [onRetry]);

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
      setIsChecking(false);
      if (online && onRetry) {
        onRetry();
      }
    }, 600);
  };

  const primaryAction: ErrorAction = {
    label: isChecking ? 'Checking Connection...' : 'Check Connection & Retry',
    onClick: onRetry || handleManualCheck,
    icon: isChecking ? RefreshCw : RotateCcw,
  };

  return (
    <ErrorView
      variant="network"
      title={isOnline ? 'Connection Timed Out' : title}
      description={
        isOnline
          ? 'The server took too long to respond. Please check your signal strength and retry.'
          : description
      }
      primaryAction={primaryAction}
      className={className}
    />
  );
}
