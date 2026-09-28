import { Link } from 'react-router-dom';
import { Button } from './Button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Travel Companion
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/destination-explorer" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Destinations</Link>
            <Link to="/trip-planner" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Trip Planner</Link>
            <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Sign In</Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
