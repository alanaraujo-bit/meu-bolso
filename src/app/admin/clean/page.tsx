"use client";

import { useState, useEffect } from 'react';
import AdminCleanLayout from '@/components/admin/AdminCleanLayout';
import { 
  Users, Trash2, Search, Filter, BarChart3, 
  DollarSign, Target, AlertTriangle, Download,
  Eye, RefreshCw, Database
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
    valorTotalMovimentado: number;
  };
}

interface UsuariosData {
  usuarios: Usuario[];
  total: number;
  totalAtivos: number;
  totalInativos: number;
}

interface DashboardStats {
  usuarios: {
    total: number;
    ativos: number;
    inativos: number;
  };
  financeiro: {
    volumeTotal: number;
    transacoesTotal: number;
  };
}

export default function AdminCleanPage() {
  const [usuarios, setUsuarios] = useState<UsuariosData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<Usuario | null>(null);
  const [deletandoUsuario, setDeletandoUsuario] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await fetch('/api/admin/dashboard-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Carregar usuários
      const usuariosResponse = await fetch('/api/admin/usuarios');
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json();
        setUsuarios(usuariosData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarios = async () => {
    try {
      const params = new URLSearchParams({ search });
      const response = await fetch(`/api/admin/usuarios?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const confirmarDelecao = (usuario: Usuario) => {
    setUsuarioParaDeletar(usuario);
  };

  const deletarUsuario = async () => {
    if (!usuarioParaDeletar) return;

    try {
      setDeletandoUsuario(true);
      const response = await fetch(`/api/admin/usuarios/${usuarioParaDeletar.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await carregarDados(); // Recarregar dados
        setUsuarioParaDeletar(null);
      } else {
        alert('Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário');
    } finally {
      setDeletandoUsuario(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pouco_ativo': return 'bg-yellow-100 text-yellow-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminCleanLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminCleanLayout>
    );
  }

  return (
    <AdminCleanLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Database className="w-7 h-7 mr-3 text-blue-500" />
                Painel Administrativo Simplificado
              </h1>
              <p className="text-gray-600">Gerenciar usuários e monitorar estatísticas essenciais</p>
            </div>
            
            <button
              onClick={carregarDados}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Essenciais */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.usuarios.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.usuarios.ativos}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Volume Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.financeiro.volumeTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.financeiro.transacoesTotal}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {/* Gerenciamento de Usuários */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-500" />
                Gerenciar Usuários
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuário..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && buscarUsuarios()}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={buscarUsuarios}
                  className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {usuarios && usuarios.usuarios.length > 0 ? (
              <div className="space-y-4">
                {usuarios.usuarios.map((usuario) => (
                  <div key={usuario.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{usuario.nome}</h3>
                            <p className="text-sm text-gray-500">{usuario.email}</p>
                            <p className="text-xs text-gray-400">
                              Cadastrado em: {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(usuario.statusAtividade)}`}>
                            {usuario.statusAtividade.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">{usuario.estatisticas.totalTransacoes}</span> transações
                          </div>
                          <div>
                            <span className="font-medium">{usuario.estatisticas.totalMetas}</span> metas
                          </div>
                          <div>
                            <span className="font-medium">R$ {usuario.estatisticas.valorTotalMovimentado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> total
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/dashboard?user=${usuario.id}`, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Visualizar dashboard do usuário"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => confirmarDelecao(usuario)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Deletar usuário e todos os dados"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmação de Deleção */}
        {usuarioParaDeletar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja deletar o usuário <strong>{usuarioParaDeletar.nome}</strong>?
                <br /><br />
                <span className="text-red-600 font-medium">
                  ⚠️ Esta ação irá deletar TODOS os dados do usuário incluindo:
                </span>
                <br />
                • Todas as transações ({usuarioParaDeletar.estatisticas.totalTransacoes})
                <br />
                • Todas as metas ({usuarioParaDeletar.estatisticas.totalMetas})
                <br />
                • Todas as categorias e configurações
                <br />
                • Dados de perfil e histórico
                <br /><br />
                <span className="text-red-600 font-bold">Esta ação é IRREVERSÍVEL!</span>
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setUsuarioParaDeletar(null)}
                  disabled={deletandoUsuario}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={deletarUsuario}
                  disabled={deletandoUsuario}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {deletandoUsuario ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar Usuário
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminCleanLayout>
  );
}
