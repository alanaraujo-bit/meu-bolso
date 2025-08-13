"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CleanLoading from "@/components/CleanLoading";
import { useCleanLoading } from "@/hooks/useCleanLoading";
import SeletorCategoria from "@/components/SeletorCategoria";
import TotaisRecorrentes from "@/components/TotaisRecorrentes";
import HelpButton from "@/components/HelpButton";
import { formatDataBrasil } from "@/lib/dateUtils";
import { helpContents } from "@/lib/helpContents";
import { TrendingUp, TrendingDown, Calendar, Clock, DollarSign, Sun, Moon } from "lucide-react";

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
  icone: string;
}

interface TransacaoRecorrente {
  id: string;
  categoriaId: string;
  categoria: Categoria;
  tipo: "receita" | "despesa";
  valor: number;
  descricao: string;
  frequencia: "diario" | "semanal" | "mensal" | "anual";
  dataInicio: string;
  dataFim: string | null;
  isActive: boolean;
  criadoEm: string;
  proximaExecucao: string | null;
  transacoes: any[];
  _count: {
    transacoes: number;
  };
}

interface FormData {
  categoriaId: string;
  tipo: "receita" | "despesa";
  valor: string;
  descricao: string;
  frequencia: "diario" | "semanal" | "mensal" | "anual";
  dataInicio: string;
  dataFim: string;
  isActive: boolean;
}

interface PendentesInfo {
  pendentes: TransacaoRecorrente[];
  totalPendentes: number;
  totalExecucoesPendentes: number;
}

export default function RecorrentesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [recorrentes, setRecorrentes] = useState<TransacaoRecorrente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pendentesInfo, setPendentesInfo] = useState<PendentesInfo | null>(null);
  const { loading, setLoading } = useCleanLoading();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [executandoRecorrentes, setExecutandoRecorrentes] = useState(false);
  const [mostrarTotais, setMostrarTotais] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    categoriaId: "",
    tipo: "despesa",
    valor: "",
    descricao: "",
    frequencia: "mensal",
    dataInicio: "",
    dataFim: "",
    isActive: true,
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
      fetchCategorias();
      fetchRecorrentes();
      fetchPendentes();
    }
  }, [session, filtroStatus, filtroTipo]);

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

  // Funções existentes (manteremos as mesmas do arquivo original)
  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias");
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const fetchRecorrentes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroStatus !== "todos") params.append("status", filtroStatus);
      if (filtroTipo !== "todos") params.append("tipo", filtroTipo);
      
      const res = await fetch(`/api/recorrentes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecorrentes(data);
      } else {
        setMensagem("Erro ao carregar transações recorrentes");
      }
    } catch (error) {
      setMensagem("Erro ao carregar transações recorrentes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendentes = async () => {
    try {
      const res = await fetch("/api/recorrentes/executar");
      if (res.ok) {
        const data = await res.json();
        setPendentesInfo(data);
      }
    } catch (error) {
      console.error("Erro ao carregar pendentes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoriaId || !formData.valor || !formData.dataInicio) {
      setMensagem("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/recorrentes/${editingId}` : "/api/recorrentes";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor),
        }),
      });

      if (res.ok) {
        setMensagem(editingId ? "Transação atualizada!" : "Transação criada!");
        resetForm();
        fetchRecorrentes();
        fetchPendentes();
      } else {
        const data = await res.json();
        setMensagem(data.error || "Erro ao salvar transação");
      }
    } catch (error) {
      setMensagem("Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      categoriaId: "",
      tipo: "despesa",
      valor: "",
      descricao: "",
      frequencia: "mensal",
      dataInicio: "",
      dataFim: "",
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
    setMensagem("");
  };

  const editRecorrente = (recorrente: TransacaoRecorrente) => {
    setFormData({
      categoriaId: recorrente.categoriaId,
      tipo: recorrente.tipo,
      valor: recorrente.valor.toString(),
      descricao: recorrente.descricao || "",
      frequencia: recorrente.frequencia,
      dataInicio: recorrente.dataInicio.split("T")[0],
      dataFim: recorrente.dataFim ? recorrente.dataFim.split("T")[0] : "",
      isActive: recorrente.isActive,
    });
    setEditingId(recorrente.id);
    setShowForm(true);
  };

  const deleteRecorrente = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação recorrente?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/recorrentes/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setMensagem("Transação excluída!");
        fetchRecorrentes();
        fetchPendentes();
      } else {
        setMensagem("Erro ao excluir transação");
      }
    } catch (error) {
      setMensagem("Erro ao excluir transação");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecorrente = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/recorrentes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setMensagem(isActive ? "Transação desativada!" : "Transação ativada!");
        fetchRecorrentes();
        fetchPendentes();
      } else {
        setMensagem("Erro ao alterar status");
      }
    } catch (error) {
      setMensagem("Erro ao alterar status");
    }
  };

  const executarRecorrentes = async () => {
    if (!confirm("Executar todas as transações recorrentes pendentes?")) return;

    try {
      setExecutandoRecorrentes(true);
      const res = await fetch("/api/recorrentes/executar", { method: "POST" });
      
      if (res.ok) {
        const data = await res.json();
        setMensagem(`${data.executadas} transações executadas!`);
        fetchRecorrentes();
        fetchPendentes();
      } else {
        setMensagem("Erro ao executar transações");
      }
    } catch (error) {
      setMensagem("Erro ao executar transações");
    } finally {
      setExecutandoRecorrentes(false);
    }
  };

  // Filtrar recorrentes
  const recorrentesFiltrados = recorrentes.filter(recorrente => {
    const statusMatch = filtroStatus === "todos" || 
                       (filtroStatus === "ativo" && recorrente.isActive) ||
                       (filtroStatus === "inativo" && !recorrente.isActive);
    
    const tipoMatch = filtroTipo === "todos" || recorrente.tipo === filtroTipo;
    
    return statusMatch && tipoMatch;
  });

  if (status === "loading" || loading) {
    return <CleanLoading text="Carregando transações recorrentes..." fullScreen />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    } relative overflow-hidden`}>
      
      {/* Botão Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-3 rounded-full transition-all duration-300 ${
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
              <span className="text-4xl">🔄</span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className={`text-3xl sm:text-4xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Transações Recorrentes
              </h1>
              <p className={`text-base sm:text-lg mt-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Gerencie suas transações automáticas de forma inteligente
              </p>
            </div>
            <HelpButton 
              title="Como gerenciar transações recorrentes"
              steps={helpContents.recorrentes}
              size="lg"
              variant="inline"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={() => setMostrarTotais(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span className="text-lg">📊</span>
            Ver Totais
          </button>
          
          {pendentesInfo && pendentesInfo.totalPendentes > 0 && (
            <button
              onClick={executarRecorrentes}
              disabled={executandoRecorrentes}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${
                executandoRecorrentes
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-gray-200 text-gray-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <span className="text-lg">{executandoRecorrentes ? "⏳" : "⚡"}</span>
              {executandoRecorrentes ? "Executando..." : `Executar Pendentes (${pendentesInfo.totalPendentes})`}
            </button>
          )}
          
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span className="text-lg">➕</span>
            Nova Recorrente
          </button>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
            darkMode 
              ? 'bg-blue-500/20 border-blue-400/30 text-blue-200' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {mensagem}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              🔍 Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:scale-[1.02] ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                  : 'bg-white/80 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            >
              <option value="todos">🔄 Todos</option>
              <option value="ativo">✅ Ativo</option>
              <option value="inativo">⏸️ Inativo</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              🏷️ Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:scale-[1.02] ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                  : 'bg-white/80 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            >
              <option value="todos">🔄 Todos</option>
              <option value="receita">💰 Receita</option>
              <option value="despesa">💸 Despesa</option>
            </select>
          </div>
        </div>

        {/* Lista de Recorrentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recorrentesFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <span className="text-4xl">🔄</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Nenhuma transação recorrente
              </h3>
              <p className={`mb-6 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Crie sua primeira transação recorrente para automatizar suas finanças
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="text-lg mr-2">➕</span>
                Criar Primeira Recorrente
              </button>
            </div>
          ) : (
            recorrentesFiltrados.map((recorrente) => (
              <div key={recorrente.id} className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50' 
                  : 'bg-white/90 backdrop-blur-sm'
              }`}>
                <div className={`h-2 ${recorrente.tipo === 'receita' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: recorrente.categoria.cor }}
                      >
                        {recorrente.categoria.icone}
                      </div>
                      <div>
                        <h3 className={`font-bold transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {recorrente.categoria.nome}
                        </h3>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {recorrente.descricao || "Sem descrição"}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      recorrente.isActive 
                        ? darkMode 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-green-100 text-green-700'
                        : darkMode 
                          ? 'bg-gray-600/20 text-gray-400' 
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {recorrente.isActive ? "✅ Ativo" : "⏸️ Inativo"}
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        💰 Valor:
                      </span>
                      <span className={`font-bold text-lg ${recorrente.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                        {recorrente.tipo === 'receita' ? '+' : '-'} R$ {recorrente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        🔄 Frequência:
                      </span>
                      <span className={`font-semibold capitalize transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {recorrente.frequencia}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        📅 Início:
                      </span>
                      <span className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {new Date(recorrente.dataInicio).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => editRecorrente(recorrente)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        darkMode 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <span className="mr-1">✏️</span>
                      Editar
                    </button>
                    <button
                      onClick={() => deleteRecorrente(recorrente.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border ${
                        darkMode 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <span className="mr-1">🗑️</span>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
                      <span className="text-3xl">🔄</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                        {editingId ? "✏️ Editar" : "✨ Nova"} Recorrente
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {editingId ? "Atualize os dados da transação" : "Configure uma nova transação automática"}
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
                  {/* Categoria */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm"></span>
                      💼 Categoria *
                    </label>
                    <select
                      value={formData.categoriaId}
                      onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                      } focus:ring-4 focus:ring-emerald-500/20`}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.icone} {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm"></span>
                      🏷️ Tipo *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: "receita" })}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all font-semibold ${
                          formData.tipo === "receita" 
                            ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/25 scale-105" 
                            : `border-gray-300 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} hover:border-green-400`
                        }`}
                      >
                        <span>📈</span>
                        <span>Receita</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: "despesa" })}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all font-semibold ${
                          formData.tipo === "despesa" 
                            ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105" 
                            : `border-gray-300 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} hover:border-red-400`
                        }`}
                      >
                        <span>📉</span>
                        <span>Despesa</span>
                      </button>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                      💰 Valor *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-lg">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all text-lg font-semibold ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:ring-4 focus:ring-blue-500/20 placeholder-gray-500`}
                        placeholder="100,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></span>
                      📝 Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:ring-4 focus:ring-blue-500/20 placeholder-gray-500`}
                      placeholder="Ex: Salário, Aluguel, Internet..."
                    />
                  </div>

                  {/* Frequência */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></span>
                      🔄 Frequência *
                    </label>
                    <select
                      value={formData.frequencia}
                      onChange={(e) => setFormData({ ...formData, frequencia: e.target.value as any })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:ring-4 focus:ring-purple-500/20`}
                      required
                    >
                      <option value="diario">📅 Diário</option>
                      <option value="semanal">📆 Semanal</option>
                      <option value="mensal">🗓️ Mensal</option>
                      <option value="anual">📋 Anual</option>
                    </select>
                  </div>

                  {/* Data de Início */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-pink-500 rounded-full shadow-sm"></span>
                      📅 Data de Início *
                    </label>
                    <input
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-pink-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'
                      } focus:ring-4 focus:ring-pink-500/20`}
                      required
                    />
                  </div>

                  {/* Data de Fim */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
                      🛑 Data de Fim (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                      } focus:ring-4 focus:ring-red-500/20`}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></span>
                      ⚡ Status
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <label htmlFor="isActive" className={`font-medium transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-700'
                      }`}>
                        Transação ativa (executar automaticamente)
                      </label>
                    </div>
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
                      {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Totais Recorrentes */}
        {mostrarTotais && (
          <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 ${
            darkMode ? 'bg-black/80' : 'bg-black/60'
          }`}>
            <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <TotaisRecorrentes onClose={() => setMostrarTotais(false)} darkMode={darkMode} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
