import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const DayView: React.FC = () => {
  const { id, dayId } = useParams<{ id: string; dayId: string }>();

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[3rem] mt-12 shadow-2xl text-center">
      <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-3">Isolated Day View</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
        This view isolates a single day explicitly for printing or sharing.
      </p>
      <div className="bg-blue-500/10 backdrop-blur-md text-blue-700 dark:text-blue-400 p-5 rounded-[1.5rem] inline-block border border-blue-500/20 shadow-inner">
        <span className="text-sm uppercase tracking-widest font-black mr-3">Day ID</span>
        <span className="font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm font-bold">{dayId}</span>
      </div>
      
      <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link to={`/dashboard/trips/${id}/itinerary`} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-sm">
          Return to full Timeline
        </Link>
      </div>
    </div>
  );
};
