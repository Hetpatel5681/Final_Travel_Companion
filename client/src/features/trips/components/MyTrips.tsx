import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTrips, deleteTrip } from '../api/trips.api';
import { Trip } from '../types/trips.types';
import { TripCard } from './TripCard';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export const MyTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTrips();
      setTrips(response.data.trips || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(id);
        const updatedTrips = trips.filter(trip => trip._id !== id);
        setTrips(updatedTrips);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete trip');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-900/40 backdrop-blur-md p-6 rounded-2xl border border-red-500/50 text-red-200">
          <p className="font-semibold text-lg mb-2">Something went wrong</p>
          <p>{error}</p>
          <button onClick={fetchTrips} className="mt-4 bg-red-800/50 hover:bg-red-700/50 px-4 py-2 rounded-xl transition font-medium">Try Again</button>
        </div>
      </div>
    );
  }

  const upcomingTrips = trips.filter(t => new Date(t.startDate) > new Date()).length;
  const aiTrips = trips.filter(t => t.aiStatus === 'Completed').length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-0 pb-24">
      {/* Cinematic Hero Section */}
      <motion.div variants={itemVariants} className="relative h-[400px] sm:h-[450px] w-full mb-12 overflow-hidden shadow-2xl rounded-b-[3rem]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-end px-8 pb-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-3 tracking-tight">
                My Trips
              </motion.h1>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-amber-50 font-medium opacity-90">
                Your cinematic travel catalog.
              </motion.p>
            </div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex gap-4">
               <Link to="/trips/new" className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-8 py-3.5 rounded-full font-bold shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                 <span>✨</span> Create New Trip
               </Link>
            </motion.div>
          </div>

          {/* Statistics Bar */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mt-10 mb-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg">
            <div className="text-center px-4 border-r border-white/10">
              <span className="block text-4xl font-black text-white drop-shadow-md">{trips.length}</span>
              <span className="uppercase text-[11px] font-bold tracking-widest text-amber-200 mt-1">Total Trips</span>
            </div>
            <div className="text-center px-4 border-r border-white/10">
              <span className="block text-4xl font-black text-white drop-shadow-md">{upcomingTrips}</span>
              <span className="uppercase text-[11px] font-bold tracking-widest text-teal-200 mt-1">Upcoming</span>
            </div>
            <div className="text-center px-4">
              <span className="block text-4xl font-black text-white drop-shadow-md">{aiTrips}</span>
              <span className="uppercase text-[11px] font-bold tracking-widest text-purple-200 mt-1">AI Planned</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8">
        {trips.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="text-6xl mb-6">🌍</div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">No trips created yet. Start planning your next adventure.</h3>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg hover:text-slate-300 transition-colors">Let our AI build your perfect itinerary, or map out your own journey independently.</p>
            <Link to="/trips/new" className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-transform">
              Create Trip
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {trips.map(trip => (
              <motion.div key={trip._id} variants={itemVariants}>
                <TripCard trip={trip} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
