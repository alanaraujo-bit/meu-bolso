"use client";

import Link from 'next/link';
import Logo from '@/components/branding/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <Logo size="xl" className="justify-center" />
        </div>
        
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida para outro lugar.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/dashboard" 
            className="inline-block bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
          >
            Ir para o Dashboard
          </Link>
          
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
