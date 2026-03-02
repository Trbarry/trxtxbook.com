import useSWR from 'swr';
import { useAnalytics, AnalyticsData } from '../lib/analytics';

export function useAnalyticsData() {
  const { getAnalytics } = useAnalytics();

  const { data, error, isLoading, mutate } = useSWR<AnalyticsData | null>(
    'analytics_data',
    async () => {
      return await getAnalytics();
    },
    {
      refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes as in the original component
      revalidateOnFocus: true
    }
  );

  return {
    analyticsData: data,
    error,
    isLoading,
    mutate
  };
}
