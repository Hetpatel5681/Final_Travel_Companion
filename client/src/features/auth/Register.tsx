import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { apiClient } from '@/api/axios';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);
    setSuccess(null);
    try {
      await apiClient.post('/auth/register', data);
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Join AI Travel Companion</h2>
          <p className="text-slate-500 mt-2">Plan Smarter. Travel Better.</p>
        </div>
        
        {apiError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{apiError}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="John Doe" 
            error={errors.fullName?.message}
            {...register('fullName')} 
          />
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
              {isSubmitting ? 'Loading...' : 'Sign Up'}
            </Button>
          </div>
        </form>
        <p className="text-center mt-6 text-slate-600 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
