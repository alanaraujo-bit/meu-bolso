"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Palette, Plus, Edit, Trash2, Tag, Sun, Moon } from "lucide-react";
import HelpButton from "@/components/HelpButton";

interface Categoria {
  id: string;
  nome: string;
  tipo: "receita" | "despesa" | "ambos";
  cor?: string;
  icone?: string;
  criadoEm: string;
  _count?: {
    transacoes: number;
  };
}

interface FormData {
  nome: string;
  tipo: "receita" | "despesa" | "ambos";
  cor: string;
  icone: string;
}

// Ícones disponíveis por categoria
const ICONES_DISPONIVEIS = {
  receita: ["💰", "💸", "📈", "💻", "🛒", "🏆", "💎", "🎯", "📊", "💵"],
  despesa: ["🍽️", "🚗", "🏠", "🏥", "📚", "🎮", "🛍️", "🔧", "💳", "⚡"],
  ambos: ["🔄", "🚨", "📱", "🎭", "🌟", "🔑", "📋", "🎪", "🎨", "🎵"],
};

// Cores disponíveis
const CORES_DISPONIVEIS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", 
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  "#14B8A6", "#F43F5E", "#A855F7", "#0EA5E9", "#22C55E",
  "#DC2626", "#D97706", "#059669", "#2563EB", "#7C3AED"
];

export default function CategoriasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error' | 'info'>('info');
  const [filtroTipo, setFiltroTipo] = useState<string>("todas");

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    tipo: "despesa",
    cor: "#10B981",
    icone: "🏷️"
  });

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

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchCategorias();
  }, [session, status, router]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categorias");
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      } else {
        setMensagem("Erro ao carregar categorias");
        setTipoMensagem("error");
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      setMensagem("Erro ao carregar categorias");
      setTipoMensagem("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setMensagem("Por favor, informe o nome da categoria");
      setTipoMensagem("error");
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/categorias/${editingId}` : "/api/categorias";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensagem(editingId ? "Categoria atualizada!" : "Categoria criada!");
        setTipoMensagem("success");
        resetForm();
        fetchCategorias();
      } else {
        const data = await response.json();
        setMensagem(data.error || "Erro ao salvar categoria");
        setTipoMensagem("error");
      }
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      setMensagem("Erro ao salvar categoria");
      setTipoMensagem("error");
    } finally {
      setLoading(false);
    }
  };

  const editCategoria = (categoria: Categoria) => {
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor || "#10B981",
      icone: categoria.icone || "🏷️"
    });
    setEditingId(categoria.id);
    setShowForm(true);
  };

  const deleteCategoria = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMensagem("Categoria excluída!");
        setTipoMensagem("success");
        fetchCategorias();
      } else {
        const data = await response.json();
        setMensagem(data.error || "Erro ao excluir categoria");
        setTipoMensagem("error");
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      setMensagem("Erro ao excluir categoria");
      setTipoMensagem("error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "despesa",
      cor: "#10B981",
      icone: "🏷️"
    });
    setEditingId(null);
    setShowForm(false);
    setMensagem("");
  };

  const categoriasFiltradas = categorias.filter(categoria => {
    if (filtroTipo === "todas") return true;
    return categoria.tipo === filtroTipo;
  });

  const estatisticas = {
    total: categorias.length,
    receitas: categorias.filter(c => c.tipo === "receita").length,
    despesas: categorias.filter(c => c.tipo === "despesa").length,
    ambos: categorias.filter(c => c.tipo === "ambos").length
  };

  if (loading && categorias.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
          : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Carregando categorias...</p>
        </div>
      </div>
    );
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
        <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
      </button>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <HelpButton 
          title="Categorias"
          steps={[
            {
              title: "🏷️ Categorias",
              content: "Organize suas transações criando categorias personalizadas para receitas e despesas."
            },
            {
              title: "🎨 Como usar",
              content: "• Crie categorias com cores e ícones\n• Organize por tipo (receita/despesa)\n• Edite e personalize conforme necessário\n• Acompanhe o uso de cada categoria"
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
                  <span className="text-3xl">🏷️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    🎨 Categorias
                  </h1>
                  <p className="text-white/90 text-lg font-medium">
                    Organize suas finanças com categorias personalizadas
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
                  <div className="text-2xl font-bold text-white">{estatisticas.receitas}</div>
                  <div className="text-white/90 text-sm font-medium">Receitas</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-white">{estatisticas.despesas}</div>
                  <div className="text-white/90 text-sm font-medium">Despesas</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold text-white">{estatisticas.ambos}</div>
                  <div className="text-white/90 text-sm font-medium">Ambos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span className="text-lg">🏷️</span>
            Nova Categoria
          </button>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
            tipoMensagem === 'error'
              ? darkMode
                ? 'bg-red-900/20 border-red-500/30 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
              : tipoMensagem === 'success'
                ? darkMode
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
                : darkMode
                  ? 'bg-blue-900/20 border-blue-500/30 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
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
              Filtrar por tipo:
            </span>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'todas', label: 'Todas', icon: '📋' },
                { value: 'receita', label: 'Receitas', icon: '📈' },
                { value: 'despesa', label: 'Despesas', icon: '📉' },
                { value: 'ambos', label: 'Ambos', icon: '🔄' }
              ].map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroTipo(filtro.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                    filtroTipo === filtro.value
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

        {/* Lista de Categorias */}
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
              Suas Categorias ({categoriasFiltradas.length})
            </h2>

            {categoriasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-4">🏷️</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Nenhuma categoria encontrada
                </h3>
                <p className={`text-base mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filtroTipo === 'todas' 
                    ? 'Crie sua primeira categoria!'
                    : `Nenhuma categoria do tipo "${filtroTipo}" encontrada.`
                  }
                </p>
                {filtroTipo === 'todas' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <span className="mr-2">🏷️</span>
                    Criar Nova Categoria
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoriasFiltradas.map((categoria) => (
                  <div
                    key={categoria.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                      darkMode 
                        ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50' 
                        : 'bg-white/60 border-white/60 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: categoria.cor + '20', border: `2px solid ${categoria.cor}` }}
                      >
                        {categoria.icone}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {categoria.nome}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`px-2 py-1 rounded-lg text-xs font-medium`}
                            style={{ 
                              backgroundColor: categoria.cor + '20', 
                              color: categoria.cor,
                              border: `1px solid ${categoria.cor}40`
                            }}
                          >
                            {categoria.tipo === 'receita' ? '📈 Receita' : 
                             categoria.tipo === 'despesa' ? '📉 Despesa' : '🔄 Ambos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {categoria._count && (
                      <div className={`text-sm mb-3 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        💳 {categoria._count.transacoes} transações
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => editCategoria(categoria)}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                          darkMode 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <span className="mr-1">✏️</span>
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCategoria(categoria.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border ${
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
                ))}
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
                      <span className="text-3xl">🏷️</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                        {editingId ? "✏️ Editar" : "✨ Nova"} Categoria
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {editingId ? "Atualize os dados da categoria" : "Crie uma nova categoria personalizada"}
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
                  {/* Nome */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-emerald-600 rounded-full shadow-sm"></span>
                      🏷️ Nome da Categoria *
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
                      placeholder="Ex: Alimentação, Transporte, Salário..."
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                      🎯 Tipo *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'receita', label: 'Receita', icon: '📈', color: 'green' },
                        { value: 'despesa', label: 'Despesa', icon: '📉', color: 'red' },
                        { value: 'ambos', label: 'Ambos', icon: '🔄', color: 'purple' }
                      ].map((tipo) => (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, tipo: tipo.value as any })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-semibold ${
                            formData.tipo === tipo.value 
                              ? `border-${tipo.color}-500 bg-${tipo.color}-500 text-white shadow-lg shadow-${tipo.color}-500/25 scale-105` 
                              : `border-gray-300 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'} hover:border-${tipo.color}-400`
                          }`}
                        >
                          <span className="text-2xl">{tipo.icon}</span>
                          <span className="text-sm">{tipo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ícone */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-purple-600 rounded-full shadow-sm"></span>
                      😀 Ícone
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {ICONES_DISPONIVEIS[formData.tipo].map((icone) => (
                        <button
                          key={icone}
                          type="button"
                          onClick={() => setFormData({ ...formData, icone })}
                          className={`p-3 rounded-xl border-2 transition-all text-2xl hover:scale-110 ${
                            formData.icone === icone 
                              ? 'border-purple-500 bg-purple-500/20 shadow-lg' 
                              : `border-gray-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`
                          }`}
                        >
                          {icone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cor */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-pink-600 rounded-full shadow-sm"></span>
                      🎨 Cor
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {CORES_DISPONIVEIS.map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          onClick={() => setFormData({ ...formData, cor })}
                          className={`w-12 h-12 rounded-xl border-4 transition-all hover:scale-110 ${
                            formData.cor === cor 
                              ? 'border-gray-800 shadow-lg scale-110' 
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: cor }}
                        ></button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-orange-600 rounded-full shadow-sm"></span>
                      👁️ Preview
                    </label>
                    <div className={`p-4 rounded-xl border ${
                      darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: formData.cor + '20', border: `2px solid ${formData.cor}` }}
                        >
                          {formData.icone}
                        </div>
                        <div>
                          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formData.nome || 'Nome da categoria'}
                          </div>
                          <span 
                            className="px-2 py-1 rounded-lg text-xs font-medium"
                            style={{ 
                              backgroundColor: formData.cor + '20', 
                              color: formData.cor,
                              border: `1px solid ${formData.cor}40`
                            }}
                          >
                            {formData.tipo === 'receita' ? '📈 Receita' : 
                             formData.tipo === 'despesa' ? '📉 Despesa' : '🔄 Ambos'}
                          </span>
                        </div>
                      </div>
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
                      {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Categoria"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
