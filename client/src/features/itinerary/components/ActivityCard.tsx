import React from 'react';
import { IActivity } from '../types/itinerary.types';
import { formatCurrency } from '../../../utils/currency.utils';
import { getCategoryIcon } from '../utils/categoryIcons.utils';

interface ActivityCardProps {
  activity: IActivity;
  isDragging?: boolean;
  onClick: (activity: IActivity) => void;
  onEdit: (activityId: string) => void;
  onDelete: (activityId: string) => void;
  onToggleStatus: (activityId: string, status: string) => void;
  tripDestination?: string;
}

export const ActivityCard = React.memo<ActivityCardProps>(({ activity, isDragging, onClick, onEdit, onDelete, onToggleStatus, tripDestination }) => {

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Must-Do': return 'bg-red-100 text-red-700';
      case 'Backup': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const isCompleted = activity.status === 'Completed';

  return (
    <div 
      className={`bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 relative group flex items-start justify-between transition-all duration-500 ease-out shadow-xl
        ${isCompleted ? 'opacity-70 grayscale-[0.3]' : ''}
        ${isDragging ? 'shadow-2xl shadow-blue-500/20 scale-[1.03] cursor-grabbing border-blue-400 !opacity-80 ring-4 ring-blue-500/20' : 'hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:-translate-y-2 hover:border-white/30 cursor-grab'}
      `}
      onClick={() => onClick(activity)}
    >
       <div className="flex justify-between items-start w-full">
           <div className="flex gap-4 items-start w-full">
           <div className="pt-1" onClick={e => e.stopPropagation()}>
             <input 
               type="checkbox" 
               checked={isCompleted}
               onChange={() => onToggleStatus(activity._id, isCompleted ? 'Pending' : 'Completed')}
               className="w-5 h-5 cursor-pointer rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors"
             />
           </div>
           
           <div className="text-2xl mt-0.5">{getCategoryIcon(activity.category)}</div>
           <div>
             <h4 className={`font-semibold ${isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>{activity.title}</h4>
             <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-white/30 line-through' : 'text-white/80'}`}>{activity.description}</p>
             
             <div className="flex flex-wrap gap-2 mt-3">
               <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                 {activity.startTime?.toString() || 'Anytime'} 
                 {activity.endTime ? ` - ${activity.endTime.toString()}` : ''}
               </span>
               <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPriorityColor(activity.priority)}`}>
                 {activity.priority}
               </span>
               <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                 activity.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                 activity.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                 activity.status === 'Pending' ? 'bg-slate-100 text-slate-700' :
                 'bg-yellow-100 text-yellow-700'
               }`}>
                 {activity.status}
               </span>
               {activity.location?.address && (
                 <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                   {activity.location.address}
                 </span>
               )}
               {activity.ticketPrice !== undefined && activity.ticketPrice > 0 && (
                 <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md">
                   {formatCurrency(activity.ticketPrice, activity.currency)}
                 </span>
               )}
               {activity.estimatedDuration !== undefined && activity.estimatedDuration > 0 && (
                 <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                   {activity.estimatedDuration} min
                 </span>
               )}
             </div>

             <div className="mt-4 flex items-center">
                 {(() => {
                   let href = "";
                   if (activity.location?.address) {
                       const searchParam = encodeURIComponent(activity.location.address);
                       href = `https://www.google.com/maps/dir/?api=1&destination=${searchParam}`;
                   } else if (activity.title && tripDestination) {
                       const searchParam = encodeURIComponent(`${activity.title} ${tripDestination}`);
                       href = `https://www.google.com/maps/dir/?api=1&destination=${searchParam}`;
                   } else if (activity.title) {
                       const searchParam = encodeURIComponent(activity.title);
                       href = `https://www.google.com/maps/dir/?api=1&destination=${searchParam}`;
                   }

                   if (href) {
                     return (
                       <a 
                         href={href} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         onClick={(e) => e.stopPropagation()}
                         className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-[13px] font-semibold tracking-tight rounded-lg transition-colors border border-blue-200/50 shadow-sm"
                       >
                         🧭 Get Directions
                       </a>
                     );
                   } else {
                     return (
                       <button
                         disabled
                         title="Directions unavailable for this activity."
                         className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-50 text-slate-400 text-[13px] font-semibold tracking-tight rounded-lg border border-slate-200 cursor-not-allowed opacity-80"
                       >
                         🧭 Directions Unavailable
                       </button>
                     );
                   }
                 })()}
             </div>
           </div>
         </div>
         
         <div className="flex hidden group-hover:flex gap-2 absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg p-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(activity._id); }} 
              className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition-colors"
            >
              Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(activity._id); }} 
              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
            >
              Delete
            </button>
         </div>
       </div>
    </div>
  );
});
