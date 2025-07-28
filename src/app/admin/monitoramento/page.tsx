"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { 
  Monitor, Activity, AlertTriangle, CheckCircle, Clock,
  Cpu, HardDrive, Zap, Globe, Database, RefreshCw,
  TrendingUp, TrendingDown, Wifi, Server
} from 'lucide-react';

interface MetricasSistema {
  cpu: number;
  memoria: number;
  disco: number;
  rede: number;
  database: {
    conexoes: number;
    queryTime: number;
    status: 'online' | 'offline' | 'slow';
  };
  uptime: string;
  requests: {
    total: number;
    success: number;
    error: number;
    averageTime: number;
  };
}

interface AlertaAtivo {
  id: string;
  tipo: 'critical' | 'warning' | 'info';
  titulo: string;
  descricao: string;
  timestamp: string;
  status: 'ativo' | 'resolvido';
  categoria: string;
}

interface LogAtividade {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'error' | 'warning';
}

export default function MonitoramentoAdmin() {
  const [metricas, setMetricas] = useState<MetricasSistema>({
    cpu: 0,
    memoria: 0,
    disco: 0,
    rede: 0,
    database: { conexoes: 0, queryTime: 0, status: 'online' },
    uptime: '0h 0m',
    requests: { total: 0, success: 0, error: 0, averageTime: 0 }
  });
  
  const [alertas, setAlertas] = useState<AlertaAtivo[]>([]);
  const [logs, setLogs] = useState<LogAtividade[]>([]);
  const { loading, setLoading } = useCleanLoading();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    buscarDadosMonitoramento();
    
    if (autoRefresh) {
      const interval = setInterval(buscarDadosMonitoramento, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const buscarDadosMonitoramento = async () => {
    try {
      setLoading(true);
      
      const [metricasRes, alertasRes, logsRes] = await Promise.all([
        fetch('/api/admin/monitoramento/metricas'),
        fetch('/api/admin/monitoramento/alertas'),
        fetch('/api/admin/monitoramento/logs')
      ]);

      if (metricasRes.ok) {
        const metricasData = await metricasRes.json();
        setMetricas(metricasData);
      }

      if (alertasRes.ok) {
        const alertasData = await alertasRes.json();
        setAlertas(alertasData.alertas);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de monitoramento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolverAlerta = async (alertaId: string) => {
    try {
      const response = await fetch(`/api/admin/monitoramento/alertas/${alertaId}/resolver`, {
        method: 'POST'
      });
      
      if (response.ok) {
        buscarDadosMonitoramento();
      }
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'slow': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressBarColor = (value: number) => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatUptime = (uptime: string) => {
    return uptime || '0h 0m';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Monitor className="w-7 h-7 mr-3 text-green-500" />
                🔍 Monitoramento do Sistema
              </h1>
              <p className="text-gray-600 mt-1">Acompanhe a saúde e performance do sistema em tempo real</p>
            </div>

            <div className="flex space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
              </label>
              
              <button
                onClick={buscarDadosMonitoramento}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status do Sistema</p>
                <p className="text-2xl font-bold text-green-600">🟢 Online</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-blue-600">{formatUptime(metricas.uptime)}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {alertas.filter(a => a.status === 'ativo').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requests/min</p>
                <p className="text-2xl font-bold text-purple-600">{metricas.requests.total}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Métricas do Sistema */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-blue-500" />
            💻 Métricas de Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  CPU
                </span>
                <span className="text-sm font-bold">{metricas.cpu}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metricas.cpu)}`}
                  style={{ width: `${metricas.cpu}%` }}
                />
              </div>
            </div>

            {/* Memória */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Memória
                </span>
                <span className="text-sm font-bold">{metricas.memoria}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metricas.memoria)}`}
                  style={{ width: `${metricas.memoria}%` }}
                />
              </div>
            </div>

            {/* Disco */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  Disco
                </span>
                <span className="text-sm font-bold">{metricas.disco}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metricas.disco)}`}
                  style={{ width: `${metricas.disco}%` }}
                />
              </div>
            </div>

            {/* Rede */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Wifi className="w-4 h-4 mr-2" />
                  Rede
                </span>
                <span className="text-sm font-bold">{metricas.rede}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(metricas.rede)}`}
                  style={{ width: `${metricas.rede}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database e Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-500" />
              🗄️ Status do Banco de Dados
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`font-bold ${getStatusColor(metricas.database.status)}`}>
                  {metricas.database.status === 'online' ? '🟢 Online' : 
                   metricas.database.status === 'slow' ? '🟡 Lento' : '🔴 Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conexões Ativas:</span>
                <span className="font-bold">{metricas.database.conexoes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Médio Query:</span>
                <span className="font-bold">{metricas.database.queryTime}ms</span>
              </div>
            </div>
          </div>

          {/* Requests Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-500" />
              🌐 Estatísticas de Requests
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-bold">{metricas.requests.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sucesso:</span>
                <span className="font-bold text-green-600">{metricas.requests.success}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Erro:</span>
                <span className="font-bold text-red-600">{metricas.requests.error}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Médio:</span>
                <span className="font-bold">{metricas.requests.averageTime}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas Ativos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              🚨 Alertas Ativos
            </h2>
          </div>
          
          <div className="p-6">
            {alertas.filter(a => a.status === 'ativo').length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">Nenhum alerta ativo no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertas.filter(a => a.status === 'ativo').map((alerta) => (
                  <div key={alerta.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alerta.tipo)}
                        <div>
                          <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {alerta.categoria} • {new Date(alerta.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => resolverAlerta(alerta.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Resolver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Log de Atividades Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              📋 Atividades Recentes
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.usuario}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.acao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⚠️'} {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
