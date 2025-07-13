'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';

interface DashboardData {
  periodo: {
    mes: number;
    ano: number;
  };
  resumo: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    transacoesCount: number;
    receitasCount: number;
    despesasCount: number;
    categoriasCount: number;
    totalEconomizado: number;
    metasAtivas: number;
    metasConcluidas: number;
  };
  graficos: {
    receitasPorCategoria: Array<{
      nome: string;
      valor: number;
      cor: string;
    }>;
    gastosPorCategoria: Array<{
      nome: string;
      valor: number;
      cor: string;
    }>;
    evolucaoMensal: Array<{
      mes: string;
      receitas: number;
      despesas: number;
      saldo: number;
    }>;
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
    resumo: {
      total: number;
      ativas: number;
      concluidas: number;
      vencidas: number;
      totalEconomizado: number;
      totalMetas: number;
    };
  };
}

interface AjusteForm {
  tipo: 'receita' | 'despesa';
  valor: string;
  descricao: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [ajusteForm, setAjusteForm] = useState<AjusteForm>({
    tipo: 'receita',
    valor: '',
    descricao: ''
  });

  // Estado para navegação de mês/ano
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [session, status, router, mesAtual, anoAtual]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard?mes=${mesAtual}&ano=${anoAtual}`);
      const data = await response.json();
      
      if (response.ok) {
        setDashboardData(data);
      } else {
        setMensagem(data.error || 'Erro ao carregar dados do dashboard');
      }
    } catch (error) {
      setMensagem('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAjuste = async () => {
    if (!ajusteForm.valor || !ajusteForm.descricao) {
      setMensagem('Preencha todos os campos do ajuste');
      return;
    }

    try {
      const response = await fetch('/api/dashboard/ajuste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ajusteForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Ajuste realizado com sucesso!');
        setShowAjusteModal(false);
        setAjusteForm({ tipo: 'receita', valor: '', descricao: '' });
        fetchDashboardData(); // Recarregar dados
      } else {
        setMensagem(data.error || 'Erro ao realizar ajuste');
      }
    } catch (error) {
      setMensagem('Erro ao realizar ajuste');
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

  const voltarMesAtual = () => {
    const hoje = new Date();
    setMesAtual(hoje.getMonth() + 1);
    setAnoAtual(hoje.getFullYear());
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarMesAno = (mes: number, ano: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[mes - 1]} ${ano}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatarValor(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-6">{mensagem}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const isCurrentMonth = mesAtual === new Date().getMonth() + 1 && anoAtual === new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho com Navegação de Mês */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <p className="text-gray-600 mt-2">Visão geral das suas finanças</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Navegação de Mês */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-md">
              <button
                onClick={() => navegarMes('anterior')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Mês anterior"
              >
                ←
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className="font-semibold text-gray-900">
                  {formatarMesAno(mesAtual, anoAtual)}
                </div>
                {!isCurrentMonth && (
                  <button
                    onClick={voltarMesAtual}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Voltar ao atual
                  </button>
                )}
              </div>
              
              <button
                onClick={() => navegarMes('proximo')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Próximo mês"
              >
                →
              </button>
            </div>

            {/* Botão de Ajuste */}
            <button
              onClick={() => setShowAjusteModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <span>⚙️</span>
              Fazer Ajuste
            </button>
          </div>
        </div>

        {mensagem && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            {mensagem}
            <button 
              onClick={() => setMensagem('')}
              className="float-right text-blue-700 hover:text-blue-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">💰 Receitas</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatarValor(dashboardData.resumo.totalReceitas)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {dashboardData.resumo.receitasCount || 0} transações de receita
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">💸 Despesas</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {formatarValor(dashboardData.resumo.totalDespesas)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {dashboardData.resumo.despesasCount || 0} transações de despesa
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📊 Saldo</h3>
            </div>
            <p className={`text-3xl font-bold ${dashboardData.resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatarValor(dashboardData.resumo.saldo)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {dashboardData.resumo.categoriasCount || 0} categorias ativas
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">💰 Total Economizado</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatarValor(dashboardData.resumo.totalEconomizado || 0)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Em {dashboardData.resumo.metasAtivas || 0} metas ativas
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Receitas por Categoria */}
          {dashboardData.graficos.receitasPorCategoria.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Receitas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.graficos.receitasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }: any) => `${nome} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dashboardData.graficos.receitasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarValor(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Despesas por Categoria */}
          {dashboardData.graficos.gastosPorCategoria.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📉 Despesas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.graficos.gastosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }: any) => `${nome} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dashboardData.graficos.gastosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatarValor(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Evolução Mensal */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Evolução dos Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.graficos.evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatarValor(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Receitas"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Despesas"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metas Ativas */}
        {dashboardData.metas && dashboardData.metas.ativas.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🎯 Metas Ativas</h3>
              <button
                onClick={() => router.push('/metas')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas →
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.metas.ativas.slice(0, 3).map((meta: any) => (
                <div key={meta.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{meta.nome}</h4>
                    <span className="text-sm text-gray-600">
                      {meta.progresso.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatarValor(meta.currentAmount)}</span>
                    <span>{formatarValor(meta.valorAlvo)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/transacoes')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl font-medium transition-colors duration-200 text-center"
          >
            <div className="text-3xl mb-2">💳</div>
            <div>Nova Transação</div>
          </button>
          
          <button
            onClick={() => router.push('/metas')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl font-medium transition-colors duration-200 text-center"
          >
            <div className="text-3xl mb-2">🎯</div>
            <div>Gerenciar Metas</div>
          </button>
          
          <button
            onClick={() => router.push('/categorias')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl font-medium transition-colors duration-200 text-center"
          >
            <div className="text-3xl mb-2">🏷️</div>
            <div>Organizar Categorias</div>
          </button>
        </div>
      </div>

      {/* Modal de Ajuste */}
      {showAjusteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Fazer Ajuste Manual</h3>
              <button
                onClick={() => setShowAjusteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ajuste
                </label>
                <select
                  value={ajusteForm.tipo}
                  onChange={(e) => setAjusteForm({...ajusteForm, tipo: e.target.value as 'receita' | 'despesa'})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="receita">Adicionar Receita</option>
                  <option value="despesa">Adicionar Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ajusteForm.valor}
                  onChange={(e) => setAjusteForm({...ajusteForm, valor: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Ajuste
                </label>
                <input
                  type="text"
                  value={ajusteForm.descricao}
                  onChange={(e) => setAjusteForm({...ajusteForm, descricao: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Correção de saldo inicial"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAjusteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAjuste}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}