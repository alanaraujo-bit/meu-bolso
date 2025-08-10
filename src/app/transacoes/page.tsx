"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CleanLoading from "@/components/CleanLoading";
import { useCleanLoading } from "@/hooks/useCleanLoading";
import SeletorCategoria from "@/components/SeletorCategoria";
import HelpButton from "@/components/HelpButton";
import { formatDataBrasil, getDataAtualBrasil } from "@/lib/dateUtils";
import { helpContents } from "@/lib/helpContents";

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  cor?: string;
  icone?: string;
}

interface Transacao {
  id: string;
  tipo: "receita" | "despesa";
  valor: number;
  descricao?: string;
  data: string;
  tags: string[];
  anexos: string[];
  categoria: Categoria | null;
  criadoEm: string;
  atualizadoEm: string;
}

interface FormData {
  valor: string;
  tipo: "receita" | "despesa";
  categoriaId: string;
  data: string;
  descricao: string;
  tags: string;
  anexos: string[];
}

export default function TransacoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { loading, setLoading } = useCleanLoading(true);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Novo estado para controlar filtros
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<"" | "receita" | "despesa">("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroValorMin, setFiltroValorMin] = useState("");
  const [filtroValorMax, setFiltroValorMax] = useState("");

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalTransacoes, setTotalTransacoes] = useState(0);
  const itensPorPagina = 10;

  // Ordenação
  const [ordenacao, setOrdenacao] = useState({
    campo: 'criadoEm' as keyof Transacao,
    direcao: 'desc' as 'asc' | 'desc'
  });

  // Formulário
  const [formData, setFormData] = useState<FormData>({
    valor: "",
    tipo: "receita",
    categoriaId: "",
    data: "", // Deixar vazio inicialmente
    descricao: "",
    tags: "",
    anexos: [],
  });

  // Verificar autenticação
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // Carregar dados iniciais
  useEffect(() => {
    if (session) {
      fetchCategorias();
      fetchTransacoes();
    }
  }, [session]);

  // Buscar categorias
  async function fetchCategorias() {
    try {
      const res = await fetch("/api/categorias");
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (error) {
      // Erro silencioso para não poluir a interface
    }
  }

  // Buscar transações
  async function fetchTransacoes() {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filtroTipo) params.append("tipo", filtroTipo);
      if (filtroCategoria) params.append("categoriaId", filtroCategoria);
      if (filtroDataInicio) params.append("dataInicio", filtroDataInicio);
      if (filtroDataFim) params.append("dataFim", filtroDataFim);
      if (filtroBusca) params.append("busca", filtroBusca);
      if (filtroValorMin) params.append("valorMin", filtroValorMin);
      if (filtroValorMax) params.append("valorMax", filtroValorMax);

      // Paginação
      params.append("pagina", paginaAtual.toString());
      params.append("limite", itensPorPagina.toString());

      // Ordenação
      params.append("ordenarPor", ordenacao.campo);
      params.append("direcao", ordenacao.direcao);

      const res = await fetch(`/api/transacoes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransacoes(data.transacoes || []);
        setTotalPaginas(data.totalPaginas || 1);
        setTotalTransacoes(data.total || 0);
      } else {
        setMensagem("Erro ao carregar transações");
      }
    } catch (error) {
      setMensagem("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  }

  // Aplicar filtros
  useEffect(() => {
    if (session) {
      setPaginaAtual(1); // Reset para primeira página quando filtros mudam
      fetchTransacoes();
    }
  }, [filtroTipo, filtroCategoria, filtroDataInicio, filtroDataFim, filtroBusca, filtroValorMin, filtroValorMax, ordenacao, session]);

  // Aplicar paginação
  useEffect(() => {
    if (session) {
      fetchTransacoes();
    }
  }, [paginaAtual, session]);

  // Submeter formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");

    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Se a data não foi preenchida, usar a data atual
      const dataTransacao = formData.data || formatDataBrasil(getDataAtualBrasil());
      
      console.log('📅 Debug frontend:', {
        dataOriginal: formData.data,
        dataFinal: dataTransacao,
        dataVazia: !formData.data
      });

      const payload = {
        ...formData,
        data: dataTransacao,
        valor: parseFloat(formData.valor),
        tags: tagsArray,
      };

      const url = editingId ? `/api/transacoes/${editingId}` : "/api/transacoes";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem(editingId ? "Transação atualizada com sucesso!" : "Transação criada com sucesso!");
        resetForm();
        fetchTransacoes();
      } else {
        console.error('❌ Erro ao salvar transação:', data);
        setMensagem(data.error || "Erro ao salvar transação");
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      setMensagem("Erro inesperado ao salvar transação");
    }
  }

  // Editar transação
  async function handleEdit(id: string) {
    try {
      const res = await fetch(`/api/transacoes/${id}`);
      if (res.ok) {
        const transacao = await res.json();
        setFormData({
          valor: transacao.valor.toString(),
          tipo: transacao.tipo,
          categoriaId: transacao.categoria?.id || "",
          data: formatDataBrasil(new Date(transacao.data)),
          descricao: transacao.descricao || "",
          tags: Array.isArray(transacao.tags) ? transacao.tags.join(", ") : "",
          anexos: transacao.anexos || [],
        });
        setEditingId(id);
        setShowForm(true);
      }
    } catch (error) {
      setMensagem("Erro ao carregar transação");
    }
  }

  // Excluir transação
  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
      const res = await fetch(`/api/transacoes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMensagem("Transação excluída com sucesso!");
        fetchTransacoes();
      } else {
        const data = await res.json();
        setMensagem(data.error || "Erro ao excluir transação");
      }
    } catch (error) {
      setMensagem("Erro ao excluir transação");
    }
  }

  // Resetar formulário
  function resetForm() {
    setFormData({
      valor: "",
      tipo: "receita",
      categoriaId: "",
      data: "", // Deixar vazio
      descricao: "",
      tags: "",
      anexos: [],
    });
    setEditingId(null);
    setShowForm(false);
    setMensagem("");
  }

  // Buscar todas as transações para exportação
  async function fetchAllTransacoes() {
    try {
      const params = new URLSearchParams();

      if (filtroTipo) params.append("tipo", filtroTipo);
      if (filtroCategoria) params.append("categoriaId", filtroCategoria);
      if (filtroDataInicio) params.append("dataInicio", filtroDataInicio);
      if (filtroDataFim) params.append("dataFim", filtroDataFim);
      if (filtroBusca) params.append("busca", filtroBusca);
      if (filtroValorMin) params.append("valorMin", filtroValorMin);
      if (filtroValorMax) params.append("valorMax", filtroValorMax);

      // No pagination for export

      // Use a large limit to fetch all
      params.append("pagina", "1");
      params.append("limite", "10000");

      // Ordenação
      params.append("ordenarPor", ordenacao.campo);
      params.append("direcao", ordenacao.direcao);

      const res = await fetch(`/api/transacoes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.transacoes || [];
      } else {
        setMensagem("Erro ao carregar transações para exportação");
        return [];
      }
    } catch (error) {
      setMensagem("Erro ao carregar transações para exportação");
      return [];
    }
  }

  // Exportar para CSV
  async function exportarCSV() {
    const allTransacoes = await fetchAllTransacoes();
    if (allTransacoes.length === 0) {
      setMensagem("Não há transações para exportar");
      return;
    }

    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...allTransacoes.map((t: Transacao) => [
        formatarData(t.data),
        t.tipo === 'receita' ? 'Receita' : 'Despesa',
        t.categoria?.nome || 'Sem categoria',
        `"${t.descricao || ''}"`,
        t.valor.toFixed(2).replace('.', ','),
        `"${(t.tags ?? []).join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMensagem("Transações exportadas com sucesso!");
  }

  // Limpar todos os filtros
  function limparFiltros() {
    setFiltroTipo("");
    setFiltroCategoria("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroBusca("");
    setFiltroValorMin("");
    setFiltroValorMax("");
    setPaginaAtual(1);
    setOrdenacao({ campo: 'data', direcao: 'desc' });
  }

  // Formatação
  function formatarValor(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function formatarData(data: string): string {
    const dataObj = new Date(data);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    
    // Verificar se é hoje
    if (dataObj.toDateString() === hoje.toDateString()) {
      return `Hoje, ${dataObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    // Verificar se é ontem
    if (dataObj.toDateString() === ontem.toDateString()) {
      return `Ontem, ${dataObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    // Para outras datas, mostrar data completa com hora
    return dataObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calcular totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === "receita")
    .reduce((sum, t) => sum + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === "despesa")
    .reduce((sum, t) => sum + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  if (status === "loading") {
    return <CleanLoading text="Carregando transações..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Gerenciar Transações
            </h1>
            <HelpButton 
              title="Como gerenciar suas transações"
              steps={helpContents.transacoes}
              size="md"
              variant="inline"
            />
          </div>
          <p className="text-gray-600">
            Controle suas receitas e despesas de forma inteligente
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarValor(totalReceitas)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatarValor(totalDespesas)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">📉</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatarValor(saldo)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Transações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTransacoes}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-gray-600 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${mensagem.includes("sucesso")
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
            }`}>
            {mensagem}
          </div>
        )}

        {/* Ações e Filtros */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col gap-6">
            {/* Primeira linha - Ações principais */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
              >
                {showForm ? "Cancelar" : "Nova Transação"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    showFilters 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔍 Filtros
                </button>

                <button
                  onClick={exportarCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  disabled={transacoes.length === 0}
                >
                  📊 Exportar CSV
                </button>

                {(filtroTipo || filtroCategoria || filtroDataInicio || filtroDataFim || filtroBusca || filtroValorMin || filtroValorMax) && (
                  <button
                    onClick={limparFiltros}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Segunda linha - Busca */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por descrição
              </label>
              <input
                type="text"
                placeholder="Digite para buscar nas descrições..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium placeholder-gray-600"
              />
            </div>

            {/* Terceira linha - Filtros */}
            {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as "" | "receita" | "despesa")}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  style={{ 
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="" style={{ color: '#6b7280' }}>Todos</option>
                  <option value="receita" style={{ color: '#1f2937', fontWeight: '500' }}>Receitas</option>
                  <option value="despesa" style={{ color: '#1f2937', fontWeight: '500' }}>Despesas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  style={{ 
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="" style={{ color: '#6b7280' }}>Todas</option>
                  {categorias.map((categoria) => (
                    <option 
                      key={categoria.id} 
                      value={categoria.id}
                      style={{ 
                        color: '#1f2937',
                        backgroundColor: '#ffffff',
                        fontWeight: '500'
                      }}
                    >
                      {categoria.icone} {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mín.
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={filtroValorMin}
                  onChange={(e) => setFiltroValorMin(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máx.
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={filtroValorMax}
                  onChange={(e) => setFiltroValorMax(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium placeholder-gray-600"
                />
              </div>
            </div>
            )}

            {/* Quarta linha - Ordenação */}
            {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={ordenacao.campo}
                  onChange={(e) => setOrdenacao({ ...ordenacao, campo: e.target.value as keyof Transacao })}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  style={{ 
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="data" style={{ color: '#1f2937', fontWeight: '500' }}>Data</option>
                  <option value="valor" style={{ color: '#1f2937', fontWeight: '500' }}>Valor</option>
                  <option value="categoria" style={{ color: '#1f2937', fontWeight: '500' }}>Categoria</option>
                  <option value="tipo" style={{ color: '#1f2937', fontWeight: '500' }}>Tipo</option>
                  <option value="criadoEm" style={{ color: '#1f2937', fontWeight: '500' }}>Data de Criação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direção
                </label>
                <select
                  value={ordenacao.direcao}
                  onChange={(e) => setOrdenacao({ ...ordenacao, direcao: e.target.value as 'asc' | 'desc' })}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  style={{ 
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="desc" style={{ color: '#1f2937', fontWeight: '500' }}>Decrescente</option>
                  <option value="asc" style={{ color: '#1f2937', fontWeight: '500' }}>Crescente</option>
                </select>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Formulário de Nova/Editar Transação */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingId ? "Editar Transação" : "Nova Transação"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as "receita" | "despesa";
                    // Verificar se a categoria atual é compatível com o novo tipo
                    const categoriaAtual = categorias.find(cat => cat.id === formData.categoriaId);
                    const categoriaTipoCompativel = categoriaAtual && (categoriaAtual.tipo === novoTipo || categoriaAtual.tipo === 'ambos');
                    
                    setFormData({ 
                      ...formData, 
                      tipo: novoTipo,
                      categoriaId: categoriaTipoCompativel ? formData.categoriaId : ""
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
                  style={{ 
                    color: '#1f2937',
                    backgroundColor: '#ffffff'
                  }}
                  required
                >
                  <option value="receita" style={{ color: '#1f2937', fontWeight: '500' }}>Receita</option>
                  <option value="despesa" style={{ color: '#1f2937', fontWeight: '500' }}>Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <SeletorCategoria
                  categorias={categorias}
                  categoriaSelecionada={formData.categoriaId}
                  onChange={(categoriaId) => setFormData({ ...formData, categoriaId })}
                  tipo={formData.tipo}
                  placeholder="Selecione uma categoria"
                  onCategoriasCriadas={(novasCategorias) => {
                    setCategorias(novasCategorias.map(cat => ({
                      ...cat,
                      cor: cat.cor || '#6366F1',
                      icone: cat.icone || '📊'
                    })));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data (opcional - será usada a data atual se não preenchida)
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Descrição da transação"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium placeholder-gray-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Separe as tags por vírgula (ex: alimentação, restaurante)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium placeholder-gray-600"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                >
                  {editingId ? "Atualizar Transação" : "Criar Transação"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Transações */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Histórico de Transações
              </h2>
              <div className="text-sm text-gray-600">
                {totalTransacoes > 0 ? (
                  <>
                    Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a {Math.min(paginaAtual * itensPorPagina, totalTransacoes)} de {totalTransacoes} transações
                  </>
                ) : (
                  "Nenhuma transação encontrada"
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 relative mr-3">
                <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <span className="text-sm text-gray-500">Carregando transações...</span>
            </div>
          ) : transacoes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                {(filtroTipo || filtroCategoria || filtroDataInicio || filtroDataFim || filtroBusca || filtroValorMin || filtroValorMax)
                  ? "Tente ajustar os filtros para encontrar suas transações."
                  : "Comece criando sua primeira transação financeira."
                }
              </p>
              {!(filtroTipo || filtroCategoria || filtroDataInicio || filtroDataFim || filtroBusca || filtroValorMin || filtroValorMax) && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                >
                  Criar Primeira Transação
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {transacoes.map((transacao) => (
                  <div key={transacao.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          {/* Ícone da categoria com cor */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                            style={{ backgroundColor: transacao.categoria?.cor || "#6B7280" }}
                          >
                            {transacao.categoria?.icone || "📊"}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-2xl font-bold ${transacao.tipo === "receita" ? "text-green-600" : "text-red-600"}`}>
                                {transacao.tipo === "receita" ? "+" : "-"}{formatarValor(transacao.valor)}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {transacao.categoria?.nome || "Sem categoria"}
                              </span>
                            </div>

                            <div className="text-gray-600 mb-2">
                              <p className="font-medium">{transacao.descricao || "Sem descrição"}</p>
                              <p className="text-sm">{formatarData(transacao.data)}</p>
                            </div>

                            {(transacao.tags?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {transacao.tags!.map((tag: any, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                  >
                                    {tag.nome || tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(transacao.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta transação?")) {
                              handleDelete(transacao.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Página {paginaAtual} de {totalPaginas}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaginaAtual(1)}
                        disabled={paginaAtual === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Primeira
                      </button>

                      <button
                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                        disabled={paginaAtual === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>

                      {/* Páginas numeradas */}
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let pageNum;
                        if (totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginaAtual <= 3) {
                          pageNum = i + 1;
                        } else if (paginaAtual >= totalPaginas - 2) {
                          pageNum = totalPaginas - 4 + i;
                        } else {
                          pageNum = paginaAtual - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPaginaAtual(pageNum)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${pageNum === paginaAtual
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-white'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                        disabled={paginaAtual === totalPaginas}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>

                      <button
                        onClick={() => setPaginaAtual(totalPaginas)}
                        disabled={paginaAtual === totalPaginas}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Última
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
