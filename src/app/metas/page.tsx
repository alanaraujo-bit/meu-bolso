'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HelpButton from '@/components/HelpButton';
import CleanLoading from '@/components/CleanLoading';
import { useCleanLoading } from '@/hooks/useCleanLoading';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDataBrasil, getDataAtualBrasil } from '@/lib/dateUtils';
import { helpContents } from '@/lib/helpContents';

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

export default function MetasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metas, setMetas] = useState<Meta[]>([]);
  const { loading, setLoading } = useCleanLoading();
  const [showForm, setShowForm] = useState(false);
  const [showContribuicaoModal, setShowContribuicaoModal] = useState(false);
  // Adicionar estado para controlar modal de histórico
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [historicoMeta, setHistoricoMeta] = useState<Meta | null>(null);
  const [historicoContribuicoes, setHistoricoContribuicoes] = useState<Meta['transacoes']>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [estatisticas, setEstatisticas] = useState({
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

  // Declarar a função fetchMetas corretamente
  const fetchMetas = async () => {
    setLoading(true);
    try {
      const url = filtroStatus ? `/api/metas?status=${filtroStatus}` : '/api/metas';
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setMetas(data.metas);
        setEstatisticas(data.estatisticas);
      } else {
        setMensagem(data.error || 'Erro ao carregar metas');
      }
    } catch (error) {
      setMensagem('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchMetas();
  }, [session, status, router, filtroStatus]);

  // Remover o segundo useEffect que chamava fetchMetas based on filtroStatus

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `/api/metas/${editingId}` : '/api/metas';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(editingId ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!');
        resetForm();
        fetchMetas();
      } else {
        setMensagem(data.error || 'Erro ao salvar meta');
      }
    } catch (error) {
      setMensagem('Erro ao salvar meta');
    } finally {
      setLoading(false);
    }
  };

  const handleContribuir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaSelecionada) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/metas/${metaSelecionada.id}/contribuir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contribuicaoData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.message);
        setShowContribuicaoModal(false);
        setContribuicaoData({ valor: '', descricao: '' });
        fetchMetas();
      } else {
        setMensagem(data.error || 'Erro ao adicionar contribuição');
      }
    } catch (error) {
      setMensagem('Erro ao adicionar contribuição');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meta: Meta) => {
    setEditingId(meta.id);
    setFormData({
      nome: meta.nome,
      valorAlvo: meta.valorAlvo.toString(),
      dataAlvo: meta.dataAlvo.split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a meta "${nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/metas/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('Meta excluída com sucesso!');
        fetchMetas();
      } else {
        setMensagem(data.error || 'Erro ao excluir meta');
      }
    } catch (error) {
      setMensagem('Erro ao excluir meta');
    }
  };

  const handleToggleCompleted = async (meta: Meta) => {
    try {
      const response = await fetch(`/api/metas/${meta.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: !meta.isCompleted }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(meta.isCompleted ? 'Meta reaberta!' : 'Meta marcada como concluída!');
        fetchMetas();
      } else {
        setMensagem(data.error || 'Erro ao atualizar meta');
      }
    } catch (error) {
      setMensagem('Erro ao atualizar meta');
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', valorAlvo: '', dataAlvo: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Modificar a função formatarData para incluir horas e minutos
  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const calcularProgresso = (atual: number, alvo: number) => {
    return Math.min((atual / alvo) * 100, 100);
  };

  const calcularDiasRestantes = (dataAlvo: string) => {
    const hoje = new Date();
    const alvo = new Date(dataAlvo);
    const diffTime = alvo.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (meta: Meta) => {
    if (meta.isCompleted) return 'text-green-600';
    const diasRestantes = calcularDiasRestantes(meta.dataAlvo);
    if (diasRestantes < 0) return 'text-red-600';
    if (diasRestantes <= 30) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusText = (meta: Meta) => {
    if (meta.isCompleted) return 'Concluída';
    const diasRestantes = calcularDiasRestantes(meta.dataAlvo);
    if (diasRestantes < 0) return 'Vencida';
    if (diasRestantes === 0) return 'Vence hoje';
    if (diasRestantes === 1) return 'Vence amanhã';
    return `${diasRestantes} dias restantes`;
  };

  if (status === 'loading' || loading) {
    return <CleanLoading text="Carregando metas..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Objetivos Financeiros</h1>
              <HelpButton 
                title="Como definir e alcançar metas financeiras"
                steps={helpContents.metas}
                size="md"
                variant="inline"
              />
            </div>
            <p className="text-gray-600 mt-2">Defina e acompanhe suas metas financeiras</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
          >
            + Nova Meta
          </button>
        </div>

        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${mensagem.includes("sucesso") || mensagem.includes("!") 
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {mensagem}
            <button
              onClick={() => setMensagem('')}
              className="float-right text-current hover:opacity-70 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Metas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.ativas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">⏰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.vencidas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltroStatus('')}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
                filtroStatus === '' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroStatus('ativas')}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
                filtroStatus === 'ativas' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFiltroStatus('concluidas')}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
                filtroStatus === 'concluidas' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFiltroStatus('vencidas')}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
                filtroStatus === 'vencidas' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300'
              }`}
            >
              Vencidas
            </button>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metas.map((meta) => {
            const progresso = calcularProgresso(meta.currentAmount, meta.valorAlvo);
            
            return (
              <div key={meta.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{meta.nome}</h3>
                  <span className={`text-sm font-medium ${getStatusColor(meta)}`}>
                    {getStatusText(meta)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso</span>
                    <span>{progresso.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        meta.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progresso}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Atual:</span>
                    <span className="font-medium">{formatarValor(meta.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Meta:</span>
                    <span className="font-medium">{formatarValor(meta.valorAlvo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Restante:</span>
                    <span className="font-medium text-blue-600">
                      {formatarValor(Math.max(0, meta.valorAlvo - meta.currentAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prazo:</span>
                    <span className="font-medium">{formatarData(meta.dataAlvo)}</span>
                  </div>
                </div>

                {meta.transacoes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Últimas contribuições:</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {meta.transacoes.slice(0, 3).map((transacao) => (
                        <div key={transacao.id} className="flex justify-between text-xs">
                          <span className="text-gray-500">{formatarData(transacao.data)}</span>
                          <span className="text-green-600 font-medium">
                            +{formatarValor(transacao.valor)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!meta.isCompleted && (
                    <button
                      onClick={() => {
                        setMetaSelecionada(meta);
                        setShowContribuicaoModal(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Contribuir
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setHistoricoMeta(meta);
                      setHistoricoContribuicoes(meta.transacoes);
                      setShowHistoricoModal(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Histórico
                  </button>
                  <button
                    onClick={() => handleEdit(meta)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleCompleted(meta)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      meta.isCompleted
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {meta.isCompleted ? 'Reabrir' : 'Concluir'}
                  </button>
                  <button
                    onClick={() => handleDelete(meta.id, meta.nome)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {metas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma meta encontrada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira meta financeira!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
            >
              Criar Meta
            </button>
          </div>
        )}

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden transform transition-all">
              {/* Header com gradiente */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 p-8 relative overflow-hidden">
                {/* Decorações de fundo */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                        {editingId ? "Editar" : "Nova"} Meta
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {editingId ? "Atualize os dados" : "Configure uma nova meta financeira"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo do formulário */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Nome da Meta */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                      <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                      Nome da Meta *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium text-gray-900 placeholder-gray-600"
                      placeholder="Ex: Viagem para Europa"
                      required
                    />
                  </div>

                  {/* Valor Alvo */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                      <span className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></span>
                      Valor Alvo *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-lg">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.valorAlvo}
                        onChange={(e) => setFormData({ ...formData, valorAlvo: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-lg font-semibold text-gray-900 placeholder-gray-600"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Data Alvo */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                      <span className="w-3 h-3 bg-purple-600 rounded-full shadow-sm"></span>
                      Data Alvo *
                    </label>
                    <input
                      type="date"
                      value={formData.dataAlvo}
                      onChange={(e) => setFormData({ ...formData, dataAlvo: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-semibold text-gray-900 placeholder-gray-600"
                      min={formatDataBrasil(getDataAtualBrasil())}
                      required
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-4 pt-8 border-t-2 border-gray-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg border border-gray-300"
                    >
                      <span className="text-xl">✕</span>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold text-lg shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 hover:scale-105 transform disabled:opacity-50"
                    >
                      {loading && <LoadingSpinner size="xs" color="white" />}
                      <span className="text-xl">{editingId ? "💾" : "✨"}</span>
                      {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Contribuição */}
        {showContribuicaoModal && metaSelecionada && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden transform transition-all">
              {/* Header com gradiente */}
              <div className="bg-gradient-to-br from-green-600 via-green-600 to-emerald-600 p-8 relative overflow-hidden">
                {/* Decorações de fundo */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-3xl">💰</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white drop-shadow-sm">
                        Contribuir para Meta
                      </h2>
                      <p className="text-white/90 text-sm font-medium truncate max-w-[200px]">
                        {metaSelecionada.nome}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowContribuicaoModal(false);
                      setContribuicaoData({ valor: '', descricao: '' });
                    }}
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo do formulário */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)]">
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border-2 border-blue-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Valor Atual</p>
                      <p className="text-lg font-bold text-blue-600">{formatarValor(metaSelecionada.currentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Meta</p>
                      <p className="text-lg font-bold text-gray-900">{formatarValor(metaSelecionada.valorAlvo)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Restante</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatarValor(metaSelecionada.valorAlvo - metaSelecionada.currentAmount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleContribuir} className="space-y-8">
                  {/* Valor da Contribuição */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                      <span className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></span>
                      Valor da Contribuição *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold text-lg">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={contribuicaoData.valor}
                        onChange={(e) => setContribuicaoData({ ...contribuicaoData, valor: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white text-lg font-semibold text-gray-900 placeholder-gray-600"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-base font-bold text-gray-800">
                      <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                      Descrição <span className="text-sm font-normal text-gray-500">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={contribuicaoData.descricao}
                      onChange={(e) => setContribuicaoData({ ...contribuicaoData, descricao: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white font-medium text-gray-900 placeholder-gray-600"
                      placeholder="Ex: Economia do mês"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-4 pt-8 border-t-2 border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowContribuicaoModal(false);
                        setContribuicaoData({ valor: '', descricao: '' });
                      }}
                      className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-bold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg border border-gray-300"
                    >
                      <span className="text-xl">✕</span>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold text-lg shadow-xl shadow-green-600/30 flex items-center justify-center gap-3 hover:scale-105 transform disabled:opacity-50"
                    >
                      {loading && <LoadingSpinner size="xs" color="white" />}
                      <span className="text-xl">💰</span>
                      {loading ? 'Contribuindo...' : 'Contribuir'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Histórico */}
      {showHistoricoModal && historicoMeta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Contribuições: {historicoMeta.nome}</h2>
            {historicoContribuicoes.length === 0 ? (
              <p className="text-gray-600">Nenhuma contribuição encontrada.</p>
            ) : (
              <ul className="space-y-2">
                {historicoContribuicoes.map((contribuicao) => (
                  <li key={contribuicao.id} className="flex justify-between">
                    <span>{formatarData(contribuicao.data)}</span>
                    <span className="text-green-600 font-medium">+{formatarValor(contribuicao.valor)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHistoricoModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
