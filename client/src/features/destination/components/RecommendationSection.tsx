import { useEffect, useState, useRef } from 'react';
import { Recommendation, getRecommendations } from '../api/recommendation.api';
import { getUserInteractions } from '../api/interaction.api';
import { RecommendationCard } from './RecommendationCard';
import { Card } from '../../../components/Card';

export function RecommendationSection() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;
    const fetchRecs = async () => {
      try {
        const [recsResult, historyResult] = await Promise.allSettled([
          getRecommendations(5),
          getUserInteractions()
        ]);
        
        if (mounted) {
           if (recsResult.status === 'fulfilled') {
             setRecommendations(recsResult.value);
             setError(false);
           } else {
             throw recsResult.reason;
           }

           if (historyResult.status === 'fulfilled') {
             const likes = new Set<string>();
             const dislikes = new Set<string>();
             const saves = new Set<string>();
             
             // The backend `getUserInteractions` endpoint returns interactions ordered DESC (newest first).
             // To rebuild state correctly, we must process them chronologically (oldest to newest) 
             // to prevent older states from overwriting newer states.
             [...historyResult.value].reverse().forEach(int => {
                 const id = typeof int.destinationId === 'object' ? (int.destinationId as any)._id : int.destinationId;
                 if (int.interactionType === 'LIKE') { likes.add(id); dislikes.delete(id); }
                 if (int.interactionType === 'DISLIKE') { dislikes.add(id); likes.delete(id); }
                 if (int.interactionType === 'SAVE') { saves.add(id); }
                 if (int.interactionType === 'UNSAVE') { saves.delete(id); }
             });
             
             setLikedIds(likes);
             setDislikedIds(dislikes);
             setSavedIds(saves);
           } else {
             console.error("History fetch failed, continuing without history", historyResult.reason);
           }
        }
      } catch (err: any) {
        if (mounted) {
          console.error("Recommendations API block:", err);
          setError(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchRecs();
    return () => { mounted = false; };
  }, []);

  const handleInteractionSuccess = async () => {
    try {
      const data = await getRecommendations(5);
      setRecommendations(data);
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  if (error) {
    return (
      <div className="mt-12 text-sm text-slate-500 p-4 border border-red-50 rounded-lg bg-red-50/20 text-center">
        Unable to load recommendations right now.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-6 px-1">Recommended for You</h3>
        <div className="flex overflow-x-auto pb-6 -mx-1 px-1 gap-6 snap-x">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="min-w-[280px] max-w-[300px] h-[380px] snap-center animate-pulse bg-slate-100 border-none shadow-sm rounded-2xl flex-shrink-0">
              <div />
            </Card>

          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-6 px-1">Recommended for You</h3>
        <Card className="border-none shadow-sm bg-indigo-50/30">
          <div className="text-center py-10 text-indigo-400 font-medium tracking-wide">
            Keep exploring to get personalized recommendations.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-slate-800 mb-6 px-1">Recommended for You</h3>
      <div className="flex overflow-x-auto pb-6 -mx-1 px-1 gap-6 snap-x custom-scrollbar">
        {recommendations.map((rec) => (
          <div key={rec.destinationId} className="min-w-[280px] max-w-[300px] snap-center flex-shrink-0">
            <RecommendationCard 
               recommendation={rec} 
               isLiked={likedIds.has(rec.destinationId)}
               isDisliked={dislikedIds.has(rec.destinationId)}
               isSaved={savedIds.has(rec.destinationId)}
               onInteractionSuccess={handleInteractionSuccess}
            />
          </div>
        ))}
      </div>
      
      {/* Small inline style for hiding brutal scrollbar on desktop */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
