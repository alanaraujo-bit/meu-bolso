'use client';

import { useState, useEffect } from 'react';
import { 
  formatarValor, 
  formatarValorCompacto, 
  ValorResponsivo 
} from '@/lib/formatters';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import CleanLoading from '@/components/CleanLoading';
import InsightInteligente from '@/components/InsightInteligente';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { usePerfilFinanceiro } from '@/hooks/useOnboarding';
import HelpButton from '@/components/HelpButton';
import { helpContents } from '@/lib/helpContents';
import PreviewProximoMes from '@/components/PreviewProximoMes';
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
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Brain
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
    // Informações sobre dívidas
    dividasAtivas?: number;
    valorTotalDividas?: number;
    valorTotalPagoDividas?: number;
    valorTotalRestanteDividas?: number;
    parcelasVencidas?: number;
    proximasParcelas?: number;
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
  dividas?: {
    proximasParcelas: Array<{
      id: string;
      dividaId: string;
      dividaNome: string;
      numero: number;
      valor: number;
      dataVencimento: string;
      categoria: string;
      cor: string;
      diasParaVencimento: number;
    }>;
    totalProximas: number;
    resumo: {
      ativas: number;
      valorTotal: number;
      valorPago: number;
      valorRestante: number;
      parcelasVencidas: number;
      proximasParcelas: number;
    };
  };
  insights: Array<{
    tipo: string;
    categoria?: string;
    titulo: string;
    descricao: string;
    recomendacao?: string;
    metricas?: string;
    icone: string;
    prioridade?: string;
  }>;
}

interface InsightCardProps {
  insight: {
    tipo: string;
    categoria?: string;
    titulo: string;
    descricao: string;
    recomendacao?: string;
    metricas?: string;
    icone: string;
    prioridade?: string;
  };
  getPriorityBorderColor: (prioridade?: string) => string;
  getPriorityBgColor: (prioridade?: string) => string;
  getCategoryColor: (categoria?: string) => string;
  getPriorityColor: (prioridade?: string) => string;
}

function InsightCard({ insight, getPriorityBorderColor, getPriorityBgColor, getCategoryColor, getPriorityColor }: InsightCardProps) {
  const [expandido, setExpandido] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className={`backdrop-blur-xl rounded-2xl shadow-xl border-l-4 overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
      darkMode 
        ? 'bg-gray-800/40 border-gray-700/50' 
        : 'bg-white/60 border-white/60'
    } ${getPriorityBorderColor(insight.prioridade)}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg ${getPriorityBgColor(insight.prioridade)}`}>
              {insight.icone}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {insight.categoria && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold ${
                    darkMode 
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    🏷️ {insight.categoria}
                  </span>
                )}
                {insight.prioridade && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold ${
                    insight.prioridade === 'critico' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : insight.prioridade === 'alto'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {insight.prioridade === 'critico' ? '🚨 Crítico' : 
                     insight.prioridade === 'alto' ? '⚠️ Alto' : 
                     '💡 Médio'}
                  </span>
                )}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {insight.titulo}
              </h3>
              <p className={`text-base leading-relaxed ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {insight.descricao}
              </p>
              
              {/* Conteúdo expandível */}
              {expandido && (
                <div className="mt-6 space-y-4">
                  {insight.recomendacao && (
                    <div className={`border-l-4 border-blue-400 p-4 rounded-xl ${
                      darkMode 
                        ? 'bg-blue-900/20 border-blue-500/30' 
                        : 'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Info className={`h-5 w-5 mt-0.5 ${
                            darkMode ? 'text-blue-400' : 'text-blue-500'
                          }`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            darkMode ? 'text-blue-300' : 'text-blue-800'
                          }`}>
                            💡 <span className="font-bold">Recomendação:</span> {insight.recomendacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {insight.metricas && (
                    <div className={`rounded-xl p-4 ${
                      darkMode 
                        ? 'bg-gray-700/30' 
                        : 'bg-gray-50'
                    }`}>
                      <div className={`flex items-start text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <BarChart3 className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <div>
                          <span className="font-semibold">📊 Métricas:</span>
                          <span className="ml-2 break-all">{insight.metricas}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Botão expandir */}
          {(insight.recomendacao || insight.metricas) && (
            <button
              onClick={() => setExpandido(!expandido)}
              className={`ml-4 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {expandido ? '🔼 Menos' : '🔽 Mais'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { loading, setLoading } = useCleanLoading();
  const [error, setError] = useState<string | null>(null);
  const [modoAvancado, setModoAvancado] = useState(false);
  const [mostrarInsights, setMostrarInsights] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [mostrarBoasVindas, setMostrarBoasVindas] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Hook para gerenciar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  // Verificar parâmetro de boas-vindas
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('welcome') === 'true') {
      setMostrarBoasVindas(true);
      // Remover o parâmetro da URL
      window.history.replaceState({}, '', '/dashboard');
      
      // Ocultar mensagem após 5 segundos
      setTimeout(() => {
        setMostrarBoasVindas(false);
      }, 5000);
    }
  }, []);

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
    
    const preferenciaInsights = localStorage.getItem('dashboard-insights');
    if (preferenciaInsights === 'visivel') {
      setMostrarInsights(true);
    }
  }, []);

  const toggleModo = () => {
    const novoModo = !modoAvancado;
    setModoAvancado(novoModo);
    localStorage.setItem('dashboard-modo', novoModo ? 'avancado' : 'simples');
  };

  const toggleInsights = () => {
    const novoEstado = !mostrarInsights;
    setMostrarInsights(novoEstado);
    localStorage.setItem('dashboard-insights', novoEstado ? 'visivel' : 'oculto');
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
    return <CleanLoading text="Carregando dashboard..." fullScreen />;
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

  // Novas funções para insights profissionais
  const getPriorityBorderColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'critica': return 'border-l-red-500';
      case 'alta': return 'border-l-orange-500';
      case 'media': return 'border-l-blue-500';
      case 'baixa': return 'border-l-gray-400';
      default: return 'border-l-blue-500';
    }
  };

  const getPriorityBgColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-600';
      case 'alta': return 'bg-orange-100 text-orange-600';
      case 'media': return 'bg-blue-100 text-blue-600';
      case 'baixa': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getPriorityColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'baixa': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryColor = (categoria?: string) => {
    switch (categoria) {
      case 'Performance': return 'bg-green-100 text-green-800';
      case 'Alerta Crítico': return 'bg-red-100 text-red-800';
      case 'Tendência': return 'bg-purple-100 text-purple-800';
      case 'Conquista': return 'bg-emerald-100 text-emerald-800';
      case 'Otimização': return 'bg-yellow-100 text-yellow-800';
      case 'Endividamento': return 'bg-orange-100 text-orange-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      case 'Planejamento': return 'bg-indigo-100 text-indigo-800';
      case 'Projeção': return 'bg-cyan-100 text-cyan-800';
      case 'Comportamento': return 'bg-pink-100 text-pink-800';
      case 'Automação': return 'bg-slate-100 text-slate-800';
      case 'Oportunidade': return 'bg-lime-100 text-lime-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className={`p-3 border rounded shadow transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-800 border-slate-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
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
    <div className={`min-h-screen relative overflow-hidden transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      {/* Botão Dark Mode - Responsivo e não sobreposto */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 z-40 p-2 rounded-full transition-all duration-300 sm:p-3 ${
          darkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-amber-400 hover:text-amber-300' 
            : 'bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900'
        } backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-110`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* Background decorativo - Ajustado para mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-10 -left-10 w-40 h-40 sm:w-72 sm:h-72 rounded-full mix-blend-multiply filter blur-xl opacity-50 sm:opacity-70 animate-pulse ${
          darkMode ? 'bg-emerald-900/30' : 'bg-emerald-200'
        }`}></div>
        <div className={`absolute -top-10 -right-10 w-40 h-40 sm:w-72 sm:h-72 rounded-full mix-blend-multiply filter blur-xl opacity-50 sm:opacity-70 animate-pulse animation-delay-2000 ${
          darkMode ? 'bg-teal-900/30' : 'bg-teal-200'
        }`}></div>
        <div className={`absolute -bottom-20 left-10 w-40 h-40 sm:w-72 sm:h-72 rounded-full mix-blend-multiply filter blur-xl opacity-50 sm:opacity-70 animate-pulse animation-delay-4000 ${
          darkMode ? 'bg-cyan-900/30' : 'bg-cyan-200'
        }`}></div>
      </div>

      {/* Container principal com padding responsivo */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        {/* Mensagem de Boas-vindas - Responsiva */}
        {mostrarBoasVindas && (
          <div className={`mb-4 sm:mb-6 rounded-xl p-4 sm:p-6 shadow-lg backdrop-blur-sm border transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-r from-emerald-800/80 to-teal-800/80 text-white border-emerald-600/30' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-white/20'
          }`}>
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  darkMode ? 'bg-emerald-600/50' : 'bg-white/20'
                }`}>
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold leading-tight">
                    🎉 Bem-vindo ao Meu Bolso, {session?.user?.name?.split(' ')[0]}!
                  </h2>
                  <p className={`text-sm sm:text-base mt-1 ${darkMode ? 'text-emerald-100' : 'text-emerald-100'}`}>
                    Configuração concluída! Agora você pode começar a controlar suas finanças.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarBoasVindas(false)}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  darkMode ? 'text-emerald-200 hover:text-white hover:bg-white/10' : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* Header com Navegação de Mês - Responsivo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                darkMode ? 'bg-emerald-600' : 'bg-emerald-600'
              }`}>
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Dashboard</h1>
                <p className={`text-sm sm:text-base transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Visão geral das suas finanças</p>
              </div>
              <div className="hidden sm:block">
                <HelpButton 
                  title="Como usar o Dashboard"
                  steps={helpContents.dashboard}
                  size="md"
                  variant="inline"
                />
              </div>
            </div>
            
            {/* Controles - Layout responsivo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Toggle Modo Avançado/Simples */}
              <div className="flex items-center space-x-2">
                <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {modoAvancado ? 'Avançado' : 'Simples'}
                </span>
                <button
                  onClick={toggleModo}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                    modoAvancado 
                      ? darkMode ? 'bg-emerald-600' : 'bg-emerald-600' 
                      : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      modoAvancado ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Botão para mostrar/ocultar insights */}
              {dashboardData?.insights && dashboardData.insights.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className={`text-xs sm:text-sm hidden sm:block transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Insights</span>
                  <button
                    onClick={toggleInsights}
                    className={`flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                      mostrarInsights 
                        ? darkMode 
                          ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50 border border-purple-600/30' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                        : darkMode
                          ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={mostrarInsights ? 'Ocultar Insights' : 'Mostrar Insights'}
                  >
                    <span className="mr-1">💡</span>
                    <span className="hidden sm:inline">
                      {mostrarInsights ? 'Ocultar' : 'Mostrar'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navegação de Mês/Ano - Responsiva */}
          <div className={`flex flex-col sm:flex-row items-center justify-between backdrop-blur-sm rounded-xl shadow-lg border p-3 sm:p-4 gap-3 sm:gap-0 transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <button
              onClick={() => navegarMes('anterior')}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-slate-700/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Ant</span>
            </button>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`flex items-center text-base sm:text-lg font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
                <span className="text-sm sm:text-lg">
                  {formatarMesAno(mesAtual, anoAtual)}
                </span>
              </div>
              
              {!isHoje() && (
                <button
                  onClick={voltarParaHoje}
                  className={`px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/50 border border-emerald-600/30' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  Hoje
                </button>
              )}
            </div>

            <button
              onClick={() => navegarMes('proximo')}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-slate-700/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Próximo</span>
              <span className="sm:hidden">Prox</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Cards de Resumo - Layout responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
              }`}>
                <DollarSign className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Receitas</p>
                <p className={`text-lg sm:text-2xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <ValorResponsivo valor={dashboardData.resumo.totalReceitas} />
                </p>
                {modoAvancado && (
                  <div className="flex items-center mt-1">
                    {dashboardData.resumo.variacaoReceitas >= 0 ? 
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-1" /> : 
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                    }
                    <span className={`text-xs sm:text-sm ${dashboardData.resumo.variacaoReceitas >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatPercent(dashboardData.resumo.variacaoReceitas)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                darkMode ? 'bg-red-900/50' : 'bg-red-100'
              }`}>
                <CreditCard className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Despesas</p>
                <p className={`text-lg sm:text-2xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <ValorResponsivo valor={dashboardData.resumo.totalDespesas} />
                </p>
                {modoAvancado && (
                  <div className="flex items-center mt-1">
                    {dashboardData.resumo.variacaoDespesas >= 0 ? 
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" /> : 
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-1" />
                    }
                    <span className={`text-xs sm:text-sm ${dashboardData.resumo.variacaoDespesas >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatPercent(dashboardData.resumo.variacaoDespesas)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                dashboardData.resumo.saldo >= 0 
                  ? darkMode ? 'bg-cyan-900/50' : 'bg-cyan-100'
                  : darkMode ? 'bg-orange-900/50' : 'bg-orange-100'
              }`}>
                <Wallet className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  dashboardData.resumo.saldo >= 0 
                    ? darkMode ? 'text-cyan-400' : 'text-cyan-600'
                    : darkMode ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Saldo</p>
                <p className={`text-lg sm:text-2xl font-semibold transition-colors duration-300 ${
                  dashboardData.resumo.saldo >= 0 
                    ? darkMode ? 'text-emerald-400' : 'text-emerald-600' 
                    : 'text-red-600'
                }`}>
                  <ValorResponsivo valor={dashboardData.resumo.saldo} />
                </p>
                {modoAvancado && (
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Taxa: {dashboardData.resumo.taxaEconomia.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
              }`}>
                <BarChart3 className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Transações</p>
                <p className={`text-lg sm:text-2xl font-semibold transition-colors duration-300 truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {dashboardData.resumo.transacoesCount}
                </p>
                {modoAvancado ? (
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Média: <ValorResponsivo valor={dashboardData.resumo.mediaGastoDiario} showCompactAlways={true} />/dia
                  </p>
                ) : (
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 truncate ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {dashboardData.resumo.receitasCount} receitas, {dashboardData.resumo.despesasCount} despesas
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                darkMode ? 'bg-orange-900/50' : 'bg-orange-100'
              }`}>
                <CreditCard className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Dívidas</p>
                <p className={`text-lg sm:text-2xl font-semibold transition-colors duration-300 truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {dashboardData.resumo.dividasAtivas || 0}
                </p>
                {modoAvancado ? (
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {dashboardData.resumo.valorTotalRestanteDividas ? (
                      <ValorResponsivo valor={dashboardData.resumo.valorTotalRestanteDividas} showCompactAlways={true} />
                    ) : 'R$ 0,00'} restante
                  </p>
                ) : (
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 truncate ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {dashboardData.resumo.parcelasVencidas || 0} vencidas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview do Próximo Mês */}
        <PreviewProximoMes 
          darkMode={darkMode} 
          mesAtual={mesAtual} 
          anoAtual={anoAtual}
        />

        {/* Insights Profissionais */}
        {mostrarInsights && dashboardData.insights.length > 0 && (
          <div className="mb-8">
            <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800/60 via-gray-800/40 to-gray-900/60 border-gray-700/40' 
                : 'bg-gradient-to-br from-white/80 via-white/60 to-white/80 border-white/50'
            }`}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-2xl mr-4 shadow-lg ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}>
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-3xl font-bold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>� Seu Consultor Financeiro Pessoal</h2>
                      <p className={`mt-1 text-lg transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Insights personalizados baseados no seu perfil único</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Crítico</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg"></div>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Alto</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Médio</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {dashboardData.insights.map((insight, index) => (
                    <InsightInteligente 
                      key={`insight-${index}-${insight.titulo}`}
                      insight={insight}
                    />
                  ))}
                  
                  {dashboardData.insights.length === 0 && (
                    <div className={`text-center py-12 rounded-xl border-2 border-dashed transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 text-gray-400' 
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">
                        🧠 Analisando seus dados...
                      </h3>
                      <p className="text-sm">
                        Continue registrando suas transações para receber insights personalizados!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Próximas Parcelas de Dívidas - Responsivo */}
        {dashboardData.dividas && dashboardData.dividas.proximasParcelas.length > 0 && (
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border mb-4 sm:mb-6 lg:mb-8 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2 sm:gap-3 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <CreditCard className="text-orange-500" size={20} />
                  <span className="hidden sm:inline">📅 Próximas Parcelas</span>
                  <span className="sm:hidden">📅 Parcelas</span>
                </h2>
                <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-orange-900/20 border-orange-500/30 text-orange-300' 
                    : 'bg-orange-50 border-orange-200 text-orange-700'
                }`}>
                  <span className="font-semibold text-xs sm:text-sm">
                    {dashboardData.dividas.totalProximas} parcela(s) próximas
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {dashboardData.dividas.proximasParcelas.map((parcela, index) => (
                  <div 
                    key={parcela.id} 
                    className={`p-3 sm:p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${
                      darkMode 
                        ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50' 
                        : 'bg-white/60 border-white/60 hover:bg-white/80'
                    }`}
                    style={{ borderLeftColor: parcela.cor }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: parcela.cor }}
                          ></div>
                          <h3 className={`font-bold text-base sm:text-lg truncate ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {parcela.dividaNome}
                          </h3>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-lg ${
                            darkMode 
                              ? 'bg-blue-900/30 text-blue-300' 
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            📦 Parcela {parcela.numero}
                          </span>
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-lg ${
                            darkMode 
                              ? 'bg-purple-900/30 text-purple-300' 
                              : 'bg-purple-50 text-purple-700'
                          }`}>
                            🏷️ {parcela.categoria}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <span className={`text-xs sm:text-sm font-medium ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {parcela.diasParaVencimento <= 7 && (
                            <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                              parcela.diasParaVencimento < 0 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : parcela.diasParaVencimento === 0
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : parcela.diasParaVencimento <= 3
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {parcela.diasParaVencimento < 0 
                                ? '⚠️ Vencida' 
                                : parcela.diasParaVencimento === 0
                                ? '🎯 Vence hoje'
                                : parcela.diasParaVencimento === 1
                                ? '🔥 Vence amanhã'
                                : `⏰ ${parcela.diasParaVencimento} dias`
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right w-full sm:w-auto sm:ml-4">
                        <p className={`text-xl sm:text-2xl font-bold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {formatCurrency(parcela.valor)}
                        </p>
                        <button 
                          onClick={() => window.location.href = `/dividas/${parcela.dividaId}`}
                          className={`w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                            darkMode 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          } shadow-lg`}
                        >
                          👁️ Ver detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {dashboardData.dividas.totalProximas > 10 && (
                <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border text-center ${
                  darkMode 
                    ? 'bg-gray-700/30 border-gray-600/30' 
                    : 'bg-gray-50/60 border-gray-200/60'
                }`}>
                  <a 
                    href="/dividas" 
                    className={`inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base ${
                      darkMode 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    } shadow-lg`}
                  >
                    <CreditCard size={16} />
                    Ver todas as {dashboardData.dividas.totalProximas} parcelas
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gráficos - Layout responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
          {/* Gráfico de Pizza - Despesas */}
          {dadosGraficoPizza.length > 0 && (
            <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-3 sm:p-4 lg:p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-800/80 border-slate-600/30' 
                : 'bg-white/80 border-white/20'
            }`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Despesas por Categoria</h2>
              <div className="h-60 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGraficoPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 1024 ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {dadosGraficoPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: darkMode ? '#f1f5f9' : '#111827',
                        fontSize: window.innerWidth < 640 ? '12px' : '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gráfico de Pizza - Receitas (Modo Avançado) */}
          {modoAvancado && dadosReceitasPizza.length > 0 ? (
            <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-3 sm:p-4 lg:p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-800/80 border-slate-600/30' 
                : 'bg-white/80 border-white/20'
            }`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Receitas por Categoria</h2>
              <div className="h-60 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosReceitasPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 640 ? 70 : window.innerWidth < 1024 ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {dadosReceitasPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                        border: darkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: darkMode ? '#f1f5f9' : '#111827',
                        fontSize: window.innerWidth < 640 ? '12px' : '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Gráfico de Barras - Comparação */
            <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-3 sm:p-4 lg:p-6 transition-all duration-300 ${
              darkMode 
                ? 'bg-slate-800/80 border-slate-600/30' 
                : 'bg-white/80 border-white/20'
            }`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Comparação Mensal</h2>
              <div className="h-60 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparacao}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={darkMode ? '#475569' : '#e5e7eb'}
                    />
                    <XAxis 
                      dataKey="periodo" 
                      tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                    <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Evolução Mensal (Modo Avançado) - Responsivo */}
        {modoAvancado && (
          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Evolução dos Últimos 6 Meses</h2>
            <div className="h-60 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.graficos.evolucaoMensal}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={darkMode ? '#475569' : '#e5e7eb'}
                  />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  />
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

        {/* Lista de Categorias - Responsivo */}
        {dashboardData.graficos.gastosPorCategoria.length > 0 && (
          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Gastos por Categoria</h2>
            <div className="space-y-2 sm:space-y-3">
              {dashboardData.graficos.gastosPorCategoria.slice(0, modoAvancado ? 10 : 6).map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 flex-shrink-0" 
                      style={{ backgroundColor: item.cor }}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <span className={`font-medium transition-colors duration-300 text-sm sm:text-base truncate block ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.categoria}</span>
                      {modoAvancado && (
                        <p className={`text-xs sm:text-xs transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{item.transacoes} transações</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <span className={`font-semibold transition-colors duration-300 text-sm sm:text-base ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(item.valor)}
                    </span>
                    {modoAvancado && (
                      <p className={`text-xs transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
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
          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-6 mb-8 transition-all duration-300 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Metas Financeiras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.metas.ativas.slice(0, modoAvancado ? 9 : 6).map((meta) => (
                <div key={meta.id} className={`border rounded-lg p-4 transition-all duration-300 ${
                  darkMode ? 'border-slate-600 bg-slate-700/30' : 'border-gray-200 bg-white/50'
                }`}>
                  <div className="flex items-center mb-3">
                    <PiggyBank className={`h-5 w-5 mr-2 ${
                      darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                    <h3 className={`font-medium transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>{meta.nome}</h3>
                  </div>
                  
                  <div className="mb-3">
                    <div className={`flex justify-between text-sm mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span>{formatCurrency(meta.currentAmount)}</span>
                      <span>{formatCurrency(meta.valorAlvo)}</span>
                    </div>
                    
                    <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                      darkMode ? 'bg-slate-600' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {meta.progresso.toFixed(1)}%
                      </span>
                      {modoAvancado && (
                        <span className={`text-xs transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
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
          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-6 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <BarChart3 className={`h-8 w-8 mx-auto mb-2 ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
            <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Categorias</h3>
            <p className={`text-2xl font-bold mb-1 ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>{dashboardData.resumo.categoriasCount}</p>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>organizadas</p>
          </div>

          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <Target className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 ${
              darkMode ? 'text-teal-400' : 'text-teal-600'
            }`} />
            <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Metas</h3>
            <p className={`text-xl sm:text-2xl font-bold mb-1 ${
              darkMode ? 'text-teal-400' : 'text-teal-600'
            }`}>{dashboardData.metas.resumo.total}</p>
            <p className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{dashboardData.metas.resumo.ativas} em andamento</p>
          </div>

          <div className={`backdrop-blur-sm rounded-xl shadow-lg border p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            darkMode 
              ? 'bg-slate-800/80 border-slate-600/30' 
              : 'bg-white/80 border-white/20'
          }`}>
            <PiggyBank className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 ${
              darkMode ? 'text-cyan-400' : 'text-cyan-600'
            }`} />
            <h3 className={`font-semibold mb-1 text-sm sm:text-base transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Economizado</h3>
            <p className={`text-xl sm:text-2xl font-bold mb-1 ${
              darkMode ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              {formatCurrency(dashboardData.resumo.totalEconomizado)}
            </p>
            <p className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>em metas concluídas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
