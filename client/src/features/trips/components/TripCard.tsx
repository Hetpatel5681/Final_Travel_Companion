import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trip } from '../types/trips.types';
import { formatCurrency } from '../../../utils/currency.utils';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export const TripCard = ({ trip, onDelete }: TripCardProps) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Upcoming': return 'bg-teal-500/90 text-teal-50';
      case 'Ongoing': return 'bg-emerald-500/90 text-emerald-50';
      case 'Completed': return 'bg-slate-700/90 text-slate-50';
      case 'Cancelled': return 'bg-red-500/90 text-red-50';
      default: return 'bg-amber-500/90 text-amber-50'; // Planning
    }
  };

  return (
    <motion.div 
       whileHover={{ y: -8, scale: 1.02 }}
       transition={{ type: "spring", stiffness: 300, damping: 20 }}
       className="relative bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group flex flex-col h-full"
    >
      <div className="h-56 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/30 to-transparent z-10 transition-opacity duration-300" />
         
         <img 
           src={trip.coverImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80"} 
           alt={trip.title} 
           className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
         />
         
         {/* Top badges */}
         <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${getStatusStyle(trip.tripStatus)}`}>
              {trip.tripStatus}
            </span>
            
            {trip.aiStatus === 'Completed' && (
              <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg flex items-center gap-1.5">
                ✨ AI
              </span>
            )}
         </div>

         {/* Bottom anchored text on image */}
         <div className="absolute bottom-5 left-5 right-5 z-20">
            <p className="text-amber-300 font-bold mb-1 uppercase tracking-widest text-[10px] drop-shadow-md">
              📍 {trip.destination.name}
            </p>
            <h3 className="font-extrabold text-2xl text-white drop-shadow-lg leading-tight line-clamp-2">
              {trip.title}
            </h3>
         </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col bg-transparent">
        
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
          <span>📅</span> 
          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/50 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
             <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-1">Budget Status</span>
             <span className="text-slate-800 dark:text-white text-xs font-bold whitespace-nowrap">{formatCurrency((trip as any).totalExpenses || 0, trip.currency)} spent<br className="hidden sm:block"/>• {formatCurrency((trip as any).remainingBudget ?? trip.budget, trip.currency)} rem</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-700/50 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors flex flex-col justify-center">
             <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-1">Duration</span>
             <span className="text-slate-800 dark:text-white font-bold">{trip.totalDays} Days</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8 mt-auto">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Plan Completion</span>
            <span className="text-amber-300 font-black">{trip.completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${trip.completionPercentage}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full" 
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link to={`/trips/${trip._id}`} className="flex-1 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all shadow-sm">
            View
          </Link>
          <Link to={`/trips/${trip._id}/edit`} className="flex-1 text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all shadow-sm">
            Edit
          </Link>
          <button 
            onClick={() => onDelete(trip._id)} 
            className="flex-1 text-center bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all shadow-sm"
          >
            Del
          </button>
        </div>
      </div>
    </motion.div>
  );
};
