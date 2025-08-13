'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HelpButton from '@/components/HelpButton';
import CleanLoading from '@/components/CleanLoading';

interface Meta {
  id: string;
  nome: string;
  valorAlvo: number;
  currentAmount: number;
  dataAlvo: string;
  isCompleted: boolean;
  criadoEm: string;
  atualizadoEm: string;
  transacoes: {
    id: string;
    valor: number;
    data: string;
    descricao: string;
  }[];
}

interface FormData {
  nome: string;
  valorAlvo: string;
  dataAlvo: string;
}

interface ContribuicaoData {
  valor: string;
  descricao: string;
}

interface Estatisticas {
  total: number;
  ativas: number;
  concluidas: number;
  vencidas: number;
}

export default function MetasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados principais
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showContribuicaoModal, setShowContribuicaoModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null);
  const [historicoMeta, setHistoricoMeta] = useState<Meta | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total: 0,
    ativas: 0,
    concluidas: 0,
    vencidas: 0
  });

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    valorAlvo: '',
    dataAlvo: ''
  });

  const [contribuicaoData, setContribuicaoData] = useState<ContribuicaoData>({
    valor: '',
    descricao: ''
  });

  // Verificar autenticação
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // Detectar tema do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Observer para mudanças de tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Carregar dados
  useEffect(() => {
    if (session) {
      fetchMetas();
    }
  }, [session, filtroStatus]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Funções de API
  const fetchMetas = async () => {
    try {
      setLoading(true);
      const url = filtroStatus !== 'todas' ? `/api/metas?status=${filtroStatus}` : '/api/metas';
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setMetas(data.metas || []);
        setEstatisticas(data.estatisticas || { total: 0, ativas: 0, concluidas: 0, vencidas: 0 });
      } else {
        setMensagem(data.error || 'Erro ao carregar metas');
      }
    } catch (error) {
      setMensagem('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valorAlvo || !formData.dataAlvo) {
      setMensagem("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/metas/${editingId}` : "/api/metas";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          valorAlvo: parseFloat(formData.valorAlvo),
        }),
      });

      if (res.ok) {
        setMensagem(editingId ? "Meta atualizada!" : "Meta criada!");
        resetForm();
        fetchMetas();
      } else {
        const data = await res.json();
        setMensagem(data.error || "Erro ao salvar meta");
      }
    } catch (error) {
      setMensagem("Erro ao salvar meta");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      valorAlvo: '',
      dataAlvo: ''
    });
    setEditingId(null);
    setShowForm(false);
    setMensagem("");
  };

  const editMeta = (meta: Meta) => {
    setFormData({
      nome: meta.nome,
      valorAlvo: meta.valorAlvo.toString(),
      dataAlvo: meta.dataAlvo.split("T")[0],
    });
    setEditingId(meta.id);
    setShowForm(true);
  };

  const deleteMeta = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/metas/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setMensagem("Meta excluída!");
        fetchMetas();
      } else {
        setMensagem("Erro ao excluir meta");
      }
    } catch (error) {
      setMensagem("Erro ao excluir meta");
    } finally {
      setLoading(false);
    }
  };

  const handleContribuicao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contribuicaoData.valor || !metaSelecionada) {
      setMensagem("Por favor, informe o valor da contribuição");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/metas/${metaSelecionada.id}/contribuir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: parseFloat(contribuicaoData.valor),
          descricao: contribuicaoData.descricao || `Contribuição para ${metaSelecionada.nome}`
        }),
      });

      if (res.ok) {
        setMensagem("Contribuição adicionada!");
        setContribuicaoData({ valor: '', descricao: '' });
        setShowContribuicaoModal(false);
        setMetaSelecionada(null);
        fetchMetas();
      } else {
        const data = await res.json();
        setMensagem(data.error || "Erro ao adicionar contribuição");
      }
    } catch (error) {
      setMensagem("Erro ao adicionar contribuição");
    } finally {
      setLoading(false);
    }
  };

  const abrirHistorico = async (meta: Meta) => {
    setHistoricoMeta(meta);
    setShowHistoricoModal(true);
  };

  // Filtrar metas
  const metasFiltradas = metas.filter(meta => {
    if (filtroStatus === 'todas') return true;
    if (filtroStatus === 'ativas') return !meta.isCompleted && new Date(meta.dataAlvo) >= new Date();
    if (filtroStatus === 'concluidas') return meta.isCompleted;
    if (filtroStatus === 'vencidas') return !meta.isCompleted && new Date(meta.dataAlvo) < new Date();
    return true;
  });

  // Função para calcular progresso
  const calcularProgresso = (meta: Meta) => {
    if (meta.valorAlvo <= 0) return 0;
    return Math.min((meta.currentAmount / meta.valorAlvo) * 100, 100);
  };

  // Função para determinar status da meta
  const getStatusMeta = (meta: Meta) => {
    if (meta.isCompleted) return { texto: 'Concluída', cor: 'text-green-600', bg: 'bg-green-100' };
    if (new Date(meta.dataAlvo) < new Date()) return { texto: 'Vencida', cor: 'text-red-600', bg: 'bg-red-100' };
    return { texto: 'Ativa', cor: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (status === "loading" || loading) {
    return <CleanLoading text="Carregando metas..." fullScreen />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    } relative overflow-hidden`}>
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          darkMode ? 'bg-emerald-500' : 'bg-emerald-300'
        }`}></div>
        <div className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          darkMode ? 'bg-cyan-500' : 'bg-cyan-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 ${
          darkMode ? 'bg-teal-500' : 'bg-teal-300'
        }`}></div>
      </div>

      {/* Botão Dark Mode - Responsivo e não sobreposto */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 z-40 p-2 rounded-full transition-all duration-300 sm:p-3 ${
          darkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-amber-400 hover:text-amber-300' 
            : 'bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900'
        } backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-110`}
        aria-label="Toggle dark mode"
      >
        <span className="text-lg sm:text-xl">{darkMode ? '☀️' : '🌙'}</span>
      </button>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <HelpButton 
          title="Metas Financeiras"
          steps={[
            {
              title: "📋 Metas Financeiras",
              content: "Defina objetivos financeiros e acompanhe seu progresso com contribuições regulares."
            },
            {
              title: "🎯 Como usar",
              content: "• Crie metas com valor alvo e prazo\n• Adicione contribuições regularmente\n• Acompanhe o progresso visual\n• Visualize histórico detalhado"
            }
          ]}
        />
      </div>

      {/* Container principal */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header com glassmorphism */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border mb-8 overflow-hidden ${
          darkMode 
            ? 'bg-gray-800/40 border-gray-700/50' 
            : 'bg-white/40 border-white/50'
        }`}>
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 relative overflow-hidden">
            {/* Decorações de fundo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-16 -translate-x-16"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-3xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    💰 Metas Financeiras
                  </h1>
                  <p className="text-white/90 text-lg font-medium">
                    Defina objetivos e alcance seus sonhos
                  </p>
                </div>
              </div>
              
              {/* Estatísticas rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-white">{estatisticas.total}</div>
                  <div className="text-white/90 text-sm font-medium">Total</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-white">{estatisticas.ativas}</div>
                  <div className="text-white/90 text-sm font-medium">Ativas</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-white">{estatisticas.concluidas}</div>
                  <div className="text-white/90 text-sm font-medium">Concluídas</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-white">{estatisticas.vencidas}</div>
                  <div className="text-white/90 text-sm font-medium">Vencidas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span className="text-lg">🎯</span>
            Nova Meta
          </button>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
            mensagem.includes('Erro') 
              ? darkMode
                ? 'bg-red-900/20 border-red-500/30 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
              : darkMode
                ? 'bg-green-900/20 border-green-500/30 text-green-400'
                : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{mensagem}</span>
              <button 
                onClick={() => setMensagem('')}
                className="text-lg hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className={`backdrop-blur-xl rounded-2xl shadow-xl border mb-8 p-6 ${
          darkMode 
            ? 'bg-gray-800/40 border-gray-700/50' 
            : 'bg-white/40 border-white/50'
        }`}>
          <div className="flex flex-wrap gap-4 items-center">
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Filtrar por:
            </span>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'todas', label: 'Todas', icon: '📋' },
                { value: 'ativas', label: 'Ativas', icon: '🔥' },
                { value: 'concluidas', label: 'Concluídas', icon: '✅' },
                { value: 'vencidas', label: 'Vencidas', icon: '⏰' }
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroStatus(filtro.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                    filtroStatus === filtro.value
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : darkMode
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{filtro.icon}</span>
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className={`backdrop-blur-xl rounded-2xl shadow-xl border ${
          darkMode 
            ? 'bg-gray-800/40 border-gray-700/50' 
            : 'bg-white/40 border-white/50'
        }`}>
          <div className="p-6">
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <span className="text-3xl">📊</span>
              Suas Metas ({metasFiltradas.length})
            </h2>

            {metasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-4">🎯</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Nenhuma meta encontrada
                </h3>
                <p className={`text-base mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filtroStatus === 'todas' 
                    ? 'Crie sua primeira meta financeira!'
                    : `Nenhuma meta ${filtroStatus === 'ativas' ? 'ativa' : filtroStatus === 'concluidas' ? 'concluída' : 'vencida'} encontrada.`
                  }
                </p>
                {filtroStatus === 'todas' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <span className="mr-2">🎯</span>
                    Criar Nova Meta
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {metasFiltradas.map((meta) => {
                  const progresso = calcularProgresso(meta);
                  const status = getStatusMeta(meta);
                  const diasRestantes = Math.ceil((new Date(meta.dataAlvo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={meta.id}
                      className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                        darkMode 
                          ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50' 
                          : 'bg-white/60 border-white/60 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Informações principais */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className={`text-xl font-bold mb-2 ${
                                darkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                🎯 {meta.nome}
                              </h3>
                              <div className="flex flex-wrap gap-3 items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  darkMode ? `${status.bg.replace('bg-', 'bg-').replace('100', '900/30')} ${status.cor.replace('text-', 'text-').replace('600', '400')}` : `${status.bg} ${status.cor}`
                                }`}>
                                  {status.texto}
                                </span>
                                {!meta.isCompleted && (
                                  <span className={`text-sm font-medium ${
                                    darkMode ? 'text-gray-300' : 'text-gray-600'
                                  }`}>
                                    {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Vencida'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progresso */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-sm font-medium ${
                                darkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                Progresso: R$ {meta.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {meta.valorAlvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-sm font-bold ${
                                darkMode ? 'text-emerald-400' : 'text-emerald-600'
                              }`}>
                                {progresso.toFixed(1)}%
                              </span>
                            </div>
                            <div className={`w-full bg-gray-200 rounded-full h-3 overflow-hidden ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
                                style={{ width: `${progresso}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Data alvo */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">📅</span>
                            <span className={`font-medium ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              Meta para: {new Date(meta.dataAlvo).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                          {!meta.isCompleted && (
                            <button
                              onClick={() => {
                                setMetaSelecionada(meta);
                                setShowContribuicaoModal(true);
                              }}
                              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                                darkMode 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                              }`}
                            >
                              <span>💰</span>
                              Contribuir
                            </button>
                          )}
                          <button
                            onClick={() => abrirHistorico(meta)}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                              darkMode 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            <span>📊</span>
                            Histórico
                          </button>
                          <button
                            onClick={() => editMeta(meta)}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                              darkMode 
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30' 
                                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                            }`}
                          >
                            <span>✏️</span>
                            Editar
                          </button>
                          <button
                            onClick={() => deleteMeta(meta.id)}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                              darkMode 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <span>🗑️</span>
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header do formulário */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-16 -translate-x-16"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                        {editingId ? "✏️ Editar" : "✨ Nova"} Meta
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {editingId ? "Atualize os dados da meta" : "Defina um novo objetivo financeiro"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 font-bold text-lg hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo do formulário */}
              <div className={`p-8 overflow-y-auto max-h-[calc(95vh-180px)] ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome da Meta */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm"></span>
                      🎯 Nome da Meta *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                      } focus:ring-4 focus:ring-emerald-500/20 placeholder-gray-500`}
                      placeholder="Ex: Carro novo, Casa própria, Viagem..."
                      required
                    />
                  </div>

                  {/* Valor Alvo */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                      💰 Valor Alvo *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-lg">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valorAlvo}
                        onChange={(e) => setFormData({ ...formData, valorAlvo: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all text-lg font-semibold ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:ring-4 focus:ring-blue-500/20 placeholder-gray-500`}
                        placeholder="10000,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Data Alvo */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-pink-500 rounded-full shadow-sm"></span>
                      📅 Data Alvo *
                    </label>
                    <input
                      type="date"
                      value={formData.dataAlvo}
                      onChange={(e) => setFormData({ ...formData, dataAlvo: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'
                      } focus:ring-4 focus:ring-pink-500/20`}
                      required
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Meta"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Contribuição */}
        {showContribuicaoModal && metaSelecionada && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header */}
              <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white drop-shadow-sm">
                        Contribuir para Meta
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {metaSelecionada.nome}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowContribuicaoModal(false);
                      setMetaSelecionada(null);
                      setContribuicaoData({ valor: '', descricao: '' });
                    }}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 font-bold hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <form onSubmit={handleContribuicao} className="space-y-4">
                  {/* Valor */}
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 text-sm font-bold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span>💰</span>
                      Valor da Contribuição *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={contribuicaoData.valor}
                        onChange={(e) => setContribuicaoData({ ...contribuicaoData, valor: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all font-semibold ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        } focus:ring-4 focus:ring-green-500/20 placeholder-gray-500`}
                        placeholder="100,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 text-sm font-bold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span>📝</span>
                      Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      value={contribuicaoData.descricao}
                      onChange={(e) => setContribuicaoData({ ...contribuicaoData, descricao: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                      } focus:ring-4 focus:ring-green-500/20 placeholder-gray-500`}
                      placeholder="Ex: Economia do mês, Freelance..."
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowContribuicaoModal(false);
                        setMetaSelecionada(null);
                        setContribuicaoData({ valor: '', descricao: '' });
                      }}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? "Salvando..." : "Contribuir"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Histórico */}
        {showHistoricoModal && historicoMeta && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white drop-shadow-sm">
                        Histórico da Meta
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {historicoMeta.nome}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowHistoricoModal(false);
                      setHistoricoMeta(null);
                    }}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 font-bold hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className={`p-6 overflow-y-auto max-h-[calc(90vh-140px)] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Resumo da Meta */}
                <div className={`p-4 rounded-xl mb-6 ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        R$ {historicoMeta.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Valor Atual
                      </div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        R$ {historicoMeta.valorAlvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Valor Alvo
                      </div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        {calcularProgresso(historicoMeta).toFixed(1)}%
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Progresso
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Contribuições */}
                <div>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    <span>💰</span>
                    Contribuições ({historicoMeta.transacoes.length})
                  </h3>
                  
                  {historicoMeta.transacoes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📝</div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Nenhuma contribuição registrada ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historicoMeta.transacoes
                        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                        .map((transacao) => (
                        <div
                          key={transacao.id}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            darkMode 
                              ? 'bg-gray-700/30 border-gray-600/30' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-gray-800'
                              }`}>
                                {transacao.descricao}
                              </div>
                              <div className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {new Date(transacao.data).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                darkMode ? 'text-green-400' : 'text-green-600'
                              }`}>
                                + R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
