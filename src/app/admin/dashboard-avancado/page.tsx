"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardLoading from '@/components/admin/DashboardLoading';
import { useTheme } from '@/hooks/useTheme';
import { 
  Users, DollarSign, TrendingUp, Activity, Target, CreditCard, 
  AlertTriangle, Calendar, BarChart3, PieChart, ArrowUp, ArrowDown,
  Clock, Shield, Globe, Database, Server, Zap, Eye, UserCheck,
  FileText, Settings, Filter, Download, RefreshCw, Bell,
  Heart, Star, MapPin, Smartphone, Monitor, Tablet
} from 'lucide-react';

interface AdvancedDashboardStats {
  usuarios: {
    total: number;
    ativos: number;
    novos: number;
    inativos: number;
    crescimento: number;
    retencao: number;
    churn: number;
    sessoesPorUsuario: number;
    tempoMedioSessao: number;
    dispositivoMaisUsado: string;
    horarioPico: string;
    cidadeComMaisUsuarios: string;
  };
  financeiro: {
    volumeTotal: number;
    volumeMes: number;
    volumeSemana: number;
    volumeHoje: number;
    ticketMedio: number;
    crescimentoVolume: number;
    maiorTransacao: number;
    menorTransacao: number;
    receitas: number;
    despesas: number;
    lucroLiquido: number;
    margemLucro: number;
    projecaoMes: number;
    comparativoMesAnterior: number;
  };
  atividade: {
    transacoesTotal: number;
    transacoesMes: number;
    transacoesSemana: number;
    transacoesHoje: number;
    metasAtivas: number;
    metasConcluidas: number;
    metasVencidas: number;
    categorias: number;
    categoriaMaisUsada: string;
    recorrentesAtivas: number;
    recorrentesInativas: number;
    notificacoesEnviadas: number;
    emailsAbertos: number;
    taxaEngajamento: number;
  };
  sistema: {
    uptime: number;
    performanceScore: number;
    requestsPorMinuto: number;
    tempoResposta: number;
    erros: number;
    warnings: number;
    usuariosOnline: number;
    backupsRealizados: number;
    storageUsado: number;
    bandwidthUsada: number;
    versaoAtual: string;
  };
  alertas: {
    criticos: number;
    avisos: number;
    info: number;
    recentes: Array<{
      id: string;
      tipo: 'critico' | 'aviso' | 'info';
      titulo: string;
      descricao: string;
      tempo: string;
    }>;
  };
  insights: {
    tendenciaCrescimento: string;
    pontoAtencao: string;
    oportunidade: string;
    previsaoProximoMes: number;
    recomendacao: string;
  };
}

export default function AdvancedAdminDashboard() {
  const [stats, setStats] = useState<AdvancedDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { theme } = useTheme();

  useEffect(() => {
    buscarEstatisticas();
    
    if (autoRefresh) {
      const interval = setInterval(buscarEstatisticas, 30000); // Atualiza a cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [periodo, autoRefresh]);

  const buscarEstatisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/advanced-dashboard-stats?periodo=${periodo}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas avançadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarDados = async () => {
    try {
      const response = await fetch(`/api/admin/export-dashboard?periodo=${periodo}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `dashboard-data-${periodo}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <DashboardLoading message="Carregando métricas avançadas..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Super Avançado */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <BarChart3 className="mr-3 h-8 w-8 text-emerald-500" />
                Dashboard Administrativo Avançado
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                Análise completa em tempo real | Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-emerald-500`}
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Este Ano</option>
              </select>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg border ${
                  autoRefresh 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700'
                } hover:opacity-80 transition-all flex items-center`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              
              <button
                onClick={buscarEstatisticas}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
              
              <button
                onClick={exportarDados}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Alertas Críticos no Topo */}
        {(stats?.alertas?.criticos || 0) > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                  🚨 {stats?.alertas?.criticos || 0} Alertas Críticos Detectados
                </h3>
                <p className="text-red-600 dark:text-red-400">Requerem atenção imediata!</p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Super Detalhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Usuários Total */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Usuários Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.usuarios.total || 0}</p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+{stats?.usuarios.crescimento || 0}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Usuários Ativos */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats?.usuarios.ativos || 0}</p>
                <div className="flex items-center mt-1">
                  <UserCheck className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">{stats?.usuarios.retencao || 0}% retenção</span>
                </div>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Volume Financeiro */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Volume Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {(stats?.financeiro.volumeTotal || 0).toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
                  <span className="text-xs text-emerald-600">+{stats?.financeiro.crescimentoVolume || 0}%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          {/* Transações */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Transações</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.atividade.transacoesTotal || 0}</p>
                <div className="flex items-center mt-1">
                  <Activity className="w-3 h-3 text-purple-500 mr-1" />
                  <span className="text-xs text-purple-600">{stats?.atividade.transacoesMes || 0} este mês</span>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          {/* Sistema Uptime */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Uptime</p>
                <p className="text-2xl font-bold text-indigo-600">{stats?.sistema.uptime || 99.9}%</p>
                <div className="flex items-center mt-1">
                  <Server className="w-3 h-3 text-indigo-500 mr-1" />
                  <span className="text-xs text-indigo-600">Sistema estável</span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          {/* Performance */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Performance</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.sistema.performanceScore || 95}</p>
                <div className="flex items-center mt-1">
                  <Zap className="w-3 h-3 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-600">{stats?.sistema.tempoResposta || 120}ms</span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Gráficos e Métricas Avançadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Análise Financeira Detalhada */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
              💰 Análise Financeira
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Receitas</span>
                <span className="font-bold text-green-600">
                  R$ {(stats?.financeiro.receitas || 0).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Despesas</span>
                <span className="font-bold text-red-600">
                  R$ {(stats?.financeiro.despesas || 0).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Lucro Líquido</span>
                <span className="font-bold text-blue-600">
                  R$ {(stats?.financeiro.lucroLiquido || 0).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Margem de Lucro</span>
                <span className="font-bold text-purple-600">{stats?.financeiro.margemLucro || 0}%</span>
              </div>
              <div className="pt-2">
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((stats?.financeiro.margemLucro || 0), 100)}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Meta: 25% | Atual: {stats?.financeiro.margemLucro || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Análise de Usuários */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              👥 Análise de Usuários
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Taxa de Retenção</span>
                <span className="font-bold text-green-600">{stats?.usuarios.retencao || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Taxa de Churn</span>
                <span className="font-bold text-red-600">{stats?.usuarios.churn || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Sessões/Usuário</span>
                <span className="font-bold text-blue-600">{stats?.usuarios.sessoesPorUsuario || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Tempo Médio</span>
                <span className="font-bold text-purple-600">{stats?.usuarios.tempoMedioSessao || 0}min</span>
              </div>
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Horário Pico:</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats?.usuarios.horarioPico || '14:00-16:00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Dispositivo Popular:</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats?.usuarios.dispositivoMaisUsado || 'Mobile'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sistema e Performance */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Server className="w-5 h-5 mr-2 text-indigo-500" />
              🖥️ Sistema & Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Usuários Online</span>
                <span className="font-bold text-green-600">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {stats?.sistema.usuariosOnline || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Requests/min</span>
                <span className="font-bold text-blue-600">{stats?.sistema.requestsPorMinuto || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Storage Usado</span>
                <span className="font-bold text-orange-600">{stats?.sistema.storageUsado || 0}GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Bandwidth</span>
                <span className="font-bold text-purple-600">{stats?.sistema.bandwidthUsada || 0}MB</span>
              </div>
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <div className="font-medium text-green-600">{stats?.sistema.backupsRealizados || 0}</div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Backups</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                    <div className="font-medium text-blue-600">v{stats?.sistema.versaoAtual || '2.1.0'}</div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Versão</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Inteligentes */}
        {stats?.insights && (
          <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} rounded-lg shadow-lg p-6 border`}>
            <h3 className={`text-xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <BarChart3 className="w-6 h-6 mr-3 text-emerald-500" />
              🧠 Insights Inteligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'} mb-2`}>📈 Tendência</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stats.insights.tendenciaCrescimento}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'} mb-2`}>⚠️ Atenção</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stats.insights.pontoAtencao}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} mb-2`}>💡 Oportunidade</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stats.insights.oportunidade}
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <h4 className="font-medium text-white mb-2">🎯 Recomendação Principal</h4>
              <p className="text-white/90 text-sm">{stats.insights.recomendacao}</p>
            </div>
          </div>
        )}

        {/* Alertas Detalhados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              🚨 Alertas Recentes
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats?.alertas.recentes?.map((alerta) => (
                <div 
                  key={alerta.id}
                  className={`p-3 rounded-lg border ${
                    alerta.tipo === 'critico' 
                      ? theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                      : alerta.tipo === 'aviso'
                      ? theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                      : theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        alerta.tipo === 'critico' 
                          ? theme === 'dark' ? 'text-red-300' : 'text-red-800'
                          : alerta.tipo === 'aviso'
                          ? theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                          : theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        {alerta.titulo}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        alerta.tipo === 'critico' 
                          ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                          : alerta.tipo === 'aviso'
                          ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                          : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {alerta.descricao}
                      </p>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                      {alerta.tempo}
                    </span>
                  </div>
                </div>
              )) || (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum alerta recente</p>
                </div>
              )}
            </div>
          </div>

          {/* Ações Rápidas Avançadas */}
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Zap className="w-5 h-5 mr-2 text-orange-500" />
              🚀 Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-all group`}>
                <Users className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usuários</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gerenciar</div>
              </button>
              
              <button className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-all group`}>
                <BarChart3 className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Detalhado</div>
              </button>
              
              <button className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-all group`}>
                <FileText className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Relatórios</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Exportar</div>
              </button>
              
              <button className={`p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-all group`}>
                <Settings className="w-6 h-6 text-gray-500 mb-2 group-hover:scale-110 transition-transform" />
                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Config</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sistema</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
