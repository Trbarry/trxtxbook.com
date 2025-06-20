import React, { useEffect } from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

export const AnalyticsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0a0a0f]">
      <div className="container mx-auto px-6">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};