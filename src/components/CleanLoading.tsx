"use client";

import { useEffect, useState } from "react";

interface CleanLoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function CleanLoading({ 
  text = "", 
  fullScreen = false
}: CleanLoadingProps) {
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

  const containerClass = fullScreen 
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900' 
          : 'bg-white'
      }` 
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClass}>
      {/* Spinner responsivo ao tema */}
      <div className={`w-5 h-5 border-2 rounded-full animate-spin mb-3 transition-colors duration-300 ${
        darkMode 
          ? 'border-gray-700 border-t-emerald-400' 
          : 'border-gray-200 border-t-blue-500'
      }`}></div>
      
      {/* Texto opcional e responsivo ao tema */}
      {text && (
        <p className={`text-sm font-medium transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
}
