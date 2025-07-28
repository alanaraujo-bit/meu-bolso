"use client";

import React from 'react';

interface LogoMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Versão apenas do símbolo, sem texto
export default function LogoMark({ size = 'md', className = '' }: LogoMarkProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Letra M principal */}
        <path 
          d="M80 120 L80 280 L120 280 L120 200 L160 240 L200 200 L200 280 L240 280 L240 120 L200 120 L160 180 L120 120 Z" 
          fill="url(#gradientMark)" 
        />
        
        {/* Barra laranja */}
        <rect x="140" y="100" width="40" height="120" fill="#f97316" rx="20"/>
        
        {/* Barra azul */}
        <rect x="180" y="80" width="40" height="160" fill="#3b82f6" rx="20"/>
        
        {/* Gradientes */}
        <defs>
          <linearGradient id="gradientMark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
