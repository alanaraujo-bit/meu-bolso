"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { 
  Target, Search, TrendingUp, Calendar, DollarSign,
  CheckCircle, Clock, AlertCircle, RefreshCw, Award
} from 'lucide-react';

interface Meta {
  id: string;
  userId: string;
  usuarioNome: string;
  usuarioEmail: string;
  nome: string;
  valorAlvo: number;
  currentAmount: number;
  dataAlvo: string;
  isCompleted: boolean;
  progresso: number;
  diasRestantes: number;
  status: 'em_andamento' | 'concluida' | 'atrasada' | 'proxima_vencimento';
}

export default function MetasGlobais() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const { loading, setLoading } = useCleanLoading();
  const [filtros, setFiltros] = useState({
    search: '',
    status: 'todos',
    periodo: 'todos'
  });
  const [stats, setStats] = useState({
    total: 0,
    concluidas: 0,
    emAndamento: 0,
    atrasadas: 0,
    valorTotalMetas: 0,
    valorAlcancado: 0
  });

  useEffect(() => {
    buscarMetas();
  }, [filtros]);

  const buscarMetas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filtros);

      const response = await fetch(`/api/admin/metas-globais?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMetas(data.metas);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (meta: Meta) => {
    switch (meta.status) {
      case 'concluida':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluída
          </span>
        );
      case 'atrasada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Atrasada
          </span>
        );
      case 'proxima_vencimento':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Próxima ao vencimento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Target className="w-3 h-3 mr-1" />
            Em andamento
          </span>
        );
    }
  };

  const getProgressColor = (progresso: number) => {
    if (progresso >= 100) return 'bg-green-500';
    if (progresso >= 75) return 'bg-blue-500';
    if (progresso >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Target className="w-7 h-7 mr-3 text-green-500" />
                🎯 Metas Globais
              </h1>
              <p className="text-gray-600 mt-1">Acompanhe todas as metas dos usuários</p>
            </div>

            <button
              onClick={buscarMetas}
              disabled={loading}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Metas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emAndamento}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-purple-600">
                  R$ {stats.valorTotalMetas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Alcançado</p>
                <p className="text-xl font-bold text-emerald-600">
                  R$ {stats.valorAlcancado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Award className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuário ou meta..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os status</option>
              <option value="concluida">Concluídas</option>
              <option value="em_andamento">Em andamento</option>
              <option value="atrasada">Atrasadas</option>
              <option value="proxima_vencimento">Próximas ao vencimento</option>
            </select>

            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os períodos</option>
              <option value="30d">Próximos 30 dias</option>
              <option value="90d">Próximos 90 dias</option>
              <option value="vencidas">Vencidas</option>
            </select>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : metas.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Nenhuma meta encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Meta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Progresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor Alvo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data Alvo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metas.map((meta) => (
                    <tr key={meta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {meta.usuarioNome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {meta.usuarioEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {meta.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(meta.progresso)}`}
                              style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {meta.progresso.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          R$ {meta.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {meta.valorAlvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          R$ {meta.valorAlvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(meta.dataAlvo).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {meta.diasRestantes > 0 
                            ? `${meta.diasRestantes} dias restantes`
                            : meta.diasRestantes === 0 
                              ? 'Vence hoje' 
                              : `${Math.abs(meta.diasRestantes)} dias em atraso`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(meta)}
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
