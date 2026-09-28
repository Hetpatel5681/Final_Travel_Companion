import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/Input';
import { Moon, Sun, Bell, MapPin, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { geocodingApi } from '@/features/maps/api/geocoding.api';

export function DashboardHeader() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationText, setLocationText] = useState('Current Location Placeholder');
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await geocodingApi.reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (res && res.city && res.state) {
            setLocationText(`${res.city}, ${res.state}`);
          } else {
            setLocationText('Location Found');
          }
        } catch {
          setLocationText('Location Found');
        } finally {
          setIsLocating(false);
        }
      },
      (_error) => {
        setIsLocating(false);
        setLocationError('Permission denied');
      },
      { timeout: 10000 }
    );
  };

  const notifications = [
    { id: 1, title: 'Upcoming Trip', msg: 'Your Udaipur trip starts on Aug 13.', time: '2h ago' },
    { id: 2, title: 'Trip Ready', msg: 'Your AI itinerary has been generated.', time: '1d ago' }
  ];

  return (
    <header className="h-28 bg-white/10 dark:bg-slate-900/30 backdrop-blur-2xl border border-white/20 flex justify-between items-center px-8 sticky top-6 z-40 mt-6 mx-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative">
      
      {/* Decorative gradient blob inside header */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 blur-3xl rounded-full pointer-events-none"></div>

      <div className="flex flex-col relative z-10">
         <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
           Good Morning, <span className="text-amber-200">{user?.fullName || 'Traveler'}</span>
         </h1>
         <p className="text-sm md:text-base text-white/90 font-medium tracking-wide mt-1">Plan Smarter. Travel Better.</p>
      </div>
      
      <div className="flex items-center space-x-6 relative z-10">
         
         <div className="hidden lg:block w-72 mr-4 relative group">
           <Input placeholder="Search destinations, trips..." className="w-full bg-white/10 text-white placeholder-white/70 border-white/20 group-focus-within:border-amber-200 focus:ring-amber-200 backdrop-blur-md rounded-2xl py-2.5 transition-all shadow-inner" />
         </div>

         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={handleGetLocation}
           disabled={isLocating}
           className="text-sm font-semibold text-white/90 hover:text-white transition-colors hidden md:flex items-center focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-xl p-2.5 bg-white/10 border border-white/10 shadow-sm"
           title="Get current location"
           aria-label="Get current location"
         >
           <MapPin size={18} className="inline-block mr-2" /> 
           {isLocating ? 'Locating...' : locationError ? <span className="text-red-300">{locationError}</span> : locationText}
         </motion.button>
         
         <motion.button 
           whileHover={{ scale: 1.1, rotate: 180 }}
           transition={{ duration: 0.3 }}
           onClick={toggleTheme}
           className="text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-xl p-2.5 bg-white/10 border border-white/10 shadow-sm" 
           title="Toggle Theme"
           aria-label="Change theme"
         >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
         </motion.button>

         {/* Notifications */}
         <div className="relative" ref={notifRef}>
           <motion.button 
             whileHover={{ scale: 1.1 }}
             onClick={() => setIsNotifOpen(!isNotifOpen)}
             className="text-white/90 hover:text-white transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-xl p-2.5 bg-white/10 border border-white/10 shadow-sm" 
             title="Notifications"
             aria-label="View notifications"
           >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900/50 shadow-sm"></span>
           </motion.button>
           
           <AnimatePresence>
             {isNotifOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-50 text-slate-800 dark:text-slate-100"
               >
                 <div className="p-4 font-bold border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                   Notifications
                 </div>
                 <div className="max-h-80 overflow-y-auto scrollbar-hide">
                   {notifications.length === 0 ? (
                     <div className="p-6 text-sm text-slate-500 dark:text-slate-400 text-center font-medium">No notifications</div>
                   ) : (
                     notifications.map(n => (
                       <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-all">
                         <div className="flex justify-between items-start mb-1">
                           <span className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</span>
                           <span className="text-xs font-semibold text-slate-400">{n.time}</span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{n.msg}</p>
                       </div>
                     ))
                   )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
         </div>

         {/* Profile Avatar */}
         <div className="relative" ref={profileRef}>
           <motion.button 
             whileHover={{ scale: 1.05 }}
             onClick={() => setIsProfileOpen(!isProfileOpen)}
             className="w-12 h-12 bg-gradient-to-tr from-amber-300 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold border-[3px] border-white/30 shadow-lg cursor-pointer hover:ring-offset-2 hover:ring-2 hover:ring-amber-200 transition-all focus:outline-none overflow-hidden"
             title="Profile"
             aria-label="Open profile menu"
           >
             {user?.profilePicture ? (
                 <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <span className="text-lg drop-shadow-sm">{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
             )}
           </motion.button>
           
           <AnimatePresence>
             {isProfileOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-50 py-2 font-medium"
               >
                 <button 
                   onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                   className="w-full text-left px-5 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors font-semibold"
                 >
                   <User size={18} className="text-slate-400" /> Profile
                 </button>
                 <button 
                   onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                   className="w-full text-left px-5 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors font-semibold"
                 >
                   <Settings size={18} className="text-slate-400" /> Settings
                 </button>
                 <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                 <button 
                   onClick={() => { setIsProfileOpen(false); logout(); navigate('/login'); }}
                   className="w-full text-left px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors font-bold"
                 >
                   <LogOut size={18} className="text-red-400" /> Logout
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
         
      </div>
    </header>
  );
}
