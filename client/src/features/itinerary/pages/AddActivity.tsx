import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActivityForm } from '../components/ActivityForm';
import { itineraryApi } from '../api/itinerary.api';
import { CreateActivityRequest } from '../types/itinerary.types';

export const AddActivity: React.FC = () => {
  const { id, dayId } = useParams<{ id: string; dayId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateActivityRequest) => {
    if (!dayId) return;
    setIsLoading(true);
    try {
      await itineraryApi.createActivity(dayId, data);
      navigate(`/dashboard/trips/${id}/itinerary`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add activity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs mb-6 flex items-center font-black tracking-widest uppercase transition-colors"
        >
          <span className="mr-2 text-lg">←</span> Cancel
        </button>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Add New Activity</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Plan your stops, meals, or flights.</p>
      </div>

      {error && <div className="mb-8 p-5 bg-red-500/10 backdrop-blur-md text-red-600 rounded-[2rem] border border-red-500/20 shadow-lg font-bold">{error}</div>}

      <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl">
        <ActivityForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};
