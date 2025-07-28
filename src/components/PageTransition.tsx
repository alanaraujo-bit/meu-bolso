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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="w-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-blue-500 rounded-full animate-pulse"></div>
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
