"use client";

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  BarChart3, Users, Settings, Database, FileText, 
  TrendingUp, Shield, LogOut, Bell, Search,
  Home, Activity, DollarSign, Target, Calendar,
  MessageSquare, CreditCard, AlertTriangle, Wifi
} from 'lucide-react';
import NotificacaoAdmin from './NotificacaoAdmin';

const ADMIN_EMAILS = ['alanvitoraraujo1a@outlook.com', 'admin@meubolso.com'];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }

    // Verificar se é admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  const adminTabs = [
    {
      name: 'Dashboard Principal',
      href: '/admin/dashboard',
      icon: Home,
      description: 'Visão geral e métricas principais'
    },
    {
      name: 'Dashboard Aprimorado',
      href: '/admin/dashboard-aprimorado',
      icon: Activity,
      description: 'Dashboard avançado com tempo real'
    },
    {
      name: 'Usuários Online',
      href: '/admin/usuarios-online',
      icon: Wifi,
      description: 'Monitor de usuários em tempo real'
    },
    {
      name: 'Gerenciar Usuários',
      href: '/admin/usuarios',
      icon: Users,
      description: 'Lista e controle de usuários'
    },
    {
      name: 'Transações Globais',
      href: '/admin/transacoes',
      icon: CreditCard,
      description: 'Todas as transações do sistema'
    },
    {
      name: 'Logs do Sistema',
      href: '/admin/logs',
      icon: Database,
      description: 'Logs e auditoria'
    },
    {
      name: 'Monitoramento',
      href: '/admin/monitoramento',
      icon: AlertTriangle,
      description: 'Performance e recursos do sistema'
    },
    {
      name: 'Configurações',
      href: '/admin/configuracoes',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Header Admin */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
              <h1 className="text-xl font-bold flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-400" />
                Admin Panel
              </h1>
              <p className="text-sm text-gray-400">Meu Bolso - Sistema</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {adminTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            
            return (
              <a
                key={tab.name}
                href={tab.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-gray-700 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                }`}
                title={sidebarOpen ? '' : tab.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-400">{tab.description}</div>
                  </div>
                )}
              </a>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">{session.user.email?.split('@')[0]}</div>
                <div className="text-xs text-gray-400">Administrador</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg hover:bg-gray-700 text-red-400"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🛡️ Painel Administrativo
              </h2>
              <p className="text-sm text-gray-600">
                Sistema de gestão completo - Meu Bolso
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* Notifications */}
              <NotificacaoAdmin />
              
              {/* User Menu */}
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
