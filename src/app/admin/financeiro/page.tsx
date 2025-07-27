"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3,
  Calculator, Wallet, CreditCard, Calendar, RefreshCw,
  FileText, Download, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';

interface ResumoFinanceiro {
  receitaTotal: number;
  despesaTotal: number;
  lucroLiquido: number;
  crescimentoMensal: number;
  numeroUsuarios: number;
  transacoesMes: number;
  ticketMedio: number;
  categoriaTopReceita: string;
  categoriaTopDespesa: string;
}

interface FluxoCaixa {
  data: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

interface AnaliseCategoria {
  nome: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  percentual: number;
  cor: string;
  transacoes: number;
}

interface MetricaComparativa {
  periodo: string;
  receitas: number;
  despesas: number;
  usuarios: number;
  transacoes: number;
}

export default function FinanceiroAdmin() {
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    receitaTotal: 0,
    despesaTotal: 0,
    lucroLiquido: 0,
    crescimentoMensal: 0,
    numeroUsuarios: 0,
    transacoesMes: 0,
    ticketMedio: 0,
    categoriaTopReceita: '',
    categoriaTopDespesa: ''
  });

  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixa[]>([]);
  const [categorias, setCategorias] = useState<AnaliseCategoria[]>([]);
  const [comparativo, setComparativo] = useState<MetricaComparativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30d');

  useEffect(() => {
    buscarDadosFinanceiros();
  }, [periodoSelecionado]);

  const buscarDadosFinanceiros = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ periodo: periodoSelecionado });

      const [resumoRes, fluxoRes, categoriasRes, comparativoRes] = await Promise.all([
        fetch(`/api/admin/financeiro/resumo?${params}`),
        fetch(`/api/admin/financeiro/fluxo-caixa?${params}`),
        fetch(`/api/admin/financeiro/categorias?${params}`),
        fetch(`/api/admin/financeiro/comparativo?${params}`)
      ]);

      if (resumoRes.ok) {
        const resumoData = await resumoRes.json();
        setResumo(resumoData);
      }

      if (fluxoRes.ok) {
        const fluxoData = await fluxoRes.json();
        setFluxoCaixa(fluxoData.fluxo);
      }

      if (categoriasRes.ok) {
        const categoriasData = await categoriasRes.json();
        setCategorias(categoriasData.categorias);
      }

      if (comparativoRes.ok) {
        const comparativoData = await comparativoRes.json();
        setComparativo(comparativoData.comparativo);
      }
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorioFinanceiro = async () => {
    try {
      const response = await fetch(`/api/admin/financeiro/export?periodo=${periodoSelecionado}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-financeiro-${periodoSelecionado}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getCrescimentoIcon = (crescimento: number) => {
    if (crescimento > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (crescimento < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Calculator className="w-4 h-4 text-gray-500" />;
  };

  const getCrescimentoColor = (crescimento: number) => {
    if (crescimento > 0) return 'text-green-600';
    if (crescimento < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-7 h-7 mr-3 text-green-500" />
                💰 Painel Financeiro
              </h1>
              <p className="text-gray-600 mt-1">Análise financeira completa do sistema</p>
            </div>

            <div className="flex space-x-3">
              <select
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>

              <button
                onClick={exportarRelatorioFinanceiro}
                className="px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>

              <button
                onClick={buscarDadosFinanceiros}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro Principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.receitaTotal)}
                </p>
                <div className="flex items-center mt-1">
                  {getCrescimentoIcon(resumo.crescimentoMensal)}
                  <span className={`text-sm ml-1 ${getCrescimentoColor(resumo.crescimentoMensal)}`}>
                    {resumo.crescimentoMensal > 0 ? '+' : ''}{resumo.crescimentoMensal.toFixed(1)}%
                  </span>
                </div>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesa Total</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(resumo.despesaTotal)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {resumo.transacoesMes} transações
                  </span>
                </div>
              </div>
              <ArrowDownCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${resumo.lucroLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo.lucroLiquido)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {resumo.numeroUsuarios} usuários ativos
                  </span>
                </div>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(resumo.ticketMedio)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-500">
                    Por transação
                  </span>
                </div>
              </div>
              <Wallet className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Fluxo de Caixa */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            📈 Fluxo de Caixa ({periodoSelecionado === '7d' ? 'Últimos 7 dias' : 
                               periodoSelecionado === '30d' ? 'Últimos 30 dias' : 
                               periodoSelecionado === '90d' ? 'Últimos 90 dias' : 'Último ano'})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Data</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Receitas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Despesas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fluxoCaixa.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        {formatCurrency(item.receitas)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">
                        {formatCurrency(item.despesas)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold ${item.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(item.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Análise por Categorias e Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categorias */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-500" />
              🏷️ Top Categorias por Volume
            </h3>

            <div className="space-y-4">
              {categorias.slice(0, 8).map((categoria, index) => (
                <div key={categoria.nome} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold">
                      {index + 1}
                    </span>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{categoria.nome}</p>
                      <p className="text-xs text-gray-500">
                        {categoria.transacoes} transações • {categoria.percentual.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${categoria.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(categoria.valor)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      categoria.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.tipo === 'receita' ? '📈' : '📉'} {categoria.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparativo Temporal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              📊 Comparativo Temporal
            </h3>

            <div className="space-y-4">
              {comparativo.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{item.periodo}</h4>
                    <span className="text-sm text-gray-500">{item.usuarios} usuários</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Receitas</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(item.receitas)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Despesas</p>
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(item.despesas)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Transações</p>
                    <p className="text-sm font-bold text-blue-600">{item.transacoes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights e Recomendações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-yellow-500" />
            💡 Insights Financeiros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📊 Categoria Mais Rentável</h4>
              <p className="text-sm text-blue-700">
                <strong>{resumo.categoriaTopReceita}</strong> é a categoria que mais gera receita no período.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">💸 Maior Gasto</h4>
              <p className="text-sm text-red-700">
                <strong>{resumo.categoriaTopDespesa}</strong> representa o maior volume de despesas.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">📈 Performance</h4>
              <p className="text-sm text-green-700">
                Crescimento de <strong>{resumo.crescimentoMensal.toFixed(1)}%</strong> em relação ao período anterior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
