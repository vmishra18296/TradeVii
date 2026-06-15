'use client';

import { useEffect } from 'react';
import { listenTrades, listenInvestors } from '@/lib/database';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Hook that sets up real-time Firebase listeners for trades and investors.
 * Call once in the dashboard layout.
 */
export function useFirebaseData() {
  const { setTrades, setInvestors, setLoading } = useAppStore();

  useEffect(() => {
    setLoading(true);

    const unsubTrades = listenTrades((trades) => {
      setTrades(trades);
      setLoading(false);
    });

    const unsubInvestors = listenInvestors((investors) => {
      setInvestors(investors);
    });

    return () => {
      unsubTrades();
      unsubInvestors();
    };
  }, [setTrades, setInvestors, setLoading]);
}
