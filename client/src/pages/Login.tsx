import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to access your trips</p>
        </div>
        <form className="space-y-4">
          <Input label="Email address" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <div className="pt-2">
            <Button fullWidth>Sign In</Button>
          </div>
        </form>
        <p className="text-center mt-6 text-slate-600 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
        </p>
      </Card>
    </div>
  );
}
