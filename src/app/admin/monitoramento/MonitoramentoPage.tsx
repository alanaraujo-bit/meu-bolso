'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database, 
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Globe,
  BarChart3
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    download: number;
    upload: number;
    latency: number;
  };
  database: {
    connections: number;
    queryTime: number;
    size: number;
  };
  requests: {
    total: number;
    success: number;
    errors: number;
    responseTime: number;
  };
  uptime: number;
  timestamp: Date;
}

export default function MonitoramentoPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    carregarMetricas();
    const interval = setInterval(carregarMetricas, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarMetricas = async () => {
    try {
      const response = await fetch('/api/admin/monitoramento');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-600 bg-red-100';
    if (percentage > 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 text-center">
        <Server className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Não foi possível carregar as métricas do sistema</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-600" />
            Monitoramento do Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Performance e recursos em tempo real
          </p>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Atualizado: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Server className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Uptime
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatUptime(metrics.uptime)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Requisições/min
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.requests.total.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Resp. Média
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.requests.responseTime}ms
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Conexões DB
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {metrics.database.connections}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CPU */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-blue-600" />
              CPU
            </h3>
            <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(metrics.cpu.usage)}`}>
              {metrics.cpu.usage}%
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uso ({metrics.cpu.cores} cores)</span>
                <span>{metrics.cpu.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(metrics.cpu.usage)}`}
                  style={{ width: `${metrics.cpu.usage}%` }}
                ></div>
              </div>
            </div>
            {metrics.cpu.temperature && (
              <div className="text-sm text-gray-600">
                Temperatura: {metrics.cpu.temperature}°C
              </div>
            )}
          </div>
        </div>

        {/* Memória */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Memória
            </h3>
            <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(metrics.memory.percentage)}`}>
              {metrics.memory.percentage}%
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>RAM Usada</span>
                <span>{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(metrics.memory.percentage)}`}
                  style={{ width: `${metrics.memory.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Disco */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HardDrive className="w-5 h-5 mr-2 text-purple-600" />
              Armazenamento
            </h3>
            <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(metrics.disk.percentage)}`}>
              {metrics.disk.percentage}%
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disco Usado</span>
                <span>{formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(metrics.disk.percentage)}`}
                  style={{ width: `${metrics.disk.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rede */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-orange-600" />
              Rede
            </h3>
            <span className="text-sm text-gray-500">
              {metrics.network.latency}ms
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm">Download</span>
              </div>
              <span className="text-sm font-medium">{formatBytes(metrics.network.download)}/s</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm">Upload</span>
              </div>
              <span className="text-sm font-medium">{formatBytes(metrics.network.upload)}/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Aplicação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Banco de Dados
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conexões Ativas</span>
              <span className="text-sm font-medium">{metrics.database.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tempo de Query</span>
              <span className="text-sm font-medium">{metrics.database.queryTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tamanho do DB</span>
              <span className="text-sm font-medium">{formatBytes(metrics.database.size)}</span>
            </div>
          </div>
        </div>

        {/* Requisições */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-600" />
            Requisições (última hora)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-sm font-medium">{metrics.requests.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sucessos</span>
              <span className="text-sm font-medium text-green-600">{metrics.requests.success.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Erros</span>
              <span className="text-sm font-medium text-red-600">{metrics.requests.errors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taxa de Sucesso</span>
              <span className="text-sm font-medium">
                {((metrics.requests.success / metrics.requests.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
