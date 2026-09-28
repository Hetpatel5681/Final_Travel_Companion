import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const hoverStyle = hover ? 'hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-500' : '';
  return (
    <div className={`bg-white/10 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[3rem] shadow-2xl p-8 ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
}
