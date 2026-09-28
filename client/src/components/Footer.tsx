import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Travel Companion
            </span>
            <p className="mt-4 text-slate-500 text-sm">
              Your intelligent travel companion for seamless trip planning and exploring the world.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/trip-planner" className="hover:text-blue-600">AI Trip Planner</Link></li>
              <li><Link to="/budget-planner" className="hover:text-blue-600">Budget Tracking</Link></li>
              <li><Link to="/destination-explorer" className="hover:text-blue-600">Explorer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600">About</a></li>
              <li><a href="#" className="hover:text-blue-600">Contact</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} AI Travel Companion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
