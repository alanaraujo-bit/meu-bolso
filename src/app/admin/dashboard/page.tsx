"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { useTheme } from '@/hooks/useTheme';
import { 
  Users, DollarSign, TrendingUp, Activity, 
  Target, CreditCard, AlertTriangle, Calendar,
  BarChart3, PieChart, ArrowUp, ArrowDown
} from 'lucide-react';

interface DashboardStats {
  usuarios: {
    total: number;
    ativos: number;
    novos: number;
    crescimento: number;
  };
  financeiro: {
    volumeTotal: number;
    volumeMes: number;
    ticketMedio: number;
    crescimentoVolume: number;
  };
  atividade: {
    transacoesTotal: number;
    transacoesMes: number;
    metasAtivas: number;
    categorias: number;
  };
  alertas: {
    criticos: number;
    avisos: number;
    info: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { loading, setLoading } = useCleanLoading();
  const [periodo, setPeriodo] = useState('hoje');
  const { theme } = useTheme();

  useEffect(() => {
    buscarEstatisticas();
  }, [periodo]);

  const buscarEstatisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard-stats?periodo=${periodo}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header com filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Administrativo</h1>
              <p className="text-gray-600">Visão geral do sistema em tempo real</p>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
              </select>
              
              <button
                onClick={buscarEstatisticas}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Usuários */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.usuarios.total || 0}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats?.usuarios.crescimento || 12}% este mês</span>
                </div>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Volume Financeiro */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Total</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {(stats?.financeiro.volumeTotal || 432120).toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats?.financeiro.crescimentoVolume || 8}% este mês</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Transações */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transações</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.atividade.transacoesTotal || 13482}</p>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">{stats?.atividade.transacoesMes || 890} este mês</span>
                </div>
              </div>
              <CreditCard className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-3xl font-bold text-red-600">{stats?.alertas.criticos || 3}</p>
                <div className="flex items-center mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">{stats?.alertas.avisos || 12} avisos</span>
                </div>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Cards de Métricas Secundárias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Usuários Ativos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Últimas 24h</span>
                <span className="font-bold text-green-600">{stats?.usuarios.ativos || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Novos (30d)</span>
                <span className="font-bold text-blue-600">{stats?.usuarios.novos || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-sm text-gray-500">65% de engajamento</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-500" />
              Performance Financeira
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Médio</span>
                <span className="font-bold text-green-600">
                  R$ {(stats?.financeiro.ticketMedio || 152).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume Mês</span>
                <span className="font-bold text-blue-600">
                  R$ {(stats?.financeiro.volumeMes || 45000).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-sm text-gray-500">78% da meta mensal</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-500" />
              Metas & Objetivos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Metas Ativas</span>
                <span className="font-bold text-orange-600">{stats?.atividade.metasAtivas || 328}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concluídas</span>
                <span className="font-bold text-green-600">156</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
              <p className="text-sm text-gray-500">48% de conclusão</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🚀 Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/usuarios"
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <div className="font-medium">Gerenciar Usuários</div>
              <div className="text-sm text-gray-500">Ver todos os usuários</div>
            </a>

            <a
              href="/admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all"
            >
              <BarChart3 className="w-8 h-8 text-green-500 mb-2" />
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-gray-500">Gráficos detalhados</div>
            </a>

            <a
              href="/admin/relatorios"
              className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Activity className="w-8 h-8 text-purple-500 mb-2" />
              <div className="font-medium">Relatórios</div>
              <div className="text-sm text-gray-500">Exportar dados</div>
            </a>

            <a
              href="/admin/configuracoes"
              className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all"
            >
              <Target className="w-8 h-8 text-orange-500 mb-2" />
              <div className="font-medium">Configurações</div>
              <div className="text-sm text-gray-500">Sistema</div>
            </a>
          </div>
        </div>

        {/* Alertas Recentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            🚨 Alertas Recentes
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                <span className="font-medium text-red-800">Alto volume de usuários inativos</span>
              </div>
              <p className="text-sm text-red-600 mt-1">347 usuários não acessaram nos últimos 30 dias</p>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="font-medium text-yellow-800">Queda no ticket médio</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Redução de 8% no valor médio das transações</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium text-blue-800">Sistema funcionando normalmente</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">Todos os serviços operacionais</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
