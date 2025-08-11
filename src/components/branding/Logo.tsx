"use client";

import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export default function Logo({ size = 'md', className = '', showText = true, animated = false }: LogoProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} ${animated ? 'transition-transform hover:scale-110 duration-300' : ''}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          fill="none"
          className="w-full h-full"
        >
          {/* Letra M estilizada */}
          <path
            d="M30 160V60c0-10 10-20 20-20h10c5 0 10 3 15 7l25 25 25-25c5-4 10-7 15-7h10c10 0 20 10 20 20v100c0 10-10 20-20 20s-20-10-20-20V90l-20 20c-5 5-10 5-15 0l-20-20v70c0 10-10 20-20 20s-20-10-20-20Z"
            fill="#199C90"
            className={animated ? 'animate-pulse' : ''}
          />
          
          {/* Barras do gráfico */}
          <rect 
            x="55" 
            y="50" 
            width="12" 
            height="30" 
            rx="4" 
            fill="#F46A5E"
            className={animated ? 'animate-bounce' : ''}
            style={animated ? { animationDelay: '0ms', animationDuration: '2s' } : {}}
          />
          <rect 
            x="75" 
            y="40" 
            width="12" 
            height="40" 
            rx="4" 
            fill="#F89E32"
            className={animated ? 'animate-bounce' : ''}
            style={animated ? { animationDelay: '200ms', animationDuration: '2s' } : {}}
          />
          <rect 
            x="95" 
            y="20" 
            width="12" 
            height="60" 
            rx="4" 
            fill="#4AA9E9"
            className={animated ? 'animate-bounce' : ''}
            style={animated ? { animationDelay: '400ms', animationDuration: '2s' } : {}}
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400 ${textSizes[size]} ${animated ? 'animate-fade-in' : ''}`}>
          Meu Bolso
        </span>
      )}
    </div>
  );
}
