import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <p className="text-2xl font-bold text-slate-800 mt-4 mb-2">Page Not Found</p>
      <p className="text-slate-600 mb-8 max-w-md">The destination you're looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
