import React from 'react';
import { IActivity } from '../types/itinerary.types';

interface OptimizeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  improvementPercentage: number;
  optimizedOrder: IActivity[];
  activitiesWithoutCoordinates: IActivity[];
  routingSource?: string;
  isApplying?: boolean;
}

export const OptimizeRouteModal: React.FC<OptimizeRouteModalProps> = ({
  isOpen, onClose, onApply, originalDistanceKm, optimizedDistanceKm, distanceSavedKm, improvementPercentage, optimizedOrder, activitiesWithoutCoordinates, routingSource, isApplying
}) => {
  if (!isOpen) return null;

  const isRoadRoute = routingSource === 'osrm' || routingSource === 'serpapi';
  const labelCurrent = isRoadRoute ? 'Current Road Route' : 'Current Geographic Est.';
  const labelOptimized = isRoadRoute ? 'Optimized Road Route' : 'Optimized Geographic Est.';
  const distanceStr = distanceSavedKm === 0 ? '0' : distanceSavedKm.toString();
  const improveType = isRoadRoute ? 'Road distance' : 'Haversine';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">✨ AI Route Optimization</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{labelCurrent}</p>
              <p className="text-xl font-semibold text-slate-700">{Math.round(originalDistanceKm)} km</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">{labelOptimized}</p>
              <p className="text-xl font-bold text-blue-700">{Math.round(optimizedDistanceKm)} km</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8 bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
            <div className="bg-green-100 p-2 rounded-full">
              📍
            </div>
            <div>
              <p className="font-bold">Distance saved ({improveType}): {distanceStr} km</p>
              <p className="text-sm font-medium">Improvement: {improvementPercentage}%</p>
            </div>
          </div>

          <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
            Optimized Sequence
          </h3>
          <div className="space-y-2 mb-6">
            {optimizedOrder.map((act, idx) => (
              <div key={act._id} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-700 truncate">{act.title}</span>
              </div>
            ))}
          </div>

          {activitiesWithoutCoordinates.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <p className="text-amber-800 font-medium text-sm">
                ⚠️ {activitiesWithoutCoordinates.length} {activitiesWithoutCoordinates.length === 1 ? 'activity' : 'activities'} could not be included because location data is unavailable.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onApply}
            disabled={isApplying}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:bg-blue-400 disabled:active:scale-100"
          >
            {isApplying ? 'Applying...' : 'Apply Optimization'}
          </button>
        </div>
      </div>
    </div>
  );
};
