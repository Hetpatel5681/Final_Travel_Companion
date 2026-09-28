import { Outlet, Link, useLocation } from 'react-router-dom';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';

export function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const sidebarLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/trips', label: 'My Trips', icon: '🚀' },
    { path: '/trip-planner', label: 'AI Trip Planner', icon: '✨' },
    { path: '/destination-explorer', label: 'Destination Explorer', icon: '🌍' },
    { path: '/saved-trips', label: 'Saved Destinations', icon: '❤️' },
    { path: '/weather', label: 'Weather', icon: '⛅' },
    { path: '/maps', label: 'Maps', icon: '🗺️' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#003B5C] via-[#0D5C75] to-[#D4B895] font-sans text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Global Cinematic Overlay */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Floating Glassmorphism Sidebar */}
      <aside className="w-64 bg-white/10 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 shadow-2xl hidden md:flex md:flex-col fixed inset-y-6 left-6 rounded-[2rem] text-sm z-50 transition-colors overflow-hidden">
        <div className="h-24 flex items-center px-8 border-b border-white/20 transition-colors mt-2">
          <Link to="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
              AI Travel Companion
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide z-10">
          {sidebarLinks.map((item) => (
             <Link 
               key={item.path} 
               to={item.path} 
               className={`relative flex items-center px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
                 isActive(item.path) 
                   ? 'bg-white/20 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/30 backdrop-blur-sm' 
                   : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
               }`}
             >
               <span className="w-6 text-lg">{item.icon}</span>
               {item.label}
             </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20 space-y-2 mb-2 z-10">
          <Link to="/profile" className="flex items-center px-4 py-3 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1 font-medium transition-all duration-300">
             <span className="w-6">👤</span> Profile
          </Link>
          <Link to="/settings" className="flex items-center px-4 py-3 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1 font-medium transition-all duration-300">
             <span className="w-6">⚙️</span> Settings
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center text-left px-4 py-3 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-200 font-medium mt-1 transition-all duration-300 hover:translate-x-1"
          >
             <span className="w-6">🚪</span> Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 md:ml-[312px] flex flex-col min-h-screen z-10 relative">
        <DashboardHeader />
        <div className="p-8 flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
