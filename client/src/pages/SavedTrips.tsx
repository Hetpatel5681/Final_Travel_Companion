import { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { RecommendationCard } from '../features/destination/components/RecommendationCard';
import { getUserInteractions, UserInteraction } from '../features/destination/api/interaction.api';

export function SavedTrips() {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = async () => {
    try {
      const data = await getUserInteractions();
      setInteractions(data || []);
    } catch (err) {
      console.error('Failed to fetch interactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  const savedDestinations = useMemo(() => {
    const savedDestMap = new Map<string, any>();

    // The backend `getUserInteractions` endpoint returns interactions ordered DESC (newest first).
    // To rebuild state correctly, we must process them chronologically (oldest to newest).
    // This allows a SAVE to persist even if a VIEW happens later, while correctly respecting a subsequent UNSAVE.
    [...interactions].reverse().forEach(record => {
      if (!record.destinationId || typeof record.destinationId === 'string') return;

      const destId = record.destinationId._id;
      if (record.interactionType === 'SAVE') {
        // Normalizing into Recommendation interface shape without cosine scores natively
        savedDestMap.set(destId, {
          ...record.destinationId,
          destinationId: destId,
          similarityScore: 0 // Match score omitted safely
        });
      } else if (record.interactionType === 'UNSAVE') {
        savedDestMap.delete(destId);
      }
    });

    return Array.from(savedDestMap.values());
  }, [interactions]);

  const handleInteractionUpdate = () => {
    // Re-fetch interactions silently so the card removes if un-saved
    fetchInteractions();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Saved Destinations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-200 h-[400px] rounded-xl flex-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Saved Destinations</h1>
        <p className="text-slate-600">Your personalized collection of bookmarked travel inspiration.</p>
      </div>
      
      {savedDestinations.length === 0 ? (
         <Card className="col-span-full">
           <div className="py-12 text-center text-slate-500">
             No saved destinations yet.<br/>
             Save destinations from your recommendations and they will appear here.
           </div>
         </Card>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           {savedDestinations.map(dest => (
             <RecommendationCard 
               key={dest.destinationId}
               recommendation={dest}
               isSaved={true}
               onInteractionSuccess={handleInteractionUpdate}
             />
           ))}
         </div>
      )}
    </div>
  );
}
