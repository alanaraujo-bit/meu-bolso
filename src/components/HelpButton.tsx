'use client';

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

interface HelpStep {
  title: string;
  content: string;
  image?: string;
  gif?: string;
  analogy?: string;
  tip?: string;
}

interface HelpButtonProps {
  title: string;
  steps: HelpStep[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline' | 'header';
}

export default function HelpButton({ title, steps, size = 'md', variant = 'inline' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Detectar tema do sistema
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Observer para mudanças de tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'floating':
        return darkMode
          ? 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 z-30 sm:z-40'
          : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg z-30 sm:z-40';
      case 'header':
        return darkMode
          ? 'bg-gray-800/80 hover:bg-gray-700/80 text-emerald-400 hover:text-emerald-300 backdrop-blur-sm border border-gray-700/50'
          : 'bg-white/80 hover:bg-white text-emerald-600 hover:text-emerald-700 backdrop-blur-sm border border-white/20';
      case 'inline':
      default:
        return darkMode
          ? 'bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-400 border-2 border-emerald-500/30 hover:border-emerald-400/50 backdrop-blur-sm'
          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600 border-2 border-emerald-300';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          ${getSizeClasses()} 
          ${getVariantClasses()}
          rounded-full 
          flex items-center justify-center 
          transition-all duration-200 
          hover:scale-110 
          focus:outline-none 
          focus:ring-2 
          focus:ring-emerald-500 
          focus:ring-opacity-50
          group
        `}
        title={`Ajuda: ${title}`}
      >
        <HelpCircle 
          size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
          className="group-hover:rotate-12 transition-transform duration-200"
        />
      </button>

      <HelpModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        steps={steps}
      />
    </>
  );
}
