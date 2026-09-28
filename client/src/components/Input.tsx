import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-white ml-2 mb-2">{label}</label>}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-[1.5rem] border bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 text-white placeholder-white/50 ${
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/20 focus:border-white/50'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
