import React, { useState, useEffect } from 'react';
import { IItineraryDay, IActivity } from '../types/itinerary.types';
import { ActivityCard } from './ActivityCard';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { itineraryApi } from '../api/itinerary.api';
import { formatCurrency } from '../../../utils/currency.utils';
import { isValidCoordinate } from '../pages/ItineraryTimeline';

interface DayCardProps {
  day: IItineraryDay;
  isExpandedByDefault?: boolean;
  onClickActivity: (activity: any) => void;
  onAddActivity: (dayId: string) => void;
  onEditActivity: (activityId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  onToggleStatus: (activityId: string, status: string) => void;
  onOptimizeRoute?: (dayId: string) => void;
  routeData?: any;
  optimizingDayId?: string | null;
  tripDestination?: string;
}

function getHaversineDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(1));
}

interface SortableActivityItemProps {
  activity: IActivity;
  onClickActivity: (activity: IActivity) => void;
  onEditActivity: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  nextSegment?: { distanceKm: number, durationMinutes: number } | null;
  routingSource?: string | null;
  isLast?: boolean;
  tripDestination?: string;
}

const SortableActivityItem = React.memo<SortableActivityItemProps>(({ activity, onClickActivity, onEditActivity, onDeleteActivity, onToggleStatus, nextSegment, isLast, tripDestination }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.2, 0, 0, 1)',
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
    touchAction: 'none'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative pl-8 pt-4 first:pt-0">
      {/* Structural left timeline rail connecting nodes vertically */}
      <div className="absolute left-0 top-8 bottom-0 w-8 flex flex-col items-center">
         <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white z-10 shadow-sm shrink-0"></div>
         {!isLast && <div className="w-[2px] h-full bg-slate-300 mt-1"></div>}
      </div>

      <ActivityCard 
        tripDestination={tripDestination}
        activity={activity} 
        isDragging={isDragging}
        onClick={onClickActivity}
        onEdit={onEditActivity}
        onDelete={onDeleteActivity}
        onToggleStatus={onToggleStatus}
      />

      {/* Visual physical distance branch inside the day card */}
      {!isLast && (
        <div className="flex items-center -ml-2 py-4 opacity-95 relative z-0">
           <div className="text-slate-500 text-[13px] font-medium flex items-center ml-8 py-1">
             <span className="text-slate-400 mr-2">↓</span>
             {nextSegment ? (
                 nextSegment.durationMinutes 
                   ? `${nextSegment.distanceKm} km • ${nextSegment.durationMinutes} min` 
                   : `${nextSegment.distanceKm} km • Estimated`
             ) : (
                 <span className="text-slate-400 italic">No connection data</span>
             )}
           </div>
        </div>
      )}
    </div>
  );
});

export const DayCard: React.FC<DayCardProps> = React.memo(({ day, isExpandedByDefault, onClickActivity, onAddActivity, onEditActivity, onDeleteActivity, onToggleStatus, onOptimizeRoute, routeData, optimizingDayId, tripDestination }) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedByDefault ?? false);
  const safeActivities = day.activities || [];
  const [activities, setActivities] = useState(safeActivities);

  useEffect(() => {
    setActivities(day.activities || []);
  }, [day.activities]);

  const displayDate = new Date(day.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       const oldIndex = activities.findIndex(a => a._id === active.id);
       const newIndex = activities.findIndex(a => a._id === over.id);
       
       const newActivities = [...(activities || [])];
       const [movedItem] = newActivities.splice(oldIndex, 1);
       newActivities.splice(newIndex, 0, movedItem);
       setActivities(newActivities);

       try {
         await itineraryApi.reorderActivities(day._id, { activityIds: newActivities.map(a => a._id) });
       } catch (err) {
         setActivities(day.activities || []);
       }
    }
  };

  // Convert duration (mins) into readable format
  const hours = Math.floor((day.totalDuration || 0) / 60);
  const mins = (day.totalDuration || 0) % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl mb-6">
      <div 
        className="bg-white/5 dark:bg-slate-900/20 border-b border-white/20 dark:border-white/10 px-8 py-6 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <button className="text-white/60 hover:text-white font-mono text-xl w-6">
            {isExpanded ? '−' : '+'}
          </button>
          <div>
            <h3 className="font-bold text-lg text-white tracking-tight">
              Day {day.dayNumber}: {day.title}
            </h3>
            <p className="text-sm text-white/70 mt-0.5">{displayDate}</p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddActivity(day._id); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          + Add Activity
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-8 bg-black/5 dark:bg-white/5 border-b border-white/20 dark:border-white/10 text-sm font-semibold tracking-wider text-slate-700 dark:text-slate-300">
             <div className="flex items-center gap-4">
                <span>Activities: <strong>{day.totalActivities || 0}</strong></span>
                <span>Completed: <strong>{day.completedActivities || 0}</strong></span>
                <span>Duration: <strong>{durationStr}</strong></span>
             </div>
             <div className="flex items-center gap-4">
                <span>Estimated Cost: <strong className="text-emerald-300">{formatCurrency((day.totalTicketCost || 0) + (day.totalEstimatedExpenses || 0), 'INR')}</strong></span>
                {onOptimizeRoute && day.activities && day.activities.length > 1 && (
                  <button 
                    onClick={() => onOptimizeRoute(day._id)} 
                    disabled={optimizingDayId === day._id}
                    className="ml-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider rounded border border-purple-200 transition-colors disabled:opacity-50"
                  >
                    {optimizingDayId === day._id ? 'Analyzing...' : '✨ Optimize Route'}
                  </button>
                )}
             </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className={`w-full bg-slate-200 rounded-full h-2.5 mb-4`}>
               <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${day.completionPercentage || 0}%` }}></div>
            </div>
            
            {activities && activities.length > 0 ? (
              <div className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={activities.map(a => a._id)} strategy={verticalListSortingStrategy}>
                    {activities.map((activity, index) => {
                      let segment = routeData?.segments?.find((s: any) => s.fromActivityId === activity._id);
                      let internalSource = routeData?.routingSource;
                      
                      if (!segment && index < activities.length - 1) {
                         const nextAct = activities[index + 1];
                         if (isValidCoordinate(activity.location?.latitude, activity.location?.longitude) && isValidCoordinate(nextAct.location?.latitude, nextAct.location?.longitude)) {
                            segment = {
                               distanceKm: getHaversineDistanceInKm(activity.location!.latitude!, activity.location!.longitude!, nextAct.location!.latitude!, nextAct.location!.longitude!),
                               durationMinutes: 0
                            };
                            internalSource = 'haversine';
                         }
                      }

                      return (
                        <SortableActivityItem 
                          key={activity._id} 
                          activity={activity} 
                          onClickActivity={onClickActivity}
                          onEditActivity={onEditActivity}
                          onDeleteActivity={onDeleteActivity}
                          onToggleStatus={onToggleStatus}
                          nextSegment={segment}
                          isLast={index === activities.length - 1}
                          tripDestination={tripDestination}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <div className="text-center py-10 bg-white/5 backdrop-blur-md border-2 border-white/20 border-dashed rounded-[2rem] flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 border border-white/20 text-white/80 rounded-full flex items-center justify-center text-2xl mb-3">📅</div>
                <p className="text-white/60 font-medium mb-4">No activities planned for this day yet.</p>
                <button 
                  onClick={() => onAddActivity(day._id)}
                  className="bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  + Add your first activity
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
