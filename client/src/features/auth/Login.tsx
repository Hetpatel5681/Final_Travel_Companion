import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { apiClient } from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { token, user } = response.data;
      
      login(token, user);
      
      navigate('/dashboard');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to AI Travel Companion</p>
        </div>
        
        {apiError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{apiError}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Email address" 
            type="email" 
            placeholder="you@example.com" 
            error={errors.email?.message}
            {...register('email')} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            error={errors.password?.message}
            {...register('password')} 
          />
          <div className="pt-2">
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : 'Sign In'}
            </Button>
          </div>
        </form>
        <p className="text-center mt-6 text-slate-600 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
        </p>
      </Card>
    </div>
  );
}
