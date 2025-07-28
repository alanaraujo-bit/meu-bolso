"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/branding/Logo';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erro na aplicação:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <Logo size="xl" className="justify-center" />
        </div>
        
        <h1 className="text-6xl font-bold text-red-400 mb-4">Oops!</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Algo deu errado</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato conosco se o problema persistir.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={reset}
            className="inline-block bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
          >
            Tentar Novamente
          </button>
          
          <div className="text-center">
            <Link 
              href="/dashboard" 
              className="text-red-600 hover:text-red-700 underline"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm text-gray-700 max-w-lg mx-auto">
            <strong>Erro:</strong> {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
