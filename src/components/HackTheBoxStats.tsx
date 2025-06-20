import React from 'react';
import { Shield, Target, Award } from 'lucide-react';

export const HackTheBoxStats: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = import.meta.env.VITE_HTB_API_TOKEN;
        if (!token) {
          throw new Error('Token API manquant');
        }

        const response = await fetch('https://www.hackthebox.com/api/v4/profile/progress/machines/os', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20">
        <div className="flex items-center justify-center space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-[#9FEF00] rounded-full"></div>
          <div className="w-3 h-3 bg-[#9FEF00] rounded-full"></div>
          <div className="w-3 h-3 bg-[#9FEF00] rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1f] p-6 rounded-lg border border-red-500/20">
        <div className="flex items-center gap-3 text-red-400">
          <Shield className="w-8 h-8" />
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-[#1a1a1f] p-6 rounded-lg border border-violet-900/20 hover:border-violet-500/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-[#9FEF00]" />
        <h3 className="text-xl font-bold">HackTheBox Progress</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#9FEF00]" />
            <span className="text-sm text-gray-400">Linux Machines</span>
          </div>
          <p className="text-xl font-bold">{stats.linux?.owned ?? 0}</p>
        </div>

        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#9FEF00]" />
            <span className="text-sm text-gray-400">Windows Machines</span>
          </div>
          <p className="text-xl font-bold">{stats.windows?.owned ?? 0}</p>
        </div>

        <div className="bg-[#2a2a2f] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-[#9FEF00]" />
            <span className="text-sm text-gray-400">Total Machines</span>
          </div>
          <p className="text-xl font-bold">
            {(stats.linux?.owned ?? 0) + (stats.windows?.owned ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
};