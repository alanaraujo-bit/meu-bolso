"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, DollarSign, TrendingUp, Target, Calendar, Clock,
  Smartphone, Monitor, Wifi, WifiOff, AlertTriangle, Award,
  RefreshCw, Download, Eye, Settings, Bell, Filter,
  ArrowUp, ArrowDown, Activity, CircleDot
} from 'lucide-react';

interface DashboardData {
  // KPIs principais
  kpis: {
    usuariosOnlineAgora: number;
    usuariosAtivos24h: number;
    usuariosAtivos7d: number;
    totalUsuarios: number;
    novosUsuarios30d: number;
    totalTransacoes: number;
    volumeFinanceiroTotal: number;
    metasAtivas: number;
    taxaRetencao: number;
    ticketMedio: number;
    crescimentoUsuarios: number;
    crescimentoReceitas: number;
  };
  
  // Atividade em tempo real
  atividadeOnline: {
    usuariosOnline: Array<{
      nome: string;
      ultimaAtividade: string;
      statusOnline: 'online' | 'ausente' | 'offline';
    }>;
    historicoAtividade: Array<{
      hora: string;
      online: number;
      ativo: number;
    }>;
  };
  
  // Gráficos principais
  graficos: {
    crescimentoUsuarios: Array<{ data: string; total: number; novos: number }>;
    transacoesDiarias: Array<{ data: string; receitas: number; despesas: number }>;
    distribuicaoUsuarios: Array<{ status: string; valor: number; cor: string }>;
    performanceFinanceira: Array<{ mes: string; receitas: number; despesas: number; saldo: number }>;
  };
  
  // Rankings e listas
  rankings: {
    usuariosMaisAtivos: Array<{
      nome: string;
      email: string;
      transacoes: number;
      valorTotal: number;
      ultimaAtividade: string;
    }>;
    categoriasMaisUsadas: Array<{
      nome: string;
      cor: string;
      totalTransacoes: number;
      valorTotal: number;
    }>;
    alertasAtivos: Array<{
      tipo: 'warning' | 'error' | 'info';
      titulo: string;
      descricao: string;
      timestamp: string;
    }>;
  };
  
  // Métricas detalhadas
  metricas: {
    tempoMedioSessao: number;
    paginasMaisAcessadas: Array<{ pagina: string; acessos: number }>;
    dispositivosAtivos: Array<{ tipo: string; quantidade: number }>;
    horariosPico: Array<{ hora: number; atividade: number }>;
  };
}

const CORES = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  gray: '#6B7280',
};

export default function DashboardAdminAprimorado() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [periodo, setPeriodo] = useState('7d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'realtime'>('overview');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const buscarDados = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard-aprimorado?periodo=${periodo}`);
      if (response.ok) {
        const data = await response.json();
        setDados(data);
        setUltimaAtualizacao(new Date());
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [periodo]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(buscarDados, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh, periodo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const StatusIndicator = ({ status }: { status: 'online' | 'ausente' | 'offline' }) => {
    const colors = {
      online: 'bg-green-500',
      ausente: 'bg-yellow-500',
      offline: 'bg-gray-400',
    };
    
    return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
  };

  if (loading && !dados) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Erro ao carregar dados do dashboard</p>
        <button 
          onClick={buscarDados}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header aprimorado */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-blue-600" />
              Dashboard Administrativo
              <span className="ml-3 text-sm font-normal text-gray-500">
                v2.0
              </span>
            </h1>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}
              <span className="mx-2">•</span>
              <CircleDot className={`w-4 h-4 mr-1 ${autoRefresh ? 'text-green-500' : 'text-gray-400'}`} />
              {autoRefresh ? 'Tempo real' : 'Manual'}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Seletor de período */}
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            
            {/* Modo de visualização */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {[
                { key: 'overview', label: 'Visão Geral', icon: Eye },
                { key: 'detailed', label: 'Detalhado', icon: BarChart },
                { key: 'realtime', label: 'Tempo Real', icon: Wifi },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key as any)}
                  className={`px-3 py-2 text-sm font-medium flex items-center ${
                    viewMode === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            
            {/* Controles */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto
            </button>
            
            <button
              onClick={buscarDados}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs principais - Cards responsivos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Usuários Online */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Online Agora
              </p>
              <p className="text-2xl font-bold text-green-600">
                {dados.kpis.usuariosOnlineAgora}
              </p>
              <div className="flex items-center mt-1">
                <Wifi className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-gray-500">tempo real</span>
              </div>
            </div>
            <div className="text-green-500">
              <CircleDot className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Usuários Ativos 24h */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Ativos 24h
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {dados.kpis.usuariosAtivos24h}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600">
                  {formatPercent(dados.kpis.crescimentoUsuarios)}
                </span>
              </div>
            </div>
            <div className="text-blue-500">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Total de Usuários */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Total Usuários
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {dados.kpis.totalUsuarios.toLocaleString('pt-BR')}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">
                  +{dados.kpis.novosUsuarios30d} este mês
                </span>
              </div>
            </div>
            <div className="text-purple-500">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Volume Financeiro */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Volume Total
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(dados.kpis.volumeFinanceiroTotal)}
              </p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">
                  {formatPercent(dados.kpis.crescimentoReceitas)}
                </span>
              </div>
            </div>
            <div className="text-green-500">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Transações */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Transações
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {dados.kpis.totalTransacoes.toLocaleString('pt-BR')}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500">
                  Ticket médio: {formatCurrency(dados.kpis.ticketMedio)}
                </span>
              </div>
            </div>
            <div className="text-yellow-500">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Metas Ativas */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Metas Ativas
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {dados.kpis.metasAtivas}
              </p>
              <div className="flex items-center mt-1">
                <Target className="w-3 h-3 text-orange-500 mr-1" />
                <span className="text-xs text-gray-500">
                  {dados.kpis.taxaRetencao.toFixed(1)}% retenção
                </span>
              </div>
            </div>
            <div className="text-orange-500">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'realtime' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuários online em tempo real */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wifi className="w-5 h-5 mr-2 text-green-500" />
                Usuários Online Agora
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {dados.atividadeOnline.usuariosOnline.map((usuario, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <StatusIndicator status={usuario.statusOnline} />
                      <span className="font-medium text-gray-900">{usuario.nome}</span>
                    </div>
                    <span className="text-sm text-gray-500">{usuario.ultimaAtividade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráfico de atividade em tempo real */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Atividade por Hora
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dados.atividadeOnline.historicoAtividade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="online" 
                    stackId="1" 
                    stroke={CORES.success} 
                    fill={CORES.success}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ativo" 
                    stackId="1" 
                    stroke={CORES.primary} 
                    fill={CORES.primary}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'overview' || viewMode === 'detailed') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crescimento de Usuários */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Crescimento de Usuários
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dados.graficos.crescimentoUsuarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke={CORES.primary} 
                    strokeWidth={2}
                    name="Total de Usuários"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="novos" 
                    stroke={CORES.success} 
                    strokeWidth={2}
                    name="Novos Usuários"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Financeira */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Financeira
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dados.graficos.performanceFinanceira}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="receitas" fill={CORES.success} name="Receitas" />
                  <Bar dataKey="despesas" fill={CORES.danger} name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Rankings e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuários mais ativos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Top Usuários
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dados.rankings.usuariosMaisAtivos.map((usuario, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{usuario.nome}</p>
                      <p className="text-sm text-gray-500">{usuario.transacoes} transações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(usuario.valorTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categorias mais usadas */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Categorias
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dados.rankings.categoriasMaisUsadas.map((categoria, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoria.cor }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{categoria.nome}</p>
                      <p className="text-sm text-gray-500">{categoria.totalTransacoes} usos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(categoria.valorTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas ativos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Alertas ({dados.rankings.alertasAtivos.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dados.rankings.alertasAtivos.map((alerta, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alerta.tipo === 'error' ? 'bg-red-50 border-red-500' :
                  alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{alerta.titulo}</p>
                      <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                    </div>
                    <span className="text-xs text-gray-500">{alerta.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
