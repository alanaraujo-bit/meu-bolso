"use client";

import React from 'react';
import Logo from './Logo';
import LogoMark from './LogoMark';

interface BrandingProps {
  variant?: 'full' | 'mark' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

// Componente unificado para todas as variações da marca
export default function Branding({ 
  variant = 'full', 
  size = 'md', 
  className = '',
  showText = true 
}: BrandingProps) {
  
  if (variant === 'mark') {
    return <LogoMark size={size} className={className} />;
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
      <span className={`font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent ${textSizes[size]} ${className}`}>
        Meu Bolso
      </span>
    );
  }
  
  return <Logo size={size} className={className} showText={showText} />;
}
