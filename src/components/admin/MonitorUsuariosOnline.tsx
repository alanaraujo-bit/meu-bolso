"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Wifi, WifiOff, Clock, Eye, RefreshCw, 
  Search, Filter, Download, TrendingUp, TrendingDown,
  Smartphone, Monitor, Circle
} from 'lucide-react';

interface UsuarioOnline {
  id: string;
  nome: string;
  email: string;
  minutosInativo: number;
  diasInativo: number;
  statusOnline: 'online' | 'recente' | 'ausente' | 'offline';
  statusAtividade: 'ativo' | 'pouco_ativo' | 'inativo';
  ultimaAtividadeTexto: string;
  atualizadoEm: string;
  estatisticas: {
    totalTransacoes: number;
    totalMetas: number;
    totalCategorias: number;
    totalRecorrentes: number;
    valorTotalMovimentado: number;
  };
}

interface MetricasOnline {
  usuariosOnlineAgora: number;
  usuariosRecentementeAtivos: number;
  usuariosAtivos7d: number;
  usuariosInativos: number;
  totalGeral: number;
}

interface DadosUsuariosOnline {
  usuarios: UsuarioOnline[];
  metricas: MetricasOnline;
  filtros: {
    search: string;
    status: string;
  };
}

export default function MonitorUsuariosOnline() {
  const [dados, setDados] = useState<DadosUsuariosOnline | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [filtros, setFiltros] = useState({
    search: '',
    status: 'todos',
  });

  const buscarDados = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: filtros.search,
        status: filtros.status,
        limit: '50', // Mostrar mais usuários para monitoramento
      });
      
      const response = await fetch(`/api/admin/usuarios-online?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDados(data);
        setUltimaAtualizacao(new Date());
      }
    } catch (error) {
      console.error('Erro ao buscar dados de usuários online:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [filtros]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(buscarDados, 15000); // A cada 15 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh, filtros]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'recente': return 'text-yellow-600 bg-yellow-100';
      case 'ausente': return 'text-orange-600 bg-orange-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Circle className="w-3 h-3 fill-current" />;
      case 'recente': return <Circle className="w-3 h-3 fill-current" />;
      case 'ausente': return <Clock className="w-3 h-3" />;
      case 'offline': return <WifiOff className="w-3 h-3" />;
      default: return <WifiOff className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online Agora';
      case 'recente': return 'Ativo Recente';
      case 'ausente': return 'Ausente';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  if (loading && !dados) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Carregando usuários online...</span>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wifi className="w-6 h-6 mr-2 text-green-600" />
              Monitor de Usuários Online
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            
            <button
              onClick={buscarDados}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Online Agora</p>
                <p className="text-2xl font-bold text-green-600">
                  {dados.metricas.usuariosOnlineAgora}
                </p>
              </div>
              <Circle className="w-8 h-8 text-green-600 fill-current" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Recente (15min)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dados.metricas.usuariosRecentementeAtivos}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Ativos (7d)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dados.metricas.usuariosAtivos7d}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Inativos (+30d)</p>
                <p className="text-2xl font-bold text-gray-600">
                  {dados.metricas.usuariosInativos}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dados.metricas.totalGeral}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="online">Online Agora</option>
              <option value="recente">Ativo Recente</option>
              <option value="ativos">Ativos (7d)</option>
              <option value="inativos">Inativos (+30d)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Usuários ({dados.usuarios.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {dados.usuarios.map((usuario) => (
            <div key={usuario.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(usuario.statusOnline)}`}>
                    {getStatusIcon(usuario.statusOnline)}
                    <span className="ml-1">{getStatusText(usuario.statusOnline)}</span>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">{usuario.nome}</p>
                    <p className="text-sm text-gray-500">{usuario.email}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {usuario.ultimaAtividadeTexto}
                  </p>
                  <p className="text-xs text-gray-500">
                    {usuario.estatisticas.totalTransacoes} transações
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {dados.usuarios.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
