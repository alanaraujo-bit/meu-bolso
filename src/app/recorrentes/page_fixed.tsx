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
    // [Implementação da função original]
  };

  const fetchRecorrentes = async () => {
    // [Implementação da função original]
  };

  const fetchPendentes = async () => {
    // [Implementação da função original]
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

        {/* Modal de Totais Recorrentes */}
        {mostrarTotais && (
          <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 ${
            darkMode ? 'bg-black/80' : 'bg-black/60'
          }`}>
            <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <TotaisRecorrentes onClose={() => setMostrarTotais(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
