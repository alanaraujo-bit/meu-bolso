"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HelpButton from "@/components/HelpButton";
import CleanLoading from "@/components/CleanLoading";
import { useCleanLoading } from "@/hooks/useCleanLoading";
import { helpContents } from "@/lib/helpContents";

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
  const { loading, setLoading } = useCleanLoading();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  
  // Formulário
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    tipo: "receita",
    cor: "#10B981",
    icone: "💰",
  });

  // Verificar autenticação
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // Carregar categorias
  useEffect(() => {
    if (session) {
      fetchCategorias();
    }
  }, [session]);

  // Atualizar ícone padrão quando tipo muda
  useEffect(() => {
    if (!editingId) { // Só atualiza se não estiver editando
      const iconesPorTipo = ICONES_DISPONIVEIS[formData.tipo];
      if (iconesPorTipo && !iconesPorTipo.includes(formData.icone)) {
        setFormData(prev => ({ ...prev, icone: iconesPorTipo[0] }));
      }
    }
  }, [formData.tipo, editingId]);

  async function fetchCategorias() {
    try {
      setLoading(true);
      const res = await fetch("/api/categorias");
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      } else {
        setMensagem("Erro ao carregar categorias");
      }
    } catch (error) {
      setMensagem("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");

    try {
      const url = editingId ? `/api/categorias/${editingId}` : "/api/categorias";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem(editingId ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!");
        resetForm();
        fetchCategorias();
      } else {
        setMensagem(data.error || "Erro ao salvar categoria");
      }
    } catch (error) {
      setMensagem("Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(categoria: Categoria) {
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor || "#10B981",
      icone: categoria.icone || "💰",
    });
    setEditingId(categoria.id);
    setShowForm(true);
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem("Categoria excluída com sucesso!");
        fetchCategorias();
      } else {
        const data = await res.json();
        setMensagem(data.error || "Erro ao excluir categoria");
      }
    } catch (error) {
      setMensagem("Erro ao excluir categoria");
    }
  }

  function resetForm() {
    setFormData({
      nome: "",
      tipo: "receita",
      cor: "#10B981",
      icone: "💰",
    });
    setEditingId(null);
    setShowForm(false);
  }

  if (status === "loading") {
    return <CleanLoading text="Carregando categorias..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">
                📊 Categorias
              </h1>
              <HelpButton 
                title="Como organizar suas categorias"
                steps={helpContents.categorias}
                size="md"
                variant="inline"
              />
            </div>
            <p className="text-gray-600">
              Organize suas receitas e despesas em categorias personalizadas
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              onClick={() => router.push("/transacoes")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg"
            >
              💰 Gerenciar Transações
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
            >
              Voltar ao Início
            </button>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            mensagem.includes("sucesso") 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {mensagem}
          </div>
        )}

        {/* Botão Nova Categoria */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
          >
            {showForm ? "Cancelar" : "Nova Categoria"}
          </button>
        </div>

        {/* Formulário de Nova/Editar Categoria */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alimentação, Salário..."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as "receita" | "despesa" | "ambos" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
              </div>

              {/* Seletor de Cor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {CORES_DISPONIVEIS.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.cor === cor ? "border-gray-800 scale-110" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.cor }}
                  />
                  <span className="text-sm text-gray-600">Cor selecionada: {formData.cor}</span>
                </div>
              </div>

              {/* Seletor de Ícone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONES_DISPONIVEIS[formData.tipo].map((icone) => (
                    <button
                      key={icone}
                      type="button"
                      onClick={() => setFormData({ ...formData, icone })}
                      className={`w-12 h-12 rounded-xl border-2 text-2xl transition-all hover:scale-105 ${
                        formData.icone === icone 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {icone}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl">{formData.icone}</span>
                  <span className="text-sm text-gray-600">Ícone selecionado</span>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg"
                    style={{ backgroundColor: formData.cor }}
                  >
                    {formData.icone}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {formData.nome || "Nome da categoria"}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formData.tipo === "receita" 
                        ? "bg-green-100 text-green-800" 
                        : formData.tipo === "despesa"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {formData.tipo === "receita" ? "Receita" : 
                       formData.tipo === "despesa" ? "Despesa" : "Ambos"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                >
                  {editingId ? "Atualizar Categoria" : "Criar Categoria"}
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

        {/* Lista de Categorias */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Suas Categorias
            </h2>
          </div>

          {loading ? (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 relative mr-3">
                  <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <span className="text-sm text-gray-500">Carregando categorias...</span>
              </div>
            </div>
          ) : categorias.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Crie sua primeira categoria para começar a organizar suas finanças!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
              >
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white shadow-lg"
                        style={{ backgroundColor: categoria.cor || "#6B7280" }}
                      >
                        {categoria.icone || "📊"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {categoria.nome}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          categoria.tipo === "receita" 
                            ? "bg-green-100 text-green-800" 
                            : categoria.tipo === "despesa"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {categoria.tipo === "receita" ? "Receita" : 
                           categoria.tipo === "despesa" ? "Despesa" : "Ambos"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(categoria)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(categoria.id, categoria.nome)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Criada em: {new Date(categoria.criadoEm).toLocaleDateString("pt-BR")}</p>
                    {categoria._count && (
                      <p>Transações: {categoria._count.transacoes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action para Transações */}
        {categorias.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-semibold mb-4">
              Pronto para começar? 🚀
            </h3>
            <p className="text-blue-100 mb-6">
              Agora que você tem categorias organizadas, comece a registrar suas transações!
            </p>
            <button
              onClick={() => router.push("/transacoes")}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium text-lg shadow-lg"
            >
              💰 Gerenciar Transações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
