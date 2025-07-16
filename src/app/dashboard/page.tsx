'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import MoneyLoading from '@/components/MoneyLoading';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  CreditCard,
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardData {
  periodo: {
    mes: number;
    ano: number;
  };
  resumo: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    economias: number;
    transacoesCount: number;
    categoriasCount: number;
    receitasCount: number;
    despesasCount: number;
    totalEconomizado: number;
    metasAtivas: number;
    metasConcluidas: number;
    variacaoReceitas: number;
    variacaoDespesas: number;
    taxaEconomia: number;
    mediaGastoDiario: number;
    maiorGasto?: {
      descricao: string;
      valor: number;
      categoria: string;
    };
  };
  graficos: {
    receitasPorCategoria: Array<{
      categoria: string;
      valor: number;
      cor: string;
    }>;
    gastosPorCategoria: Array<{
      categoria: string;
      valor: number;
      cor: string;
      transacoes: number;
    }>;
    evolucaoMensal: Array<{
      mes: string;
      receitas: number;
      despesas: number;
      saldo: number;
    }>;
    comparacaoMensal: {
      atual: { receitas: number; despesas: number; saldo: number };
      anterior: { receitas: number; despesas: number; saldo: number };
    };
  };
  metas: {
    ativas: Array<{
      id: string;
      nome: string;
      valorAlvo: number;
      currentAmount: number;
      progresso: number;
      dataAlvo: string;
    }>;
    concluidas: Array<any>;
    vencidas: Array<any>;
    resumo: {
      total: number;
      ativas: number;
      concluidas: number;
      vencidas: number;
      totalEconomizado: number;
    };
  };
  insights: Array<{
    tipo: string;
    titulo: string;
    descricao: string;
    icone: string;
  }>;
}

export default function Dashboard() {
  const { status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoAvancado, setModoAvancado] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, mesAtual, anoAtual]);

  // Carregar preferência do usuário
  useEffect(() => {
    const preferencia = localStorage.getItem('dashboard-modo');
    if (preferencia === 'avancado') {
      setModoAvancado(true);
    }
  }, []);

  const toggleModo = () => {
    const novoModo = !modoAvancado;
    setModoAvancado(novoModo);
    localStorage.setItem('dashboard-modo', novoModo ? 'avancado' : 'simples');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?mes=${mesAtual}&ano=${anoAtual}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    if (direcao === 'anterior') {
      if (mesAtual === 1) {
        setMesAtual(12);
        setAnoAtual(anoAtual - 1);
      } else {
        setMesAtual(mesAtual - 1);
      }
    } else {
      if (mesAtual === 12) {
        setMesAtual(1);
        setAnoAtual(anoAtual + 1);
      } else {
        setMesAtual(mesAtual + 1);
      }
    }
  };

  const voltarParaHoje = () => {
    const hoje = new Date();
    setMesAtual(hoje.getMonth() + 1);
    setAnoAtual(hoje.getFullYear());
  };

  const formatarMesAno = (mes: number, ano: number) => {
    const data = new Date(ano, mes - 1);
    return data.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isHoje = () => {
    const hoje = new Date();
    return mesAtual === hoje.getMonth() + 1 && anoAtual === hoje.getFullYear();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <MoneyLoading text="Carregando dashboard..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-lg shadow">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum dado encontrado</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'sucesso': return <CheckCircle className="h-5 w-5" />;
      case 'alerta': return <AlertTriangle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getInsightColor = (tipo: string) => {
    switch (tipo) {
      case 'sucesso': return 'bg-green-50 border-green-200 text-green-800';
      case 'alerta': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Preparar dados para gráficos
  const dadosGraficoPizza = dashboardData.graficos.gastosPorCategoria.map(item => ({
    name: item.categoria,
    value: item.valor,
    fill: item.cor
  }));

  const dadosReceitasPizza = dashboardData.graficos.receitasPorCategoria.map(item => ({
    name: item.categoria,
    value: item.valor,
    fill: item.cor
  }));

  const dadosComparacao = [
    {
      periodo: 'Mês Anterior',
      receitas: dashboardData.graficos.comparacaoMensal.anterior.receitas,
      despesas: dashboardData.graficos.comparacaoMensal.anterior.despesas,
      saldo: dashboardData.graficos.comparacaoMensal.anterior.saldo
    },
    {
      periodo: 'Mês Atual',
      receitas: dashboardData.graficos.comparacaoMensal.atual.receitas,
      despesas: dashboardData.graficos.comparacaoMensal.atual.despesas,
      saldo: dashboardData.graficos.comparacaoMensal.atual.saldo
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com Navegação de Mês */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {modoAvancado ? 'Avançado' : 'Simples'}
              </span>
              <button
                onClick={toggleModo}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  modoAvancado ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    modoAvancado ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Navegação de Mês/Ano */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <button
              onClick={() => navegarMes('anterior')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Anterior
            </button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-lg font-semibold text-gray-900">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                {formatarMesAno(mesAtual, anoAtual)}
              </div>
              
              {!isHoje() && (
                <button
                  onClick={voltarParaHoje}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Hoje
                </button>
              )}
            </div>

            <button
              onClick={() => navegarMes('proximo')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Próximo
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Receitas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(dashboardData.resumo.totalReceitas)}
                </p>
                {modoAvancado && (
                  <div className="flex items-center mt-1">
                    {dashboardData.resumo.variacaoReceitas >= 0 ? 
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : 
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    }
                    <span className={`text-sm ${dashboardData.resumo.variacaoReceitas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(dashboardData.resumo.variacaoReceitas)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Despesas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(dashboardData.resumo.totalDespesas)}
                </p>
                {modoAvancado && (
                  <div className="flex items-center mt-1">
                    {dashboardData.resumo.variacaoDespesas >= 0 ? 
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" /> : 
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    }
                    <span className={`text-sm ${dashboardData.resumo.variacaoDespesas >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatPercent(dashboardData.resumo.variacaoDespesas)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${dashboardData.resumo.saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <Wallet className={`h-6 w-6 ${dashboardData.resumo.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-semibold ${dashboardData.resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboardData.resumo.saldo)}
                </p>
                {modoAvancado && (
                  <p className="text-sm text-gray-500 mt-1">
                    Taxa: {dashboardData.resumo.taxaEconomia.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Transações</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.resumo.transacoesCount}
                </p>
                {modoAvancado ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Média: {formatCurrency(dashboardData.resumo.mediaGastoDiario)}/dia
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardData.resumo.receitasCount} receitas, {dashboardData.resumo.despesasCount} despesas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {modoAvancado && dashboardData.insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.tipo)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getInsightIcon(insight.tipo)}
                    </div>
                    <div>
                      <h3 className="font-medium">{insight.titulo}</h3>
                      <p className="text-sm mt-1">{insight.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Pizza - Despesas */}
          {dadosGraficoPizza.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGraficoPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {dadosGraficoPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gráfico de Pizza - Receitas (Modo Avançado) */}
          {modoAvancado && dadosReceitasPizza.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosReceitasPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {dadosReceitasPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Gráfico de Barras - Comparação */
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparação Mensal</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparacao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                    <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Evolução Mensal (Modo Avançado) */}
        {modoAvancado && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução dos Últimos 6 Meses</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.graficos.evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="receitas" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3}
                    name="Receitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesas" 
                    stackId="2" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.3}
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lista de Categorias */}
        {dashboardData.graficos.gastosPorCategoria.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoria</h2>
            <div className="space-y-3">
              {dashboardData.graficos.gastosPorCategoria.slice(0, modoAvancado ? 10 : 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: item.cor }}
                    ></div>
                    <div>
                      <span className="text-gray-900 font-medium">{item.categoria}</span>
                      {modoAvancado && (
                        <p className="text-xs text-gray-500">{item.transacoes} transações</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.valor)}
                    </span>
                    {modoAvancado && (
                      <p className="text-xs text-gray-500">
                        {((item.valor / dashboardData.resumo.totalDespesas) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metas */}
        {dashboardData.metas.ativas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metas Financeiras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.metas.ativas.slice(0, modoAvancado ? 9 : 6).map((meta) => (
                <div key={meta.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <PiggyBank className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-900">{meta.nome}</h3>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{formatCurrency(meta.currentAmount)}</span>
                      <span>{formatCurrency(meta.valorAlvo)}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-blue-600">
                        {meta.progresso.toFixed(1)}%
                      </span>
                      {modoAvancado && (
                        <span className="text-xs text-gray-500">
                          {new Date(meta.dataAlvo).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo Final */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Categorias</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">{dashboardData.resumo.categoriasCount}</p>
            <p className="text-sm text-gray-600">organizadas</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Metas</h3>
            <p className="text-2xl font-bold text-purple-600 mb-1">{dashboardData.metas.resumo.total}</p>
            <p className="text-sm text-gray-600">{dashboardData.metas.resumo.ativas} em andamento</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <PiggyBank className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Economizado</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(dashboardData.resumo.totalEconomizado)}
            </p>
            <p className="text-sm text-gray-600">em metas concluídas</p>
          </div>
        </div>
      </div>
    </div>
  );
}