import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../lib/analytics';

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  // This component doesn't render anything
  return null;
};