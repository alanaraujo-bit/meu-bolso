"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { 
  Settings, Save, RefreshCw, Shield, Database, Mail,
  Bell, Globe, Palette, Users, Lock, AlertTriangle,
  Check, X, Upload, Download, Trash2
} from 'lucide-react';

interface ConfiguracaoSistema {
  id: string;
  chave: string;
  valor: string;
  tipo: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  categoria: string;
  descricao: string;
  opcoes?: string[];
}

interface BackupInfo {
  id: string;
  nome: string;
  tamanho: string;
  criadoEm: string;
  tipo: 'manual' | 'automatico';
  status: 'concluido' | 'processando' | 'erro';
}

export default function ConfiguracoesAdmin() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const { loading, setLoading } = useCleanLoading();
  const [salvando, setSalvando] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('geral');
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const abas = [
    { id: 'geral', nome: 'Geral', icone: Settings },
    { id: 'seguranca', nome: 'Segurança', icone: Shield },
    { id: 'email', nome: 'E-mail', icone: Mail },
    { id: 'notificacoes', nome: 'Notificações', icone: Bell },
    { id: 'aparencia', nome: 'Aparência', icone: Palette },
    { id: 'backup', nome: 'Backup', icone: Database }
  ];

  useEffect(() => {
    buscarConfiguracoes();
    buscarBackups();
  }, []);

  const buscarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/configuracoes');
      if (response.ok) {
        const data = await response.json();
        setConfiguracoes(data.configuracoes);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarBackups = async () => {
    try {
      const response = await fetch('/api/admin/configuracoes/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Erro ao buscar backups:', error);
    }
  };

  const salvarConfiguracao = async (chave: string, valor: string) => {
    try {
      setSalvando(true);
      const response = await fetch('/api/admin/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor })
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Configuração salva com sucesso!' });
        buscarConfiguracoes();
      } else {
        setMensagem({ tipo: 'error', texto: 'Erro ao salvar configuração' });
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar configuração' });
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  const criarBackup = async () => {
    try {
      const response = await fetch('/api/admin/configuracoes/backup', {
        method: 'POST'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Backup iniciado com sucesso!' });
        buscarBackups();
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao criar backup' });
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/configuracoes/backup/${backupId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${backupId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
    }
  };

  const excluirBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este backup?')) return;

    try {
      const response = await fetch(`/api/admin/configuracoes/backup/${backupId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMensagem({ tipo: 'success', texto: 'Backup excluído com sucesso!' });
        buscarBackups();
      }
    } catch (error) {
      setMensagem({ tipo: 'error', texto: 'Erro ao excluir backup' });
    }
  };

  const handleInputChange = (chave: string, valor: string) => {
    setConfiguracoes(prev => prev.map(config => 
      config.chave === chave ? { ...config, valor } : config
    ));
  };

  const renderCampoConfiguracao = (config: ConfiguracaoSistema) => {
    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500";

    switch (config.tipo) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.valor === 'true'}
              onChange={(e) => handleInputChange(config.chave, e.target.checked.toString())}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Ativado</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={config.valor}
            onChange={(e) => handleInputChange(config.chave, e.target.value)}
            className={inputClasses}
          >
            {config.opcoes?.map(opcao => (
              <option key={opcao} value={opcao}>{opcao}</option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={config.valor}
            onChange={(e) => handleInputChange(config.chave, e.target.value)}
            rows={4}
            className={inputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={config.valor}
            onChange={(e) => handleInputChange(config.chave, e.target.value)}
            className={inputClasses}
          />
        );

      default:
        return (
          <input
            type="text"
            value={config.valor}
            onChange={(e) => handleInputChange(config.chave, e.target.value)}
            className={inputClasses}
          />
        );
    }
  };

  const configuracoesFiltradas = configuracoes.filter(config => config.categoria === abaSelecionada);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="w-7 h-7 mr-3 text-gray-500" />
                ⚙️ Configurações do Sistema
              </h1>
              <p className="text-gray-600 mt-1">Gerencie configurações, segurança e backups do sistema</p>
            </div>

            <button
              onClick={buscarConfiguracoes}
              disabled={loading}
              className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className={`p-4 rounded-lg border ${
            mensagem.tipo === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {mensagem.tipo === 'success' ? 
                <Check className="w-5 h-5" /> : 
                <X className="w-5 h-5" />
              }
              <span>{mensagem.texto}</span>
            </div>
          </div>
        )}

        {/* Navegação por Abas */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {abas.map((aba) => {
                const IconeAba = aba.icone;
                return (
                  <button
                    key={aba.id}
                    onClick={() => setAbaSelecionada(aba.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      abaSelecionada === aba.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconeAba className="w-4 h-4" />
                    <span>{aba.nome}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {abaSelecionada === 'backup' ? (
              /* Seção de Backup */
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">💾 Gerenciamento de Backups</h3>
                  <button
                    onClick={criarBackup}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>Criar Backup</span>
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">⚠️ Importante</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Recomendamos criar backups regulares dos dados. Backups automáticos são criados diariamente às 2:00.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {backups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {backup.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {backup.tamanho}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              backup.tipo === 'automatico' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {backup.tipo === 'automatico' ? '🤖 Automático' : '👤 Manual'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(backup.criadoEm).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              backup.status === 'concluido' ? 'bg-green-100 text-green-800' :
                              backup.status === 'processando' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {backup.status === 'concluido' ? '✅ Concluído' :
                               backup.status === 'processando' ? '⏳ Processando' : '❌ Erro'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {backup.status === 'concluido' && (
                              <>
                                <button
                                  onClick={() => downloadBackup(backup.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => excluirBackup(backup.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Seções de Configurações */
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {abas.find(a => a.id === abaSelecionada)?.nome} Settings
                </h3>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {configuracoesFiltradas.map((config) => (
                      <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {config.chave.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </label>
                            <p className="text-sm text-gray-500 mt-1">{config.descricao}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              {renderCampoConfiguracao(config)}
                            </div>
                            <button
                              onClick={() => salvarConfiguracao(config.chave, config.valor)}
                              disabled={salvando}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>Salvar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {configuracoesFiltradas.length === 0 && (
                      <div className="text-center py-12">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600">Nenhuma configuração encontrada para esta categoria</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
