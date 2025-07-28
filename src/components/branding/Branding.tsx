"use client";

import React from 'react';
import Logo from './Logo';
import LogoMark from './LogoMark';

interface BrandingProps {
  variant?: 'full' | 'mark' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

// Componente unificado para todas as variações da marca
export default function Branding({ 
  variant = 'full', 
  size = 'md', 
  className = '',
  showText = true,
  animated = false
}: BrandingProps) {
  
  if (variant === 'mark') {
    return <LogoMark size={size} className={className} animated={animated} />;
  }
  
  if (variant === 'text') {
    const textSizes = {
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl'
    };
    
    return (
      <span className={`font-bold text-primary ${textSizes[size]} ${className} ${animated ? 'animate-fade-in' : ''}`}>
        Meu Bolso
      </span>
    );
  }
  
  return <Logo size={size} className={className} showText={showText} animated={animated} />;
}
