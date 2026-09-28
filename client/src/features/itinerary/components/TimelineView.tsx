import React from 'react';
import { IItineraryDay } from '../types/itinerary.types';
import { DayCard } from './DayCard';

interface TimelineViewProps {
  days?: IItineraryDay[];
  isLoading?: boolean;
  tripCompletionPercentage?: number;
  onClickActivity: (activity: any) => void;
  onAddActivity: (dayId: string) => void;
  onEditActivity: (activityId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  onToggleStatus: (activityId: string, status: string) => void;
  onOptimizeRoute?: (dayId: string) => void;
  dayRoutes?: Record<string, any>;
  optimizingDayId?: string | null;
  tripDestination?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  days,
  isLoading = false,
  tripCompletionPercentage = 0,
  onClickActivity,
  onAddActivity, 
  onEditActivity, 
  onDeleteActivity,
  onToggleStatus,
  onOptimizeRoute,
  dayRoutes,
  optimizingDayId,
  tripDestination
}) => {
  const safeDays = days || [];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Loading itinerary...
        </div>
      </div>
    );
  }

  if (safeDays.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-dashed border-white/20 p-12 text-center text-slate-500 font-bold uppercase tracking-widest shadow-2xl">
          No itinerary days found.
        </div>
      </div>
    );
  }

  const filteredDays = safeDays.filter(day => {
    // Keep it if it has activities
    if (day.activities && day.activities.length > 0) return true;
    // Keep it if it's empty BUT there are no other days with the same dayNumber
    const hasPopulatedSibling = safeDays.some(d => d.dayNumber === day.dayNumber && d._id !== day._id && d.activities && d.activities.length > 0);
    return !hasPopulatedSibling;
  });

  return (
    <div className="w-full">
      {/* Trip Progress UI */}
      <div className="mb-8 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-[3rem] p-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-white drop-shadow-md">Trip Progress</h3>
          <span className="text-sm font-medium text-white/70">
             {safeDays?.reduce((sum, day) => sum + (day.completedActivities || 0), 0)} / {safeDays?.reduce((sum, day) => sum + (day.totalActivities || 0), 0)} activities completed
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-full bg-white/10 rounded-full h-3 border border-white/20 shadow-inner">
             <div className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${tripCompletionPercentage}%` }}></div>
          </div>
          <span className="font-mono text-sm font-bold text-white w-12 text-right">{tripCompletionPercentage}%</span>
        </div>
      </div>

      <div className="space-y-6">
      {filteredDays.map((day, index) => (
        <div key={day._id} className="w-full">
            <DayCard 
              tripDestination={tripDestination}
              day={day} 
              isExpandedByDefault={index === 0}
              onClickActivity={onClickActivity}
              onAddActivity={onAddActivity}
              onEditActivity={onEditActivity}
              onDeleteActivity={onDeleteActivity}
              onToggleStatus={onToggleStatus}
              onOptimizeRoute={onOptimizeRoute}
              routeData={dayRoutes ? dayRoutes[day._id] : null}
              optimizingDayId={optimizingDayId}
            />
        </div>
      ))}
      </div>
    </div>
  );
};
