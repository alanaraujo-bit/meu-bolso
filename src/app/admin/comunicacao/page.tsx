"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import { 
  Mail, Send, Users, MessageSquare, Bell, Globe,
  Calendar, RefreshCw, Eye, Trash2, Edit, Plus,
  CheckCircle, Clock, X, FileText, Image, Paperclip
} from 'lucide-react';

interface CampanhaEmail {
  id: string;
  nome: string;
  assunto: string;
  conteudo: string;
  destinatarios: number;
  enviadoPara: number;
  abertos: number;
  cliques: number;
  status: 'rascunho' | 'agendado' | 'enviando' | 'enviado' | 'pausado';
  criadoEm: string;
  enviadoEm?: string;
  agendadoPara?: string;
}

interface NotificacaoSistema {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  destinatarios: 'todos' | 'ativos' | 'inativos' | 'selecionados';
  usuariosIds?: string[];
  visivel: boolean;
  criadoEm: string;
  expiresEm?: string;
}

interface TemplateEmail {
  id: string;
  nome: string;
  assunto: string;
  conteudo: string;
  categoria: string;
  criadoEm: string;
}

export default function ComunicacaoAdmin() {
  const [campanhas, setCampanhas] = useState<CampanhaEmail[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoSistema[]>([]);
  const [templates, setTemplates] = useState<TemplateEmail[]>([]);
  const { loading, setLoading } = useCleanLoading();
  const [abaSelecionada, setAbaSelecionada] = useState('campanhas');
  const [modalNovaCampanha, setModalNovaCampanha] = useState(false);
  const [modalNotificacao, setModalNotificacao] = useState(false);

  const [novaCampanha, setNovaCampanha] = useState({
    nome: '',
    assunto: '',
    conteudo: '',
    destinatarios: 'todos',
    agendamento: '',
    templateId: ''
  });

  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'info' as const,
    destinatarios: 'todos' as const,
    expiracao: ''
  });

  const abas = [
    { id: 'campanhas', nome: 'Campanhas de E-mail', icone: Mail },
    { id: 'notificacoes', nome: 'Notificações', icone: Bell },
    { id: 'templates', nome: 'Templates', icone: FileText }
  ];

  useEffect(() => {
    buscarDados();
  }, [abaSelecionada]);

  const buscarDados = async () => {
    try {
      setLoading(true);
      
      if (abaSelecionada === 'campanhas') {
        const response = await fetch('/api/admin/comunicacao/campanhas');
        if (response.ok) {
          const data = await response.json();
          setCampanhas(data.campanhas);
        }
      } else if (abaSelecionada === 'notificacoes') {
        const response = await fetch('/api/admin/comunicacao/notificacoes');
        if (response.ok) {
          const data = await response.json();
          setNotificacoes(data.notificacoes);
        }
      } else if (abaSelecionada === 'templates') {
        const response = await fetch('/api/admin/comunicacao/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarCampanha = async () => {
    try {
      const response = await fetch('/api/admin/comunicacao/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaCampanha)
      });

      if (response.ok) {
        setModalNovaCampanha(false);
        setNovaCampanha({
          nome: '',
          assunto: '',
          conteudo: '',
          destinatarios: 'todos',
          agendamento: '',
          templateId: ''
        });
        buscarDados();
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    }
  };

  const criarNotificacao = async () => {
    try {
      const response = await fetch('/api/admin/comunicacao/notificacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaNotificacao)
      });

      if (response.ok) {
        setModalNotificacao(false);
        setNovaNotificacao({
          titulo: '',
          mensagem: '',
          tipo: 'info',
          destinatarios: 'todos',
          expiracao: ''
        });
        buscarDados();
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  };

  const enviarCampanha = async (campanhaId: string) => {
    if (!confirm('Tem certeza que deseja enviar esta campanha agora?')) return;

    try {
      const response = await fetch(`/api/admin/comunicacao/campanhas/${campanhaId}/enviar`, {
        method: 'POST'
      });

      if (response.ok) {
        buscarDados();
      }
    } catch (error) {
      console.error('Erro ao enviar campanha:', error);
    }
  };

  const pausarCampanha = async (campanhaId: string) => {
    try {
      const response = await fetch(`/api/admin/comunicacao/campanhas/${campanhaId}/pausar`, {
        method: 'POST'
      });

      if (response.ok) {
        buscarDados();
      }
    } catch (error) {
      console.error('Erro ao pausar campanha:', error);
    }
  };

  const excluirNotificacao = async (notificacaoId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) return;

    try {
      const response = await fetch(`/api/admin/comunicacao/notificacoes/${notificacaoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        buscarDados();
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      rascunho: { color: 'bg-gray-100 text-gray-800', icon: '📝', text: 'Rascunho' },
      agendado: { color: 'bg-blue-100 text-blue-800', icon: '⏰', text: 'Agendado' },
      enviando: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', text: 'Enviando' },
      enviado: { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Enviado' },
      pausado: { color: 'bg-red-100 text-red-800', icon: '⏸️', text: 'Pausado' }
    };

    const badge = badges[status as keyof typeof badges] || badges.rascunho;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const getTipoNotificacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const calcularTaxaAbertura = (campanha: CampanhaEmail) => {
    if (campanha.enviadoPara === 0) return 0;
    return ((campanha.abertos / campanha.enviadoPara) * 100).toFixed(1);
  };

  const calcularTaxaClique = (campanha: CampanhaEmail) => {
    if (campanha.abertos === 0) return 0;
    return ((campanha.cliques / campanha.abertos) * 100).toFixed(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-7 h-7 mr-3 text-blue-500" />
                📧 Central de Comunicação
              </h1>
              <p className="text-gray-600 mt-1">Gerencie campanhas de e-mail, notificações e templates</p>
            </div>

            <div className="flex space-x-3">
              {abaSelecionada === 'campanhas' && (
                <button
                  onClick={() => setModalNovaCampanha(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Campanha</span>
                </button>
              )}

              {abaSelecionada === 'notificacoes' && (
                <button
                  onClick={() => setModalNotificacao(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Notificação</span>
                </button>
              )}

              <button
                onClick={buscarDados}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

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
            {/* Campanhas de E-mail */}
            {abaSelecionada === 'campanhas' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : campanhas.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Nenhuma campanha criada ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {campanhas.map((campanha) => (
                      <div key={campanha.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{campanha.nome}</h3>
                            <p className="text-sm text-gray-500">{campanha.assunto}</p>
                          </div>
                          {getStatusBadge(campanha.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Destinatários</p>
                            <p className="font-bold text-gray-900">{campanha.destinatarios.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Enviados</p>
                            <p className="font-bold text-blue-600">{campanha.enviadoPara.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Taxa de Abertura</p>
                            <p className="font-bold text-green-600">{calcularTaxaAbertura(campanha)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Taxa de Clique</p>
                            <p className="font-bold text-purple-600">{calcularTaxaClique(campanha)}%</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Criado em {new Date(campanha.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                          
                          <div className="flex space-x-2">
                            {campanha.status === 'rascunho' && (
                              <button
                                onClick={() => enviarCampanha(campanha.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            
                            {campanha.status === 'enviando' && (
                              <button
                                onClick={() => pausarCampanha(campanha.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button className="text-gray-600 hover:text-gray-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notificações do Sistema */}
            {abaSelecionada === 'notificacoes' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : notificacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Nenhuma notificação criada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notificacoes.map((notificacao) => (
                      <div key={notificacao.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getTipoNotificacaoIcon(notificacao.tipo)}</span>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{notificacao.titulo}</h3>
                              <p className="text-gray-600 mt-1">{notificacao.mensagem}</p>
                              
                              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                <span>👥 {notificacao.destinatarios}</span>
                                <span>📅 {new Date(notificacao.criadoEm).toLocaleDateString('pt-BR')}</span>
                                {notificacao.expiresEm && (
                                  <span>⏰ Expira em {new Date(notificacao.expiresEm).toLocaleDateString('pt-BR')}</span>
                                )}
                                <span className={notificacao.visivel ? 'text-green-600' : 'text-red-600'}>
                                  {notificacao.visivel ? '👁️ Visível' : '👁️‍🗨️ Oculta'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => excluirNotificacao(notificacao.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Templates */}
            {abaSelecionada === 'templates' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Nenhum template criado ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">{template.nome}</h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                              {template.categoria}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{template.assunto}</p>
                        
                        <div className="text-xs text-gray-500 mb-4">
                          Criado em {new Date(template.criadoEm).toLocaleDateString('pt-BR')}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="flex-1 text-sm bg-blue-100 text-blue-700 py-2 px-3 rounded hover:bg-blue-200">
                            Usar Template
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Nova Campanha */}
        {modalNovaCampanha && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">📧 Nova Campanha de E-mail</h3>
                <button
                  onClick={() => setModalNovaCampanha(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Campanha</label>
                  <input
                    type="text"
                    value={novaCampanha.nome}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assunto</label>
                  <input
                    type="text"
                    value={novaCampanha.assunto}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, assunto: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
                  <textarea
                    rows={6}
                    value={novaCampanha.conteudo}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, conteudo: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destinatários</label>
                    <select
                      value={novaCampanha.destinatarios}
                      onChange={(e) => setNovaCampanha({ ...novaCampanha, destinatarios: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos os usuários</option>
                      <option value="ativos">Usuários ativos</option>
                      <option value="inativos">Usuários inativos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agendamento (opcional)</label>
                    <input
                      type="datetime-local"
                      value={novaCampanha.agendamento}
                      onChange={(e) => setNovaCampanha({ ...novaCampanha, agendamento: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setModalNovaCampanha(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={criarCampanha}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Criar Campanha
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nova Notificação */}
        {modalNotificacao && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">🔔 Nova Notificação</h3>
                <button
                  onClick={() => setModalNotificacao(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={novaNotificacao.titulo}
                    onChange={(e) => setNovaNotificacao({ ...novaNotificacao, titulo: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mensagem</label>
                  <textarea
                    rows={4}
                    value={novaNotificacao.mensagem}
                    onChange={(e) => setNovaNotificacao({ ...novaNotificacao, mensagem: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      value={novaNotificacao.tipo}
                      onChange={(e) => setNovaNotificacao({ ...novaNotificacao, tipo: e.target.value as any })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">Informação</option>
                      <option value="success">Sucesso</option>
                      <option value="warning">Aviso</option>
                      <option value="error">Erro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destinatários</label>
                    <select
                      value={novaNotificacao.destinatarios}
                      onChange={(e) => setNovaNotificacao({ ...novaNotificacao, destinatarios: e.target.value as any })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos os usuários</option>
                      <option value="ativos">Usuários ativos</option>
                      <option value="inativos">Usuários inativos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Expiração (opcional)</label>
                  <input
                    type="datetime-local"
                    value={novaNotificacao.expiracao}
                    onChange={(e) => setNovaNotificacao({ ...novaNotificacao, expiracao: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setModalNotificacao(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={criarNotificacao}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Criar Notificação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
