'use client';

import { useState } from 'react';
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
        return 'fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-40';
      case 'header':
        return 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white backdrop-blur-sm';
      case 'inline':
      default:
        return 'bg-blue-100 hover:bg-blue-200 text-blue-600 border-2 border-blue-300';
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
          focus:ring-blue-500 
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
