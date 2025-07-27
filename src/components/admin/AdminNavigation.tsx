"use client";

import { usePathname } from 'next/navigation';
import { BarChart3, Users, Settings, Home } from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      description: 'Métricas e análises gerais'
    },
    {
      name: 'Dashboard Avançado',
      href: '/admin-avancado',
      icon: BarChart3,
      description: 'Dashboard completo com KPIs'
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: Users,
      description: 'Gerenciar todos os usuários'
    },
    {
      name: 'Voltar ao App',
      href: '/dashboard',
      icon: Home,
      description: 'Voltar para o dashboard normal'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧭 Navegação Admin</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="font-medium">{item.name}</span>
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
