import { supabase } from './supabase';

interface RootMeStats {
  challenges: number;
  points: number;
  rank: string;
}

// Static stats instead of API fetching
export async function fetchRootMeStats(): Promise<RootMeStats> {
  return {
    challenges: 41,
    points: 730,
    rank: '20966'
  };
}