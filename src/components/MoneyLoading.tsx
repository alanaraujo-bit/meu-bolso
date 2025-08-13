"use client";

import React, { useEffect, useState } from 'react';

interface MoneyLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MoneyLoading({ text = "Carregando", size = 'md' }: MoneyLoadingProps) {
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
      {/* Cédula Animada - Responsiva ao tema */}
      <div className={`${sizeClasses[size]} relative rounded-lg shadow-lg overflow-hidden transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 border-2 border-emerald-600'
          : 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300'
      }`}>
        {/* Padrão da cédula */}
        <div className="absolute inset-0 opacity-20">
          <div className={`w-full h-full transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-emerald-700 to-emerald-600'
              : 'bg-gradient-to-br from-green-200 to-green-300'
          }`}></div>
          {/* Símbolo do dinheiro */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className={`font-bold text-lg opacity-30 transition-colors duration-300 ${
              darkMode ? 'text-emerald-300' : 'text-green-600'
            }`}>R$</span>
          </div>
          {/* Padrões decorativos */}
          <div className={`absolute top-1 left-1 w-2 h-2 rounded-full opacity-40 transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-400'
          }`}></div>
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full opacity-40 transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-400'
          }`}></div>
          <div className={`absolute bottom-1 left-1 w-2 h-2 rounded-full opacity-40 transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-400'
          }`}></div>
          <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full opacity-40 transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-400'
          }`}></div>
        </div>
        
        {/* Animação de preenchimento */}
        <div className={`absolute inset-0 opacity-70 animate-fill-money transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
            : 'bg-gradient-to-r from-green-400 to-green-500'
        }`}></div>
        
        {/* Brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
      </div>
      
      {/* Texto de carregamento - Responsivo ao tema */}
      <div className="flex items-center space-x-2">
        <span className={`${textSizes[size]} font-medium transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{text}</span>
        <div className="flex space-x-1">
          <div className={`w-1 h-1 rounded-full animate-bounce transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-500'
          }`}></div>
          <div className={`w-1 h-1 rounded-full animate-bounce transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-500'
          }`} style={{ animationDelay: '0.1s' }}></div>
          <div className={`w-1 h-1 rounded-full animate-bounce transition-colors duration-300 ${
            darkMode ? 'bg-emerald-400' : 'bg-green-500'
          }`} style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}