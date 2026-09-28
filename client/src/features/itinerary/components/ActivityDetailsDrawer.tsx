import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IActivity } from '../types/itinerary.types';
import { getCategoryIcon } from '../utils/categoryIcons.utils';
import { formatCurrency } from '../../../utils/currency.utils';

interface ActivityDetailsDrawerProps {
  activity: IActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

export const ActivityDetailsDrawer: React.FC<ActivityDetailsDrawerProps> = ({ 
  activity, isOpen, onClose, onStatusChange 
}) => {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // If no activity is provided but drawer is open, keep rendering empty or don't render.
  // We use AnimatePresence so it can unmount naturally. We need activity for content.
  // A small trick is to render previously selected activity while closing.
  // Because 'activity' might be null when closing, we handle null checks safely.
  
  return (
    <AnimatePresence>
      {isOpen && activity && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] bg-white/10 dark:bg-slate-900/30 backdrop-blur-3xl shadow-[[-30px_0_60px_rgba(0,0,0,0.3)]] border-l border-white/20 dark:border-white/10 z-50 overflow-y-auto rounded-l-[3rem] text-slate-800 dark:text-slate-200"
          >
            <div className="p-8 md:p-10 relative min-h-full">
              {/* Close Button */}
              <button 
                onClick={onClose}
                aria-label="Close drawer"
                className="absolute top-8 right-8 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded-full w-10 h-10 flex items-center justify-center transition-all backdrop-blur-md hover:scale-110"
              >
                ✕
              </button>
              
              <div className="flex gap-5 items-start mb-8 pr-12">
                 <div className="text-5xl drop-shadow-md">{getCategoryIcon(activity.category)}</div>
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] tracking-widest font-black px-3 py-1.5 bg-slate-900 text-white rounded-full uppercase shadow-sm">{activity.category}</span>
                      <span className={`text-[10px] tracking-widest font-black px-3 py-1.5 rounded-full uppercase shadow-sm ${
                        activity.priority === 'Must-Do' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                      }`}>
                        {activity.priority}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{activity.title}</h2>
                 </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 text-lg">{activity.description || 'No description provided.'}</p>

              <div className="flex flex-col gap-6 mb-10">
                {/* Timing & Location */}
                <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/10 shadow-sm">
                   <h4 className="font-bold text-slate-800 dark:text-white mb-5 border-b border-slate-200 dark:border-slate-700 pb-3 uppercase tracking-widest text-xs">Timing & Location</h4>
                   <div className="space-y-4 text-sm font-medium">
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400">Duration</span>
                       <span className="font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-200">{activity.estimatedDuration ? `${activity.estimatedDuration} mins` : 'N/A'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400">Start Time</span>
                       <span className="font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-200">{activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Anytime'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400">End Time</span>
                       <span className="font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-200">{activity.endTime ? new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                     </div>
                     {activity.location?.address && (
                       <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-3">
                         <span className="text-slate-500 dark:text-slate-400 block mb-2 text-xs uppercase tracking-widest">Address</span>
                         <span className="font-bold text-slate-700 dark:text-slate-200 block text-base">{activity.location.address}</span>
                         {activity.googleMapsUrl && (
                           <a href={activity.googleMapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-500 hover:underline mt-2 inline-block font-bold">View on Maps ↗</a>
                         )}
                       </div>
                     )}
                   </div>
                </div>

                {/* Estimated Costs */}
                <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/10 shadow-sm">
                   <h4 className="font-bold text-slate-800 dark:text-white mb-5 border-b border-slate-200 dark:border-slate-700 pb-3 uppercase tracking-widest text-xs">Estimated Costs</h4>
                   <div className="space-y-4 text-sm font-medium">
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400">Tickets</span>
                       <span className="font-black text-rose-500">{activity.ticketPrice ? formatCurrency(activity.ticketPrice, activity.currency) : '-'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400">Transport</span>
                       <span className="font-black text-amber-500">{activity.estimatedExpense?.transport ? formatCurrency(activity.estimatedExpense.transport, activity.currency) : '-'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-slate-500 dark:text-slate-400">Food</span>
                       <span className="font-black text-emerald-500">{activity.estimatedExpense?.food ? formatCurrency(activity.estimatedExpense.food, activity.currency) : '-'}</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 mb-10">
                 {/* Booking Info */}
                 <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 dark:border-white/10 shadow-sm">
                   <h4 className="font-bold text-slate-800 dark:text-white mb-5 border-b border-slate-200 dark:border-slate-700 pb-3 uppercase tracking-widest text-xs">Booking Info</h4>
                   {activity.bookingRequired ? (
                     <div className="space-y-3 text-sm font-medium">
                       <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-3 py-1.5 rounded-full inline-block font-black uppercase tracking-widest text-[10px] mb-2 shadow-sm">Booking Required</span>
                       {activity.reservationNumber && <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-400 mr-2">Reservation:</span> <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{activity.reservationNumber}</span></p>}
                       {activity.bookingUrl && <a href={activity.bookingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-500 hover:underline inline-block font-bold">Booking Link ↗</a>}
                     </div>
                   ) : (
                     <span className="text-slate-500 text-sm font-medium">No booking required for this activity.</span>
                   )}
                 </div>

                 {/* Notes */}
                 {activity.notes && (
                   <div className="bg-blue-500/10 backdrop-blur-md p-6 rounded-[2rem] border border-blue-500/20 shadow-sm text-blue-900 dark:text-blue-100">
                     <h4 className="font-bold mb-3 uppercase tracking-widest text-xs">Notes</h4>
                     <p className="text-sm font-medium italic leading-relaxed">{activity.notes}</p>
                   </div>
                 )}
              </div>

              {/* Status Tracking */}
              <div className="bg-white/10 dark:bg-slate-800/20 backdrop-blur-3xl p-8 rounded-[2.5rem] flex flex-col gap-5 border border-white/20 dark:border-white/10 shadow-xl">
                 <div>
                   <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm drop-shadow-sm">Status Tracking</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Currently marked as <span className="font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{activity.status}</span></p>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl shadow-inner border border-slate-300/50 dark:border-slate-700 p-2">
                   {['Pending', 'Completed', 'Cancelled', 'Skipped'].map(s => (
                     <button 
                       key={s}
                       onClick={() => onStatusChange(s)}
                       className={`flex-1 min-w-[70px] px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-black transition-all duration-300 ${
                         activity.status === s ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-800'
                       }`}
                     >
                       {s}
                     </button>
                   ))}
                 </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
