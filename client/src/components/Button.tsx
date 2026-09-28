import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-1 active:scale-95";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg focus:ring-blue-500",
    secondary: "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg focus:ring-purple-500",
    outline: "border-2 border-slate-200 bg-transparent text-slate-700 hover:border-blue-600 hover:text-blue-600 focus:ring-blue-500",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
