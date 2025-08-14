"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Database, Users, Home, Settings, 
  BarChart3, LogOut, Trash2
} from 'lucide-react';

interface AdminCleanLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    name: 'Dashboard Principal',
    href: '/admin/clean',
    icon: Database,
    description: 'Visão geral simplificada'
  },
  {
    name: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
    description: 'Gerenciar usuários'
  },
  {
    name: 'Estatísticas',
    href: '/admin/dashboard',
    icon: BarChart3,
    description: 'Relatórios detalhados'
  }
];

export default function AdminCleanLayout({ children }: AdminCleanLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Clean</h1>
                <p className="text-xs text-gray-500">Painel administrativo simplificado</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4" />
                <span>Voltar ao App</span>
              </Link>
              
              <Link
                href="/api/auth/signout"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegação */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Aviso de Funcionalidades */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Trash2 className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Funcionalidades Administrativas</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Este painel permite exclusão completa de usuários e todos os seus dados. 
                Use com cuidado - todas as ações são irreversíveis.
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
