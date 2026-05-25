/**
 * CashTrack — useAnalytics Hook
 * Manages month/year selection and fetches analytics data.
 */

import { useState, useEffect, useCallback } from 'react';
import * as expenseService from '../services/expenseService';

const useAnalytics = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, cRes, yRes] = await Promise.allSettled([
        expenseService.getMonthlyAnalytics(year),
        expenseService.getCategoryAnalytics(month, year),
        expenseService.getYearlySummary(),
      ]);
      if (mRes.status === 'fulfilled') setMonthlyData(mRes.value);
      if (cRes.status === 'fulfilled') setCategoryData(cRes.value);
      if (yRes.status === 'fulfilled') setYearlyData(yRes.value);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    year,
    month,
    setYear,
    setMonth,
    monthlyData,
    categoryData,
    yearlyData,
    loading,
    error,
    refresh: fetchAnalytics,
  };
};

export default useAnalytics;
