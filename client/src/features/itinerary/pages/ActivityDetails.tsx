import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const ActivityDetails: React.FC = () => {
  const { id, activityId } = useParams<{ id: string; activityId: string }>();

  return (
    <div className="max-w-3xl mx-auto p-12 bg-white border border-slate-200 rounded-3xl mt-12 shadow-sm">
      <Link to={`/dashboard/trips/${id}/itinerary`} className="text-slate-500 hover:text-slate-800 text-sm mb-6 inline-block font-medium">
        ← Back to Itinerary
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-3">Activity Deep Dive</h1>
      <p className="text-slate-500 text-lg mb-8 leading-relaxed">
        Future integration point for Activity {activityId}. Google Maps galleries, opening hours, live weather blocks, and restaurant booking embeds belong here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-2xl mb-3 block">🗺️</span>
          <h3 className="font-bold text-slate-700">Map Routing</h3>
          <p className="text-sm text-slate-500 mt-1">Placeholder for Polyline renders and Google Maps API.</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-2xl mb-3 block">⛅</span>
          <h3 className="font-bold text-slate-700">Weather Module</h3>
          <p className="text-sm text-slate-500 mt-1">Placeholder to fetch live forecasts matching the date.</p>
        </div>
      </div>
    </div>
  );
};
