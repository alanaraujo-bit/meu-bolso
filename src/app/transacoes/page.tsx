"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [darkMode, setDarkMode] = useState(false);

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
      console.log('🗑️ Frontend - Iniciando exclusão da transação:', id);
      
      const res = await fetch(`/api/transacoes/${id}`, {
        method: "DELETE",
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      console.log('🗑️ Frontend - Resposta da API:', { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok 
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Frontend - Transação excluída com sucesso:', data);
        setMensagem("Transação excluída com sucesso!");
        
        // Forçar atualização da lista
        await fetchTransacoes();
      } else {
        const data = await res.json();
        console.error('❌ Frontend - Erro na exclusão:', data);
        setMensagem(data.error || "Erro ao excluir transação");
      }
    } catch (error) {
      console.error('❌ Frontend - Erro de conexão:', error);
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
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    } relative overflow-hidden`}>
      
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
        {darkMode ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* Background decorativo */}
      <div className="absolute inset-0">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl shadow-lg ring-4 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800/90 ring-emerald-500/20 backdrop-blur-sm' 
                : 'bg-white/90 ring-emerald-100 backdrop-blur-sm'
            }`}>
              <span className="text-4xl">💰</span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className={`text-3xl sm:text-4xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Gerenciar Transações
              </h1>
              <p className={`text-base sm:text-lg mt-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Controle suas receitas e despesas de forma inteligente
              </p>
            </div>
            <HelpButton 
              title="Como gerenciar suas transações"
              steps={helpContents.transacoes}
              size="lg"
              variant="inline"
            />
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Card Total de Receitas */}
          <div className={`rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm border-white/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Total de Receitas
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-500">
                  {formatarValor(totalReceitas)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}>
                <span className="text-emerald-500 text-xl">📈</span>
              </div>
            </div>
          </div>

          {/* Card Total de Despesas */}
          <div className={`rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm border-white/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Total de Despesas
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-500">
                  {formatarValor(totalDespesas)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <span className="text-red-500 text-xl">📉</span>
              </div>
            </div>
          </div>

          {/* Card Saldo */}
          <div className={`rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm border-white/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Saldo
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  saldo >= 0 ? 'text-teal-500' : 'text-red-500'
                }`}>
                  {formatarValor(saldo)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                saldo >= 0 
                  ? darkMode ? 'bg-teal-500/20' : 'bg-teal-100'
                  : darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <span className={`text-xl ${saldo >= 0 ? 'text-teal-500' : 'text-red-500'}`}>
                  {saldo >= 0 ? '💰' : '⚠️'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Total de Transações */}
          <div className={`rounded-2xl p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm border-white/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Total de Transações
                </p>
                <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalTransacoes}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                darkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'
              }`}>
                <span className="text-cyan-500 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 transition-all duration-300 animate-fade-in ${
            mensagem.includes("sucesso")
              ? darkMode
                ? 'bg-emerald-900/30 border-emerald-400 text-emerald-300 backdrop-blur-sm'
                : 'bg-emerald-50 border-emerald-400 text-emerald-700'
              : darkMode
                ? 'bg-red-900/30 border-red-400 text-red-300 backdrop-blur-sm'
                : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {mensagem.includes("sucesso") ? '✅' : '❌'}
              </span>
              <span className="text-sm font-medium">{mensagem}</span>
            </div>
          </div>
        )}

        {/* Ações e Filtros */}
        <div className={`rounded-2xl shadow-xl border p-6 mb-8 transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-sm border-white/20'
        }`}>
          <div className="flex flex-col gap-6">
            {/* Primeira linha - Ações principais */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-105 ${
                  darkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                }`}
              >
                {showForm ? "❌ Cancelar" : "➕ Nova Transação"}
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    showFilters 
                      ? darkMode
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                  }`}
                >
                  🔍 Filtros
                </button>

                <button
                  onClick={exportarCSV}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    transacoes.length === 0
                      ? darkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : darkMode
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/25'
                        : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg'
                  }`}
                  disabled={transacoes.length === 0}
                >
                  📊 Exportar CSV
                </button>

                {(filtroTipo || filtroCategoria || filtroDataInicio || filtroDataFim || filtroBusca || filtroValorMin || filtroValorMax) && (
                  <button
                    onClick={limparFiltros}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 border ${
                      darkMode 
                        ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    🗑️ Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Segunda linha - Busca */}
            <div className="w-full">
              <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                🔎 Buscar por descrição
              </label>
              <input
                type="text"
                placeholder="Digite para buscar nas descrições..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium placeholder-gray-500 ${
                  darkMode 
                    ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                    : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                }`}
              />
            </div>

            {/* Terceira linha - Filtros */}
            {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Filtro Tipo */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  📂 Tipo
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as "" | "receita" | "despesa")}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  <option value="">Todos</option>
                  <option value="receita">📈 Receitas</option>
                  <option value="despesa">📉 Despesas</option>
                </select>
              </div>

              {/* Filtro Categoria */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  🏷️ Categoria
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.icone} {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Início */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  📅 Data Início
                </label>
                <input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  📅 Data Fim
                </label>
                <input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Valor Mínimo */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  💰 Valor Mín.
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={filtroValorMin}
                  onChange={(e) => setFiltroValorMin(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium placeholder-gray-500 ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Valor Máximo */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  💰 Valor Máx.
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={filtroValorMax}
                  onChange={(e) => setFiltroValorMax(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium placeholder-gray-500 ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>
            </div>
            )}

            {/* Quarta linha - Ordenação */}
            {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              {/* Ordenar por */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  🔢 Ordenar por
                </label>
                <select
                  value={ordenacao.campo}
                  onChange={(e) => setOrdenacao({ ...ordenacao, campo: e.target.value as keyof Transacao })}
                  className={`px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  <option value="data">📅 Data</option>
                  <option value="valor">💰 Valor</option>
                  <option value="categoria">🏷️ Categoria</option>
                  <option value="tipo">📂 Tipo</option>
                  <option value="criadoEm">🕐 Data de Criação</option>
                </select>
              </div>

              {/* Direção */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  ↕️ Direção
                </label>
                <select
                  value={ordenacao.direcao}
                  onChange={(e) => setOrdenacao({ ...ordenacao, direcao: e.target.value as 'asc' | 'desc' })}
                  className={`px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  <option value="desc">⬇️ Decrescente</option>
                  <option value="asc">⬆️ Crescente</option>
                </select>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Formulário de Nova/Editar Transação */}
        {showForm && (
          <div className={`rounded-2xl shadow-xl border p-6 mb-8 transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm border-white/20'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}>
                <span className="text-2xl">
                  {editingId ? '✏️' : '➕'}
                </span>
              </div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingId ? "Editar Transação" : "Nova Transação"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Valor */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  💰 Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium placeholder-gray-500 ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                  required
                />
              </div>

              {/* Campo Tipo */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  📂 Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => {
                    const novoTipo = e.target.value as "receita" | "despesa";
                    const categoriaAtual = categorias.find(cat => cat.id === formData.categoriaId);
                    const categoriaTipoCompativel = categoriaAtual && (categoriaAtual.tipo === novoTipo || categoriaAtual.tipo === 'ambos');
                    
                    setFormData({ 
                      ...formData, 
                      tipo: novoTipo,
                      categoriaId: categoriaTipoCompativel ? formData.categoriaId : ""
                    });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                  required
                >
                  <option value="receita">📈 Receita</option>
                  <option value="despesa">📉 Despesa</option>
                </select>
              </div>

              {/* Campo Categoria */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  🏷️ Categoria *
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

              {/* Campo Data */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  📅 Data (opcional - será usada a data atual se não preenchida)
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Campo Descrição */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  📝 Descrição
                </label>
                <input
                  type="text"
                  placeholder="Descrição da transação"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium placeholder-gray-500 ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Campo Tags */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  🏷️ Tags
                </label>
                <input
                  type="text"
                  placeholder="Separe as tags por vírgula (ex: alimentação, restaurante)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium placeholder-gray-500 ${
                    darkMode 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
                      : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                />
              </div>

              {/* Botões de Ação */}
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                  }`}
                >
                  {editingId ? "✅ Atualizar Transação" : "💾 Criar Transação"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 border ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300'
                  }`}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Transações */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-sm border-white/20'
        }`}>
          <div className={`p-6 border-b transition-colors duration-300 ${
            darkMode ? 'border-gray-700/50' : 'border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  <span className="text-xl">📊</span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Histórico de Transações
                </h2>
              </div>
              <div className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-300 ${
                darkMode ? 'text-gray-300 bg-gray-700/50' : 'text-gray-600 bg-gray-100'
              }`}>
                {totalTransacoes > 0 ? (
                  <>
                    📄 Mostrando {((paginaAtual - 1) * itensPorPagina) + 1} a {Math.min(paginaAtual * itensPorPagina, totalTransacoes)} de {totalTransacoes} transações
                  </>
                ) : (
                  "Nenhuma transação encontrada"
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 relative">
                  <div className={`absolute inset-0 border-2 rounded-full ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}></div>
                  <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  🔄 Carregando transações...
                </span>
              </div>
            </div>
          ) : transacoes.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}>
                  <span className="text-4xl">📊</span>
                </div>
                <div className="space-y-2">
                  <h3 className={`text-xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Nenhuma transação encontrada
                  </h3>
                  <p className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {(filtroTipo || filtroCategoria || filtroDataInicio || filtroDataFim || filtroBusca || filtroValorMin || filtroValorMax)
                      ? "Tente ajustar os filtros para encontrar suas transações."
                      : "Comece criando sua primeira transação financeira."
                    }
                  </p>
                </div>
                {!(filtroTipo || filtroCategoria || filtroDataInicio || filtroDataFim || filtroBusca || filtroValorMin || filtroValorMax) && (
                  <button
                    onClick={() => setShowForm(true)}
                    className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-105 ${
                      darkMode
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                    }`}
                  >
                    ➕ Criar Primeira Transação
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={`divide-y transition-colors duration-300 ${
                darkMode ? 'divide-gray-700/50' : 'divide-gray-200'
              }`}>
                {transacoes.map((transacao) => (
                  <div key={transacao.id} className={`p-6 transition-all duration-200 hover:scale-[1.01] ${
                    darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          {/* Ícone da categoria com cor */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg transition-transform duration-200 hover:scale-110"
                            style={{ backgroundColor: transacao.categoria?.cor || "#6B7280" }}
                          >
                            {transacao.categoria?.icone || "📊"}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <span className={`text-xl sm:text-2xl font-bold ${
                                transacao.tipo === "receita" ? "text-emerald-500" : "text-red-500"
                              }`}>
                                {transacao.tipo === "receita" ? "+" : "-"}{formatarValor(transacao.valor)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                                darkMode 
                                  ? 'bg-gray-700/50 text-gray-300' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                🏷️ {transacao.categoria?.nome || "Sem categoria"}
                              </span>
                            </div>

                            <div className={`mb-3 transition-colors duration-300 ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <p className="font-medium text-base mb-1">
                                📝 {transacao.descricao || "Sem descrição"}
                              </p>
                              <p className="text-sm flex items-center gap-1">
                                📅 {formatarData(transacao.data)}
                              </p>
                            </div>

                            {(transacao.tags?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {transacao.tags!.map((tag: any, index: number) => (
                                  <span
                                    key={index}
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-300 ${
                                      darkMode 
                                        ? 'bg-teal-900/30 text-teal-300' 
                                        : 'bg-teal-100 text-teal-700'
                                    }`}
                                  >
                                    #{tag.nome || tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Botões de Ação */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(transacao.id)}
                          className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                            darkMode 
                              ? 'text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30' 
                              : 'text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title="Editar transação"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir esta transação?")) {
                              handleDelete(transacao.id);
                            }
                          }}
                          className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                            darkMode 
                              ? 'text-red-400 hover:bg-red-500/20 border border-red-500/30' 
                              : 'text-red-600 hover:bg-red-100 border border-red-200'
                          }`}
                          title="Excluir transação"
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
                <div className={`p-6 border-t transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-700/50 bg-gray-800/50' 
                    : 'border-gray-200 bg-gray-50/50'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      📄 Página {paginaAtual} de {totalPaginas}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setPaginaAtual(1)}
                        disabled={paginaAtual === 1}
                        className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                          darkMode 
                            ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:hover:bg-transparent' 
                            : 'border border-gray-300 text-gray-700 hover:bg-white disabled:hover:bg-transparent'
                        }`}
                      >
                        ⏮️ Primeira
                      </button>

                      <button
                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                        disabled={paginaAtual === 1}
                        className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                          darkMode 
                            ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:hover:bg-transparent' 
                            : 'border border-gray-300 text-gray-700 hover:bg-white disabled:hover:bg-transparent'
                        }`}
                      >
                        ⬅️ Anterior
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
                            className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                              pageNum === paginaAtual
                                ? darkMode
                                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-lg shadow-emerald-500/25'
                                  : 'bg-emerald-600 text-white border border-emerald-500 shadow-lg'
                                : darkMode
                                  ? 'border border-gray-600 text-gray-300 hover:bg-gray-700'
                                  : 'border border-gray-300 text-gray-700 hover:bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                        disabled={paginaAtual === totalPaginas}
                        className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                          darkMode 
                            ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:hover:bg-transparent' 
                            : 'border border-gray-300 text-gray-700 hover:bg-white disabled:hover:bg-transparent'
                        }`}
                      >
                        Próxima ➡️
                      </button>

                      <button
                        onClick={() => setPaginaAtual(totalPaginas)}
                        disabled={paginaAtual === totalPaginas}
                        className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                          darkMode 
                            ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:hover:bg-transparent' 
                            : 'border border-gray-300 text-gray-700 hover:bg-white disabled:hover:bg-transparent'
                        }`}
                      >
                        ⏭️ Última
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
