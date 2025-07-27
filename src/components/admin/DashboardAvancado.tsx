"use client";

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, TrendingUp, DollarSign, Target, Calendar,
  Download, RefreshCw, Filter, AlertTriangle, Award,
  PieChart as PieIcon, BarChart3, TrendingDown
} from 'lucide-react';
import AlertasAdmin from './AlertasAdmin';

interface DashboardData {
  kpis: {
    totalUsuarios: number;
    usuariosAtivos7d: number;
    novosUsuarios30d: number;
    totalTransacoes: number;
    volumeFinanceiroTotal: number;
    metasAtivas: number;
    taxaRetencao: number;
    ticketMedio: number;
  };
  graficos: {
    crescimentoUsuarios: Array<{ data: string; usuarios: number }>;
    transacoesDiarias: Array<{ data: string; total: number; valor: number }>;
    tiposTransacao: Array<{ tipo: string; count: number; valor: number }>;
    retencaoSemanal: Array<{ semana: string; retencao: number }>;
  };
  rankings: {
    usuariosMaisAtivos: Array<{ id: number; nome: string; email: string; transacoes: number; valorTotal: number }>;
    categoriasMaisUsadas: Array<{ id: number; nome: string; cor: string; totalTransacoes: number; valorTotal: number }>;
    topMetas: Array<{ id: number; nome: string; valorAlvo: number; valorAtual: number; concluida: boolean }>;
  };
  resumo: {
    metasCriadas: number;
    metasConcluidas: number;
    totalCategorias: number;
    valorMedio: number;
    periodo: string;
  };
}

const CORES_GRAFICOS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#f0e68c'
];

export default function DashboardAvancado() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const buscarDados = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/metrics-avancado?periodo=${periodo}`);
      if (response.ok) {
        const data = await response.json();
        setDados(data);
        setUltimaAtualizacao(new Date());
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
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
  }, [autoRefresh]);

  const exportarRelatorio = async (formato: 'pdf' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/export?formato=${formato}&periodo=${periodo}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-admin-${periodo}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg">Carregando métricas...</span>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Administrativo</h1>
            <p className="text-sm text-gray-500">
              Última atualização: {ultimaAtualizacao.toLocaleString('pt-BR')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Link para Usuários */}
            <a
              href="/admin/usuarios"
              className="px-3 py-2 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-200 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Ver Usuários</span>
            </a>

            {/* Filtro de Período */}
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>

            {/* Auto Refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>Auto</span>
            </button>

            {/* Refresh Manual */}
            <button
              onClick={buscarDados}
              className="px-3 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>

            {/* Export */}
            <div className="flex space-x-2">
              <button
                onClick={() => exportarRelatorio('pdf')}
                className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => exportarRelatorio('csv')}
                className="px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{dados.kpis.totalUsuarios.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos (7d)</p>
              <p className="text-2xl font-bold text-green-600">{dados.kpis.usuariosAtivos7d.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Usuários (30d)</p>
              <p className="text-2xl font-bold text-purple-600">{dados.kpis.novosUsuarios30d.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Transações</p>
              <p className="text-2xl font-bold text-blue-600">{dados.kpis.totalTransacoes.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Volume Financeiro Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {dados.kpis.volumeFinanceiroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Metas Ativas</p>
              <p className="text-2xl font-bold text-orange-600">{dados.kpis.metasAtivas.toLocaleString()}</p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Retenção (30d)</p>
              <p className="text-2xl font-bold text-indigo-600">{dados.kpis.taxaRetencao}%</p>
            </div>
            <Award className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Médio por Usuário</p>
              <p className="text-2xl font-bold text-teal-600">
                R$ {dados.kpis.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-teal-500" />
          </div>
        </div>
      </div>

      {/* 2. Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de Usuários */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            📈 Crescimento de Usuários
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dados.graficos.crescimentoUsuarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usuarios" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transações Diárias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
            📊 Transações Diárias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados.graficos.transacoesDiarias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de Transação */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-purple-500" />
            🥧 Tipos de Transação
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dados.graficos.tiposTransacao}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ tipo, count }) => `${tipo}: ${count}`}
              >
                {dados.graficos.tiposTransacao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Retenção Semanal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
            📉 Retenção Semanal/Cohort
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dados.graficos.retencaoSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="retencao" stroke="#ff7c7c" fill="#ff7c7c" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Tabelas e Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuários Mais Ativos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            🏆 Usuários Mais Ativos
          </h3>
          <div className="space-y-3">
            {dados.rankings.usuariosMaisAtivos.slice(0, 5).map((usuario, index) => (
              <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{usuario.nome}</p>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{usuario.transacoes} trans.</p>
                  <p className="text-xs text-gray-500">R$ {usuario.valorTotal.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias Mais Usadas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-green-500" />
            📋 Categorias Mais Usadas
          </h3>
          <div className="space-y-3">
            {dados.rankings.categoriasMaisUsadas.slice(0, 5).map((categoria, index) => (
              <div key={categoria.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <span className="font-medium text-sm">{categoria.nome}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{categoria.totalTransacoes}</p>
                  <p className="text-xs text-gray-500">R$ {categoria.valorTotal.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Metas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            🎯 Top Metas
          </h3>
          <div className="space-y-3">
            {dados.rankings.topMetas.slice(0, 5).map((meta) => {
              const progresso = (meta.valorAtual / meta.valorAlvo) * 100;
              return (
                <div key={meta.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{meta.nome}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      meta.concluida 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {meta.concluida ? '✅ Concluída' : '🔄 Em andamento'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(progresso, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>R$ {meta.valorAtual.toLocaleString()}</span>
                    <span>R$ {meta.valorAlvo.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Resumo Geral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            📋 Resumo Geral - {dados.resumo.periodo}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{dados.resumo.metasCriadas}</p>
              <p className="text-sm text-blue-700">Metas Criadas</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{dados.resumo.metasConcluidas}</p>
              <p className="text-sm text-green-700">Metas Concluídas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{dados.resumo.totalCategorias}</p>
              <p className="text-sm text-purple-700">Categorias Criadas</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                R$ {dados.resumo.valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-orange-700">Valor Médio por Transação</p>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <AlertasAdmin dados={dados} />
      </div>
    </div>
  );
}
