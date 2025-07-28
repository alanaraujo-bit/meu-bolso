"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { 
  Tag, Search, TrendingUp, Users, DollarSign,
  RefreshCw, BarChart3, PieChart, Plus
} from 'lucide-react';

interface Categoria {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  tipo: 'receita' | 'despesa';
  userId: string;
  usuarioNome: string;
  usuarioEmail: string;
  totalTransacoes: number;
  valorTotal: number;
  mediaTransacao: number;
  ultimaTransacao: string | null;
}

interface CategoriaEstatistica {
  nome: string;
  cor: string;
  totalTransacoes: number;
  valorTotal: number;
  percentual: number;
}

export default function CategoriasGlobais() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estatisticas, setEstatisticas] = useState<CategoriaEstatistica[]>([]);
  const { loading, setLoading } = useCleanLoading();
  const [filtros, setFiltros] = useState({
    search: '',
    tipo: 'todos',
    ordenacao: 'valor_desc'
  });
  const [stats, setStats] = useState({
    totalCategorias: 0,
    categoriasMaisUsadas: 0,
    valorTotalMovimentado: 0,
    categoriasReceita: 0,
    categoriasDespesa: 0
  });

  useEffect(() => {
    buscarCategorias();
  }, [filtros]);

  const buscarCategorias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filtros);

      const response = await fetch(`/api/admin/categorias-globais?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data.categorias);
        setEstatisticas(data.estatisticas);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'receita' ? '📈' : '📉';
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'receita' 
      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          📈 Receita
        </span>
      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          📉 Despesa
        </span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Tag className="w-7 h-7 mr-3 text-purple-500" />
                🏷️ Categorias Globais
              </h1>
              <p className="text-gray-600 mt-1">Análise completa de todas as categorias do sistema</p>
            </div>

            <button
              onClick={buscarCategorias}
              disabled={loading}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Categorias</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalCategorias}</p>
              </div>
              <Tag className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{stats.categoriasReceita}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{stats.categoriasDespesa}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500 transform rotate-180" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mais Usadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.categoriasMaisUsadas}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Total</p>
                <p className="text-xl font-bold text-emerald-600">
                  R$ {stats.valorTotalMovimentado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Top Categorias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-500" />
            📊 Top 10 Categorias por Volume
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {estatisticas.slice(0, 10).map((categoria, index) => (
              <div key={categoria.nome} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{categoria.nome}</p>
                    <p className="text-sm text-gray-500">
                      {categoria.totalTransacoes} transações • {categoria.percentual.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    R$ {categoria.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categoria ou usuário..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>

            <select
              value={filtros.ordenacao}
              onChange={(e) => setFiltros({ ...filtros, ordenacao: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="valor_desc">Maior valor total</option>
              <option value="valor_asc">Menor valor total</option>
              <option value="transacoes_desc">Mais transações</option>
              <option value="transacoes_asc">Menos transações</option>
              <option value="nome_asc">Nome A-Z</option>
              <option value="nome_desc">Nome Z-A</option>
            </select>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Nenhuma categoria encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Média por Transação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Última Transação
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <span className="mr-2">{categoria.icone}</span>
                              {categoria.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {categoria.usuarioNome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {categoria.usuarioEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTipoBadge(categoria.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">
                          {categoria.totalTransacoes}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          categoria.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {categoria.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {categoria.mediaTransacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categoria.ultimaTransacao 
                          ? new Date(categoria.ultimaTransacao).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
