"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FileText, Download, Calendar, Filter, TrendingUp,
  BarChart3, PieChart, Users, DollarSign, RefreshCw,
  FileSpreadsheet, FileImage, Mail
} from 'lucide-react';

interface RelatorioTemplate {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  categoria: string;
  formato: string[];
  parametros: string[];
}

interface RelatorioGerado {
  id: string;
  nome: string;
  tipo: string;
  formato: string;
  criadoEm: string;
  tamanho: string;
  status: 'processando' | 'concluido' | 'erro';
  downloadUrl?: string;
}

export default function RelatoriosAdmin() {
  const [relatoriosTemplates] = useState<RelatorioTemplate[]>([
    {
      id: 'usuarios-atividade',
      nome: 'Relatório de Atividade dos Usuários',
      descricao: 'Análise detalhada da atividade dos usuários no sistema',
      icone: '👥',
      categoria: 'Usuários',
      formato: ['PDF', 'Excel', 'CSV'],
      parametros: ['Período', 'Tipo de atividade', 'Status do usuário']
    },
    {
      id: 'financeiro-completo',
      nome: 'Relatório Financeiro Completo',
      descricao: 'Visão geral das transações, receitas e despesas',
      icone: '💰',
      categoria: 'Financeiro',
      formato: ['PDF', 'Excel'],
      parametros: ['Período', 'Categorias', 'Usuários']
    },
    {
      id: 'metas-performance',
      nome: 'Performance das Metas',
      descricao: 'Análise do cumprimento de metas por usuário',
      icone: '🎯',
      categoria: 'Metas',
      formato: ['PDF', 'Excel', 'CSV'],
      parametros: ['Período', 'Status', 'Usuários']
    },
    {
      id: 'categorias-analise',
      nome: 'Análise de Categorias',
      descricao: 'Uso e performance das categorias de transações',
      icone: '🏷️',
      categoria: 'Categorias',
      formato: ['PDF', 'Excel'],
      parametros: ['Período', 'Tipo', 'Volume mínimo']
    },
    {
      id: 'sistema-logs',
      nome: 'Logs do Sistema',
      descricao: 'Registro de atividades e erros do sistema',
      icone: '📋',
      categoria: 'Sistema',
      formato: ['PDF', 'CSV'],
      parametros: ['Período', 'Nível', 'Módulo']
    },
    {
      id: 'dashboard-executivo',
      nome: 'Dashboard Executivo',
      descricao: 'Resumo executivo com KPIs principais',
      icone: '📊',
      categoria: 'Executivo',
      formato: ['PDF'],
      parametros: ['Período', 'Métricas']
    }
  ]);

  const [relatoriosGerados, setRelatoriosGerados] = useState<RelatorioGerado[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null);
  const [parametrosModal, setParametrosModal] = useState(false);

  useEffect(() => {
    buscarRelatoriosGerados();
  }, []);

  const buscarRelatoriosGerados = async () => {
    try {
      const response = await fetch('/api/admin/relatorios');
      if (response.ok) {
        const data = await response.json();
        setRelatoriosGerados(data.relatorios);
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    }
  };

  const gerarRelatorio = async (templateId: string, parametros: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/relatorios/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, parametros })
      });

      if (response.ok) {
        buscarRelatoriosGerados();
        setParametrosModal(false);
        setRelatorioSelecionado(null);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRelatorio = async (relatorioId: string) => {
    try {
      const response = await fetch(`/api/admin/relatorios/${relatorioId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${relatorioId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
    }
  };

  const categorias = ['todos', ...Array.from(new Set(relatoriosTemplates.map(r => r.categoria)))];

  const relatoriosFiltrados = relatoriosTemplates.filter(relatorio => 
    filtroCategoria === 'todos' || relatorio.categoria === filtroCategoria
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      processando: <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">⏳ Processando</span>,
      concluido: <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✅ Concluído</span>,
      erro: <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">❌ Erro</span>
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-blue-500" />
                📊 Relatórios do Sistema
              </h1>
              <p className="text-gray-600 mt-1">Gere relatórios personalizados e análises detalhadas</p>
            </div>

            <button
              onClick={buscarRelatoriosGerados}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Disponíveis</p>
                <p className="text-2xl font-bold text-blue-600">{relatoriosTemplates.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Relatórios Gerados</p>
                <p className="text-2xl font-bold text-green-600">{relatoriosGerados.length}</p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Processamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {relatoriosGerados.filter(r => r.status === 'processando').length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos Hoje</p>
                <p className="text-2xl font-bold text-purple-600">
                  {relatoriosGerados.filter(r => 
                    r.status === 'concluido' && 
                    new Date(r.criadoEm).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <FileImage className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria === 'todos' ? 'Todas as Categorias' : categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates de Relatórios */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📋 Templates de Relatórios</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatoriosFiltrados.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{template.icone}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{template.nome}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{template.categoria}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{template.descricao}</p>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Formatos disponíveis:</p>
                    <div className="flex space-x-2">
                      {template.formato.map(formato => (
                        <span key={formato} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {formato}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setRelatorioSelecionado(template.id);
                      setParametrosModal(true);
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Gerar Relatório</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relatórios Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📄 Relatórios Recentes</h2>
          </div>
          
          <div className="overflow-x-auto">
            {relatoriosGerados.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Nenhum relatório gerado ainda</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {relatoriosGerados.map((relatorio) => (
                    <tr key={relatorio.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {relatorio.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {relatorio.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {relatorio.formato}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(relatorio.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {relatorio.tamanho}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(relatorio.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {relatorio.status === 'concluido' && (
                          <button
                            onClick={() => downloadRelatorio(relatorio.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
