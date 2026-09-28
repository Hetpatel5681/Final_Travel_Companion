import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RecommendationSection } from '../destination/components/RecommendationSection';
import { getTrips } from '@/features/trips/api/trips.api';
import { Trip } from '@/features/trips/types/trips.types';
import { getUserInteractions, UserInteraction } from '@/features/destination/api/interaction.api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [savedPlacesCount, setSavedPlacesCount] = useState(0);
  const [itinerariesCount, setItinerariesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripsRes, interactions] = await Promise.all([
          getTrips().catch(() => ({ data: { trips: [] } })),
          getUserInteractions().catch(() => [])
        ]);
        
        const allTrips: Trip[] = (tripsRes as any).data?.trips || [];
        setTrips(allTrips);
        
        const itineraries = allTrips.filter(t => t.aiStatus === 'Completed').length;
        setItinerariesCount(itineraries);

        const savedIds = new Set<string>();
        // The backend `getUserInteractions` endpoint returns interactions ordered DESC (newest first).
        // To rebuild state correctly, we must process them chronologically (oldest to newest) 
        // to prevent older states from overwriting newer states.
        [...interactions].reverse().forEach((int: UserInteraction) => {
           const id = typeof int.destinationId === 'object' ? (int.destinationId as any)._id : int.destinationId;
           if (int.interactionType === 'SAVE') savedIds.add(id);
           if (int.interactionType === 'UNSAVE') savedIds.delete(id);
        });
        setSavedPlacesCount(savedIds.size);
        
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const upcomingTrip = trips.filter(t => new Date(t.startDate) > new Date()).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  
  const recentActivity = trips.slice(0, 3).map(t => ({
    id: t._id,
    title: `${t.destination.name} Trip Created`,
    date: new Date(t.createdAt).toLocaleDateString(),
    icon: '🚀',
    link: `/trips/${t._id}`,
    color: 'amber'
  }));

  if (loading) {
    return <div className="p-8 text-white">Loading dashboard...</div>;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12 mb-20 px-8 py-4">
      
      {/* Upcoming Trips Section */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-extrabold text-white mb-6 tracking-wide drop-shadow-md flex items-center gap-3">
          <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">✈️</span> Upcoming Trips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingTrip ? (
            <motion.div onClick={() => navigate(`/dashboard/trips/${upcomingTrip._id}/itinerary`)} whileHover={{ scale: 1.02, y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="h-80 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden relative cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#003B5C]/90 via-[#003B5C]/30 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80"></div>
              <img src={upcomingTrip.coverImage || "https://images.unsplash.com/photo-1596706911475-738914b3017a?auto=format&fit=crop&q=80"} alt={upcomingTrip.destination.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              
              <div className="absolute top-6 right-6 z-20 bg-amber-400 text-slate-900 font-bold px-4 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span> {new Date(upcomingTrip.startDate).toLocaleDateString()}
              </div>
              
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <p className="text-amber-300 font-bold mb-1 uppercase tracking-widest text-xs flex items-center gap-1 drop-shadow-sm">📍 {upcomingTrip.destination.country}</p>
                <h3 className="text-3xl font-extrabold text-white mb-3 drop-shadow-lg">{upcomingTrip.title || `${upcomingTrip.destination.name} Getaway`}</h3>
                <div className="flex gap-2">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-semibold border border-white/10">{upcomingTrip.totalDays} Days</span>
                  {upcomingTrip.aiStatus === 'Completed' && (
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-semibold border border-white/10">AI Planned</span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigate('/trip-planner')} className="h-80 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mb-4 border border-white/20">✨</div>
               <h3 className="text-xl font-bold text-white mb-2">No upcoming trips</h3>
               <p className="text-white/70">Click here to plan a new getaway</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* AI Recommendations */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-extrabold text-white mb-6 tracking-wide drop-shadow-md flex items-center gap-3">
          <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">✨</span> AI Recommendations
        </h2>
        <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full mix-blend-overlay filter blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="relative z-10">
            {/* DO NOT REDESIGN THIS COMPONENT LOGIC PER RULES */}
            <RecommendationSection />
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Travel Statistics */}
        <motion.section variants={itemVariants}>
          <h2 className="text-2xl font-extrabold text-white mb-6 tracking-wide drop-shadow-md flex items-center gap-3">
            <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">📊</span> Travel Statistics
          </h2>
          <div className="grid grid-cols-2 gap-6 h-[calc(100%-3rem)]">
            <motion.div whileHover={{ y: -5 }} className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-xl text-center relative overflow-hidden group transition-all h-full flex flex-col justify-center">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-white/80 font-bold mb-3 uppercase tracking-wider text-xs">Trips Created</h4>
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-amber-300 drop-shadow-sm">{trips.length}</span>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-xl text-center relative overflow-hidden group transition-all h-full flex flex-col justify-center">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-white/80 font-bold mb-3 uppercase tracking-wider text-xs">Places Saved</h4>
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-teal-100 to-emerald-300 drop-shadow-sm">{savedPlacesCount}</span>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="col-span-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-700/90 backdrop-blur-3xl border border-white/30 rounded-[2rem] shadow-xl z-0"></div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-[2rem]"></div>
              <div className="relative z-20 p-8 flex justify-between items-center text-white h-full">
                <div>
                  <h4 className="font-bold text-emerald-200 mb-1 uppercase tracking-widest text-[10px]">AI Impact</h4>
                  <span className="font-extrabold text-xl tracking-wide">Itineraries Generated</span>
                </div>
                <span className="text-6xl font-black drop-shadow-lg">{itinerariesCount}</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Recent Activity */}
        <motion.section variants={itemVariants}>
          <h2 className="text-2xl font-extrabold text-white mb-6 tracking-wide drop-shadow-md flex items-center gap-3">
            <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">⚡</span> Recent Activity
          </h2>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-xl space-y-4 h-[calc(100%-3rem)]">
            {recentActivity.length === 0 ? (
               <div className="text-center py-12 text-white/70">
                 No recent activity found.
               </div>
            ) : (
               recentActivity.map(item => (
                 <motion.div onClick={() => navigate(item.link)} key={item.id} whileHover={{x: 4}} className="flex items-center gap-5 bg-black/20 p-5 rounded-2xl hover:bg-black/30 transition-all cursor-pointer border border-white/5 hover:border-white/20 group">
                   <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl border border-amber-500/30 group-hover:scale-110 transition-transform">{item.icon}</div>
                   <div>
                     <p className="text-white font-bold text-lg mb-0.5 tracking-tight group-hover:text-amber-100 transition-colors">{item.title}</p>
                     <p className="text-amber-200/80 font-semibold text-xs tracking-wide">{item.date}</p>
                   </div>
                 </motion.div>
               ))
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
