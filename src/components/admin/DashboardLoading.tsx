"use client";

import { useTheme } from '@/hooks/useTheme';

interface DashboardLoadingProps {
  message?: string;
}

export default function DashboardLoading({ message = "Carregando dados..." }: DashboardLoadingProps) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center space-y-6">
        {/* Logo animado */}
        <div className="relative">
          <div className={`w-20 h-20 rounded-full border-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t-emerald-500 animate-spin mx-auto`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`}></div>
          </div>
        </div>
        
        {/* Texto */}
        <div className="space-y-2">
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {message}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Aguarde enquanto processamos suas informações...
          </p>
        </div>
        
        {/* Barras de progresso animadas */}
        <div className="space-y-2 w-64 mx-auto">
          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full animate-pulse w-3/4"></div>
          </div>
          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse w-1/2 delay-75"></div>
          </div>
          <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse w-2/3 delay-150"></div>
          </div>
        </div>
        
        {/* Métricas simuladas */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`}></div>
            <div className={`h-3 rounded w-3/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`}></div>
            <div className={`h-3 rounded w-2/3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className={`h-4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`}></div>
            <div className={`h-3 rounded w-4/5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
