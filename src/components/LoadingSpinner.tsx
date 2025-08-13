"use client";

import React, { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray' | 'white' | 'auto';
}

export default function LoadingSpinner({ size = 'sm', color = 'auto' }: LoadingSpinnerProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Detectar tema atual
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getColorClasses = () => {
    if (color === 'auto') {
      return darkMode 
        ? 'border-gray-700 border-t-emerald-400'
        : 'border-gray-200 border-t-blue-500';
    }
    
    const colorClasses = {
      blue: darkMode ? 'border-blue-800 border-t-blue-400' : 'border-blue-200 border-t-blue-500',
      green: darkMode ? 'border-green-800 border-t-green-400' : 'border-green-200 border-t-green-500',
      gray: darkMode ? 'border-gray-700 border-t-gray-400' : 'border-gray-200 border-t-gray-500',
      white: 'border-white/30 border-t-white'
    };
    
    return colorClasses[color as keyof typeof colorClasses];
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 border-2 ${getColorClasses()} rounded-full animate-spin transition-colors duration-300`}></div>
    </div>
  );
}
