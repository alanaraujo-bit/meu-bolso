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
import { TrendingUp, TrendingDown, Calendar, Clock, DollarSign } from "lucide-react";

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

  // Carregar dados
  useEffect(() => {
    if (session) {
      fetchCategorias();
      fetchRecorrentes();
      fetchPendentes();
    }
  }, [session, filtroStatus, filtroTipo]);

  async function fetchCategorias() {
    try {
      const res = await fetch("/api/categorias");
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  async function fetchRecorrentes() {
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
  }

  async function fetchPendentes() {
    try {
      const res = await fetch("/api/recorrentes/executar");
      if (res.ok) {
        const data = await res.json();
        setPendentesInfo(data);
      }
    } catch (error) {
      console.error("Erro ao carregar pendentes:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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
  }

  function resetForm() {
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
  }

  function editRecorrente(recorrente: TransacaoRecorrente) {
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
  }

  async function deleteRecorrente(id: string) {
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
  }

  async function toggleRecorrente(id: string, isActive: boolean) {
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
  }

  async function executarRecorrentes() {
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
  }

  const recorrentesFiltrados = recorrentes.filter((recorrente) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">
                Transações Recorrentes
              </h1>
              <HelpButton content={helpContents.recorrentes} />
            </div>
            <p className="text-gray-600">
              Gerencie suas transações automáticas
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => setMostrarTotais(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              📊 Ver Totais
            </button>
            
            {pendentesInfo && pendentesInfo.totalPendentes > 0 && (
              <button
                onClick={executarRecorrentes}
                disabled={executandoRecorrentes}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-lg disabled:opacity-50"
              >
                {executandoRecorrentes ? "⏳ Executando..." : `⚡ Executar Pendentes (${pendentesInfo.totalPendentes})`}
              </button>
            )}
            
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-medium shadow-lg"
            >
              ➕ Nova Recorrente
            </button>
          </div>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
            {mensagem}
          </div>
        )}

        {/* Informações dos Pendentes */}
        {pendentesInfo && pendentesInfo.totalPendentes > 0 && (
          <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-orange-900">
                  Transações Pendentes
                </h3>
                <p className="text-orange-700 text-sm">
                  Existem {pendentesInfo.totalPendentes} transações com {pendentesInfo.totalExecucoesPendentes} execuções pendentes
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {pendentesInfo.pendentes.slice(0, 3).map((pendente) => (
                <div key={pendente.id} className="bg-white/70 p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${pendente.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium text-sm">{pendente.categoria.nome}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{pendente.descricao}</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {pendente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            
            {pendentesInfo.pendentes.length > 3 && (
              <p className="text-sm text-orange-600">
                E mais {pendentesInfo.pendentes.length - 3} transações...
              </p>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="todos">Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
        </div>

        {/* Lista de Recorrentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recorrentesFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma transação recorrente
              </h3>
              <p className="text-gray-600 mb-6">
                Crie sua primeira transação recorrente para automatizar suas finanças
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-medium shadow-lg"
              >
                ➕ Criar Primeira Recorrente
              </button>
            </div>
          ) : (
            recorrentesFiltrados.map((recorrente) => (
              <div key={recorrente.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
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
                        <h3 className="font-bold text-gray-900">
                          {recorrente.categoria.nome}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {recorrente.descricao || "Sem descrição"}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${recorrente.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {recorrente.isActive ? "Ativo" : "Inativo"}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor:</span>
                      <span className={`font-bold text-lg ${recorrente.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {recorrente.tipo === 'receita' ? '+' : '-'} R$ {recorrente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Frequência:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {recorrente.frequencia}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Início:</span>
                      <span className="font-medium text-gray-900">
                        {formatDataBrasil(recorrente.dataInicio)}
                      </span>
                    </div>
                    
                    {recorrente.dataFim && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fim:</span>
                        <span className="font-medium text-gray-900">
                          {formatDataBrasil(recorrente.dataFim)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Execuções:</span>
                      <span className="font-medium text-gray-900">
                        {recorrente._count.transacoes}
                      </span>
                    </div>

                    {recorrente.proximaExecucao && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Próxima:</span>
                        <span className="font-medium text-blue-600">
                          {formatDataBrasil(recorrente.proximaExecucao)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editRecorrente(recorrente)}
                      className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => toggleRecorrente(recorrente.id, recorrente.isActive)}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                        recorrente.isActive 
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {recorrente.isActive ? '⏸️ Pausar' : '▶️ Ativar'}
                    </button>
                    <button
                      onClick={() => deleteRecorrente(recorrente.id)}
                      className="flex-1 bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal do Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden transform transition-all">
              {/* Header com gradiente */}
              <div className="bg-gradient-to-r from-primary via-primary/90 to-accent p-6 relative overflow-hidden">
                {/* Decoração de fundo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {editingId ? "Editar" : "Nova"} Recorrente
                      </h2>
                      <p className="text-white/80 text-sm">
                        {editingId ? "Atualize os dados" : "Configure uma nova transação automática"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo do formulário */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Categoria */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Categoria *
                    </label>
                    <div className="relative">
                      <SeletorCategoria
                        categorias={categorias}
                        categoriaSelecionada={formData.categoriaId}
                        onChange={(categoriaId) => setFormData({ ...formData, categoriaId })}
                        tipo={formData.tipo}
                        placeholder="Selecione uma categoria"
                        onCategoriasCriadas={(novasCategorias) => {
                          setCategorias(novasCategorias.map(cat => ({
                            ...cat,
                            cor: cat.cor || '#199C90',
                            icone: cat.icone || '📊'
                          })));
                        }}
                      />
                    </div>
                  </div>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Tipo *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const novoTipo = "receita";
                          const categoriaAtual = categorias.find(cat => cat.id === formData.categoriaId);
                          const categoriaTipoCompativel = categoriaAtual && (categoriaAtual.tipo === novoTipo || categoriaAtual.tipo === 'ambos');
                          
                          setFormData({ 
                            ...formData, 
                            tipo: novoTipo,
                            categoriaId: categoriaTipoCompativel ? formData.categoriaId : ""
                          });
                        }}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          formData.tipo === "receita" 
                            ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-primary/30"
                        }`}
                      >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Receita</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const novoTipo = "despesa";
                          const categoriaAtual = categorias.find(cat => cat.id === formData.categoriaId);
                          const categoriaTipoCompativel = categoriaAtual && (categoriaAtual.tipo === novoTipo || categoriaAtual.tipo === 'ambos');
                          
                          setFormData({ 
                            ...formData, 
                            tipo: novoTipo,
                            categoriaId: categoriaTipoCompativel ? formData.categoriaId : ""
                          });
                        }}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          formData.tipo === "despesa" 
                            ? "border-secondary bg-secondary/10 text-secondary shadow-lg shadow-secondary/20" 
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-secondary/30"
                        }`}
                      >
                        <TrendingDown className="w-5 h-5" />
                        <span className="font-medium">Despesa</span>
                      </button>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Valor *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        R$
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 hover:bg-white text-lg font-medium"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 hover:bg-white"
                      placeholder="Descrição da transação"
                    />
                  </div>

                  {/* Frequência */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span className="w-2 h-2 bg-info rounded-full"></span>
                      Frequência *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "diario", label: "Diário", icon: "📅" },
                        { value: "semanal", label: "Semanal", icon: "📆" },
                        { value: "mensal", label: "Mensal", icon: "🗓️" },
                        { value: "anual", label: "Anual", icon: "📋" }
                      ].map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, frequencia: freq.value as any })}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            formData.frequencia === freq.value
                              ? "border-info bg-info/10 text-info shadow-md shadow-info/20"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-info/30"
                          }`}
                        >
                          <span>{freq.icon}</span>
                          <span className="text-sm font-medium">{freq.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Data de Início *
                      </label>
                      <input
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 hover:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        Data de Fim (opcional)
                      </label>
                      <input
                        type="date"
                        value={formData.dataFim}
                        onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 hover:bg-white"
                      />
                    </div>
                  </div>

                  {/* Status Ativo (apenas em edição) */}
                  {editingId && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Transação ativa</span>
                          <p className="text-xs text-gray-500">Quando desativada, não será executada automaticamente</p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <span>✕</span>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-200 font-semibold shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                      <span>{editingId ? "💾" : "✨"}</span>
                      {editingId ? "Atualizar" : "Criar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Totais Recorrentes */}
        {mostrarTotais && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
              <TotaisRecorrentes onClose={() => setMostrarTotais(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
