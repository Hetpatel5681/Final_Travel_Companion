import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 z-10">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Travel Companion</span>
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 z-10">Plan Smarter. Travel Better.</h2>
      
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 z-10">
        Your ultimate AI-powered travel partner. Plan trips, track budgets, and explore breathtaking destinations effortlessly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center z-10">
        <Button 
          onClick={handleStartPlanning}
          size="lg" 
          className="w-full sm:w-auto shadow-xl shadow-blue-500/20"
        >
          Start Planning
        </Button>
        <Link to="/destination-explorer">
          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/50 backdrop-blur-sm">Explore Destinations</Button>
        </Link>
      </div>
    </div>
  );
}
