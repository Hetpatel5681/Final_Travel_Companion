import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function SavedTrips() {
  // Let's assume we fetch saved trips here in the future
  const savedTrips: any[] = [];

  return (
    <div className="space-y-0 pb-24">
      {/* Cinematic Hero Section */}
      <motion.div initial="hidden" animate="visible" variants={itemVariants} className="relative h-[400px] sm:h-[450px] w-full mb-12 overflow-hidden shadow-2xl rounded-b-[3rem]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-end px-8 pb-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-3 tracking-tight">
                Saved Destinations
              </motion.h1>
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-emerald-50 font-medium opacity-90">
                Your curated list of future escapes.
              </motion.p>
            </div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="flex gap-4">
               <Link to="/destination-explorer" className="bg-emerald-500 hover:bg-emerald-400 text-white hover:text-white px-8 py-3.5 rounded-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                 <span>🌍</span> Explore More
               </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8">
        {savedTrips.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={itemVariants} className="text-center py-24 bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="text-6xl mb-6">📌</div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">No saved destinations yet.</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto text-lg hover:text-slate-600 transition-colors">Start exploring destinations and bookmark your favorites to access them here.</p>
            <Link to="/destination-explorer" className="inline-block bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-transform">
              Discover Destinations
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {/* Map savedTrips */}
          </div>
        )}
      </div>
    </div>
  );
}
