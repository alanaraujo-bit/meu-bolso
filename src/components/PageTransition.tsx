"use client";

import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  loading?: boolean;
  minLoadTime?: number;
}

export default function PageTransition({ 
  children, 
  loading = false, 
  minLoadTime = 200 
}: PageTransitionProps) {
  const [showContent, setShowContent] = useState(!loading);
  const [isTransitioning, setIsTransitioning] = useState(loading);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Detectar modo escuro inicial
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Observer para mudanças de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loading) {
      setIsTransitioning(true);
      setShowContent(false);
    } else {
      // Garantir uma transição mínima suave
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setShowContent(true);
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [loading, minLoadTime]);

  if (isTransitioning) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-5 h-5 border-2 rounded-full animate-spin transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-700 border-t-emerald-400' 
              : 'border-gray-200 border-t-emerald-500'
          }`}></div>
          <div className={`w-4 h-1 rounded-full overflow-hidden transition-colors duration-300 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div className={`w-full h-full rounded-full animate-pulse transition-colors duration-300 ${
              darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
}
