import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function Register() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Join AI Travel Companion</h2>
          <p className="text-slate-500 mt-2">Create an account to start planning</p>
        </div>
        <form className="space-y-4">
          <Input label="Full Name" type="text" placeholder="John Doe" />
          <Input label="Email address" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <div className="pt-2">
            <Button fullWidth>Sign Up</Button>
          </div>
        </form>
        <p className="text-center mt-6 text-slate-600 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
