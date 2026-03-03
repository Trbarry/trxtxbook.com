import useSWR from 'swr';
import { supabase } from '../lib/supabase';

export function useWikiTip(pageId: string) {
  const { data: likes, error: likesError, mutate: mutateLikes } = useSWR(['wiki_likes', pageId], async () => {
    const { data, error } = await supabase
      .from('wiki_pages')
      .select('likes')
      .eq('id', pageId)
      .single();
    
    if (error) throw error;
    return data?.likes || 0;
  });

  const { data: hasLiked, error: voteError, mutate: mutateVote } = useSWR(['wiki_vote', pageId], async () => {
    // 1. Check localStorage first
    const localKey = `wiki_voted_${pageId}`;
    if (localStorage.getItem(localKey)) {
      return { hasLiked: true, ip: 'stored' };
    }

    // 2. Check IP via backend
    let ip = 'unknown';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        ip = ipData.ip;
      }
    } catch (err) {
      console.error('Failed to fetch IP:', err);
    }

    if (ip === 'unknown') {
      return { hasLiked: false, ip: null };
    }

    const { data } = await supabase
      .from('wiki_votes')
      .select('id')
      .eq('page_id', pageId)
      .eq('user_ip', ip)
      .maybeSingle();
    
    if (data) {
      localStorage.setItem(localKey, 'true');
    }
    
    return { hasLiked: !!data, ip };
  });

  const vote = async () => {
    if (hasLiked?.hasLiked || !hasLiked?.ip) return;

    // Optimistic update
    mutateLikes((current: number | undefined) => (current || 0) + 1, false);
    mutateVote({ hasLiked: true, ip: hasLiked.ip }, false);
    
    // Store in localStorage immediately
    localStorage.setItem(`wiki_voted_${pageId}`, 'true');

    try {
      const { error } = await supabase.rpc('vote_for_page', { 
        target_page_id: pageId, 
        target_ip: hasLiked.ip 
      });
      if (error) throw error;
    } catch (err) {
      // Rollback on error
      mutateLikes();
      mutateVote();
      throw err;
    }
  };

  return {
    likes,
    hasLiked: hasLiked?.hasLiked,
    userIp: hasLiked?.ip,
    vote,
    isLoading: !likes && !likesError
  };
}
