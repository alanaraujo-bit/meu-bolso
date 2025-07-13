'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showContribuicaoModal, setShowContribuicaoModal] = useState(false);
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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchMetas();
  }, [session, status, router]);

  const fetchMetas = async () => {
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
    if (session) {
      fetchMetas();
    }
  }, [filtroStatus]);

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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Objetivos Financeiros</h1>
            <p className="text-gray-600 mt-2">Defina e acompanhe suas metas financeiras</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
          >
            + Nova Meta
          </button>
        </div>

        {mensagem && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            {mensagem}
            <button 
              onClick={() => setMensagem('')}
              className="float-right text-blue-700 hover:text-blue-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎯</div>
              <div>
                <p className="text-sm text-gray-600">Total de Metas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔥</div>
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.ativas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⏰</div>
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.vencidas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroStatus('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filtroStatus === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroStatus('ativas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filtroStatus === 'ativas' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setFiltroStatus('concluidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filtroStatus === 'concluidas' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFiltroStatus('vencidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filtroStatus === 'vencidas' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Criar Meta
            </button>
          </div>
        )}

        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingId ? 'Editar Meta' : 'Nova Meta'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Meta
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Viagem para Europa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Alvo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.valorAlvo}
                    onChange={(e) => setFormData({ ...formData, valorAlvo: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Alvo
                  </label>
                  <input
                    type="date"
                    value={formData.dataAlvo}
                    onChange={(e) => setFormData({ ...formData, dataAlvo: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Contribuição */}
        {showContribuicaoModal && metaSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Contribuir para: {metaSelecionada.nome}
              </h2>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Valor atual:</span>
                  <span className="font-medium">{formatarValor(metaSelecionada.currentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Meta:</span>
                  <span className="font-medium">{formatarValor(metaSelecionada.valorAlvo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Restante:</span>
                  <span className="font-medium text-blue-600">
                    {formatarValor(metaSelecionada.valorAlvo - metaSelecionada.currentAmount)}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleContribuir} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Contribuição
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={contribuicaoData.valor}
                    onChange={(e) => setContribuicaoData({ ...contribuicaoData, valor: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={contribuicaoData.descricao}
                    onChange={(e) => setContribuicaoData({ ...contribuicaoData, descricao: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Economia do mês"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContribuicaoModal(false);
                      setContribuicaoData({ valor: '', descricao: '' });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Contribuindo...' : 'Contribuir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}