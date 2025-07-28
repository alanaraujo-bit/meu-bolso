"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray' | 'white';
}

export default function LoadingSpinner({ size = 'sm', color = 'blue' }: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-500',
    green: 'border-green-200 border-t-green-500',
    gray: 'border-gray-200 border-t-gray-500',
    white: 'border-white/30 border-t-white'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 border-2 ${colorClasses[color]} rounded-full animate-spin`}></div>
    </div>
  );
}
