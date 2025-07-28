"use client";

import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={sizeClasses[size]}>
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Letra M principal */}
          <path 
            d="M80 120 L80 280 L120 280 L120 200 L160 240 L200 200 L200 280 L240 280 L240 120 L200 120 L160 180 L120 120 Z" 
            fill="url(#gradient1)" 
          />
          
          {/* Barra laranja */}
          <rect x="140" y="100" width="40" height="120" fill="#f97316" rx="20"/>
          
          {/* Barra azul */}
          <rect x="180" y="80" width="40" height="160" fill="#3b82f6" rx="20"/>
          
          {/* Gradientes */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className={`ml-3 font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          Meu Bolso
        </span>
      )}
    </div>
  );
}
