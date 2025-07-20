"use client";

import React from 'react';

interface MoneyLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MoneyLoading({ text = "Carregando", size = 'md' }: MoneyLoadingProps) {
  const sizeClasses = {
    sm: 'w-16 h-10',
    md: 'w-24 h-16',
    lg: 'w-32 h-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Cédula Animada */}
      <div className={`${sizeClasses[size]} relative bg-gradient-to-r from-green-100 to-green-200 rounded-lg border-2 border-green-300 shadow-lg overflow-hidden`}>
        {/* Padrão da cédula */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300"></div>
          {/* Símbolo do dinheiro */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-green-600 font-bold text-lg opacity-30">R$</span>
          </div>
          {/* Padrões decorativos */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
        </div>
        
        {/* Animação de preenchimento */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-70 animate-fill-money"></div>
        
        {/* Brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
      </div>
      
      {/* Texto de carregamento */}
      <div className="flex items-center space-x-2">
        <span className={`${textSizes[size]} text-gray-600 font-medium`}>{text}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}