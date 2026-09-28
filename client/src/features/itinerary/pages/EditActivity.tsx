import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActivityForm } from '../components/ActivityForm';
import { itineraryApi } from '../api/itinerary.api';
import { CreateActivityRequest, UpdateActivityRequest, IActivity } from '../types/itinerary.types';

export const EditActivity: React.FC = () => {
  const { id, activityId } = useParams<{ id: string; activityId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<Partial<CreateActivityRequest> | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id || !activityId) return;
      try {
        const days = await itineraryApi.getItinerary(id);
        
        let foundActivity: IActivity | null = null;
        for (const day of days) {
          const act = day.activities?.find((a: IActivity) => a._id === activityId);
          if (act) { foundActivity = act; break; }
        }

        if (foundActivity) {
          setInitialData({
            title: foundActivity.title,
            description: foundActivity.description,
            category: foundActivity.category,
            priority: foundActivity.priority,
            bookingUrl: foundActivity.bookingUrl,
            orderIndex: foundActivity.orderIndex
          });
        } else {
          setError('Activity not found in this itinerary.');
        }

      } catch (err) {
        setError('Failed to fetch activity data.');
      }
    };
    fetchActivity();
  }, [id, activityId]);

  const handleSubmit = async (data: CreateActivityRequest) => {
    if (!activityId) return;
    setIsLoading(true);
    try {
      await itineraryApi.updateActivity(activityId, data as UpdateActivityRequest);
      navigate(`/dashboard/trips/${id}/itinerary`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update activity.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) return <div className="p-10 font-bold bg-red-500/10 text-red-500 backdrop-blur-xl border border-red-500/20 rounded-[3rem] max-w-3xl mx-auto">{error}</div>;
  if (!initialData) return <div className="p-10 text-slate-500 font-bold uppercase tracking-widest text-center max-w-3xl mx-auto animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs mb-6 flex items-center font-black tracking-widest uppercase transition-colors"
        >
          <span className="mr-2 text-lg">←</span> Cancel
        </button>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Edit Activity</h1>
      </div>

      <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl">
        <ActivityForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};
