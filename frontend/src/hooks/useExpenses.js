/**
 * CashTrack — useExpenseHook
 * Convenience hook wrapping ExpenseContext with extra helpers.
 */

import { useCallback, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';

const useExpenseHook = () => {
  const ctx = useExpenses();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (filters) => {
    setRefreshing(true);
    try {
      await ctx.fetchExpenses(filters);
    } finally {
      setRefreshing(false);
    }
  }, [ctx.fetchExpenses]);

  return {
    ...ctx,
    refreshing,
    refresh,
  };
};

export default useExpenseHook;
