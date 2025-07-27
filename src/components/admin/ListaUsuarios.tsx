"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Calendar, DollarSign, 
  Target, BarChart3, Clock, Eye, ChevronLeft, 
  ChevronRight, RefreshCw, Download
} from 'lucide-react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
  atualizadoEm: string;
  diasInativo: number;
  statusAtividade: 'ativo' | 'pouco_ativo' | 'inativo';
  estatisticas: {
    totalTransacoes: number;
    totalMetas: number;
    totalCategorias: number;
    totalRecorrentes: number;
    valorTotalMovimentado: number;
  };
  ultimaTransacao: {
    valor: number;
    data: string;
  } | null;
}

interface UsuariosData {
  usuarios: Usuario[];
  paginacao: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  estatisticas: {
    totalGeral: number;
    totalAtivos: number;
    totalInativos: number;
    totalPoucoAtivos: number;
  };
  filtros: {
    search: string;
    status: string;
  };
}

export default function ListaUsuarios() {
  const [dados, setDados] = useState<UsuariosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todos');
  const [page, setPage] = useState(1);
  const [usuarioDetalhes, setUsuarioDetalhes] = useState<string | null>(null);

  const buscarUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        status,
        limit: '20'
      });

      const response = await fetch(`/api/admin/usuarios?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDados(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, [page, status]);

  const handleSearch = () => {
    setPage(1);
    buscarUsuarios();
  };

  const getStatusColor = (statusAtividade: string) => {
    switch (statusAtividade) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'pouco_ativo':
        return 'bg-yellow-100 text-yellow-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusTexto = (statusAtividade: string, diasInativo: number) => {
    switch (statusAtividade) {
      case 'ativo':
        return `Ativo (${diasInativo}d)`;
      case 'pouco_ativo':
        return `Pouco ativo (${diasInativo}d)`;
      case 'inativo':
        return `Inativo (${diasInativo}d)`;
      default:
        return 'Desconhecido';
    }
  };

  const exportarUsuarios = async () => {
    try {
      const params = new URLSearchParams({
        search,
        status,
        format: 'csv'
      });

      const response = await fetch(`/api/admin/usuarios/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  if (loading && !dados) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg">Carregando usuários...</span>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600">Erro ao carregar dados dos usuários</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-7 h-7 mr-3 text-blue-500" />
              👥 Todos os Usuários
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerenciar e monitorar atividades dos usuários
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={buscarUsuarios}
              disabled={loading}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={exportarUsuarios}
              className="px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-blue-600">{dados.estatisticas.totalGeral}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">{dados.estatisticas.totalAtivos}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pouco Ativos</p>
              <p className="text-2xl font-bold text-yellow-600">{dados.estatisticas.totalPoucoAtivos}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
              <p className="text-2xl font-bold text-red-600">{dados.estatisticas.totalInativos}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os usuários</option>
            <option value="ativos">Ativos (últimos 7 dias)</option>
            <option value="inativos">Inativos (+30 dias)</option>
          </select>

          {/* Botão Buscar */}
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {dados.usuarios.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatísticas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dados.usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {usuario.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            Desde: {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(usuario.statusAtividade)}`}>
                          {getStatusTexto(usuario.statusAtividade, usuario.diasInativo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(usuario.atualizadoEm).toLocaleDateString('pt-BR')}
                          </div>
                          {usuario.ultimaTransacao && (
                            <div className="text-xs text-gray-400 mt-1">
                              Última transação: {new Date(usuario.ultimaTransacao.data).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {usuario.estatisticas.totalTransacoes} trans.
                          </div>
                          <div className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {usuario.estatisticas.totalMetas} metas
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {usuario.estatisticas.valorTotalMovimentado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setUsuarioDetalhes(usuario.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              {dados.usuarios.map((usuario) => (
                <div key={usuario.id} className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{usuario.nome}</h3>
                      <p className="text-xs text-gray-500">{usuario.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.statusAtividade)}`}>
                      {getStatusTexto(usuario.statusAtividade, usuario.diasInativo)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                    <div>{usuario.estatisticas.totalTransacoes} transações</div>
                    <div>{usuario.estatisticas.totalMetas} metas</div>
                    <div className="col-span-2 font-medium text-gray-900">
                      R$ {usuario.estatisticas.valorTotalMovimentado.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setUsuarioDetalhes(usuario.id)}
                    className="text-blue-600 hover:text-blue-900 text-xs flex items-center"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginação */}
      {dados.paginacao.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((dados.paginacao.page - 1) * dados.paginacao.limit) + 1} a{' '}
              {Math.min(dados.paginacao.page * dados.paginacao.limit, dados.paginacao.total)} de{' '}
              {dados.paginacao.total} usuários
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!dados.paginacao.hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              
              <span className="px-4 py-2 bg-gray-100 rounded-lg">
                Página {dados.paginacao.page} de {dados.paginacao.totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={!dados.paginacao.hasNext}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
