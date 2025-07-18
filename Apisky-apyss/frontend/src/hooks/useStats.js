import { useState, useEffect } from 'react';
import { statsService } from '../services/api';

export function useStats() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [historyStats, setHistoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashData = await statsService.getDashboardStats();
        setDashboardStats(dashData);
        const histData = await statsService.getHistoryStats();
        setHistoryStats(histData);
      } catch (err) {
        setError('Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { dashboardStats, historyStats, loading, error };
}


