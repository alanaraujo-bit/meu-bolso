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
      setMensagem("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const url = editingId ? `/api/recorrentes/${editingId}` : "/api/recorrentes";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dataFim: formData.dataFim || null,
        }),
      });

      if (res.ok) {
        setMensagem(editingId ? "Transação recorrente atualizada!" : "Transação recorrente criada!");
        resetForm();
        fetchRecorrentes();
        fetchPendentes();
      } else {
        const error = await res.json();
        setMensagem(error.error || "Erro ao salvar transação recorrente");
      }
    } catch (error) {
      setMensagem("Erro ao salvar transação recorrente");
    }
  }

  async function handleEdit(recorrente: TransacaoRecorrente) {
    setFormData({
      categoriaId: recorrente.categoriaId,
      tipo: recorrente.tipo,
      valor: recorrente.valor.toString(),
      descricao: recorrente.descricao || "",
      frequencia: recorrente.frequencia,
      dataInicio: formatDataBrasil(new Date(recorrente.dataInicio)),
      dataFim: recorrente.dataFim ? formatDataBrasil(new Date(recorrente.dataFim)) : "",
      isActive: recorrente.isActive,
    });
    setEditingId(recorrente.id);
    setShowForm(true);
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const recorrente = recorrentes.find(r => r.id === id);
      if (!recorrente) return;

      const res = await fetch(`/api/recorrentes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recorrente,
          isActive: !isActive,
        }),
      });

      if (res.ok) {
        setMensagem(`Transação recorrente ${!isActive ? 'ativada' : 'desativada'}!`);
        fetchRecorrentes();
        fetchPendentes();
      } else {
        setMensagem("Erro ao alterar status da transação recorrente");
      }
    } catch (error) {
      setMensagem("Erro ao alterar status da transação recorrente");
    }
  }

  async function handleDelete(id: string, descricao: string) {
    if (!confirm(`Tem certeza que deseja excluir a transação recorrente "${descricao}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/recorrentes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMensagem("Transação recorrente excluída!");
        fetchRecorrentes();
        fetchPendentes();
      } else {
        const error = await res.json();
        setMensagem(error.error || "Erro ao excluir transação recorrente");
      }
    } catch (error) {
      setMensagem("Erro ao excluir transação recorrente");
    }
  }

  async function executarRecorrenteIndividual(recorrenteId: string, descricao: string) {
    if (!confirm(`Deseja executar a transação recorrente "${descricao}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/recorrentes/executar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recorrenteId }),
      });

      if (res.ok) {
        const resultado = await res.json();
        setMensagem(resultado.message);
        fetchRecorrentes();
        fetchPendentes();
      } else {
        const error = await res.json();
        setMensagem(error.error || "Erro ao executar transação recorrente");
      }
    } catch (error) {
      console.error("Erro ao executar transação recorrente:", error);
      setMensagem("Erro ao executar transação recorrente");
    }
  }

  async function executarRecorrentes() {
    if (!confirm("Deseja executar todas as transações recorrentes pendentes?")) {
      return;
    }

    try {
      setExecutandoRecorrentes(true);

      // Debug: verificar pendentes antes da execução
      console.log("Verificando pendentes antes da execução...");
      const pendentesAntes = await fetch("/api/recorrentes/executar");
      const dadosPendentesAntes = await pendentesAntes.json();
      console.log("Pendentes antes:", dadosPendentesAntes);

      const res = await fetch("/api/recorrentes/executar", {
        method: "POST",
      });

      if (res.ok) {
        const resultado = await res.json();
        console.log("Resultado da execução:", resultado);
        setMensagem(`Execução concluída! ${resultado.transacoesCriadas} transações criadas.`);

        // Aguardar um pouco antes de recarregar
        setTimeout(() => {
          fetchRecorrentes();
          fetchPendentes();
        }, 1000);
      } else {
        const error = await res.json();
        console.error("Erro na execução:", error);
        setMensagem(error.error || "Erro ao executar transações recorrentes");
      }
    } catch (error) {
      console.error("Erro ao executar transações recorrentes:", error);
      setMensagem("Erro ao executar transações recorrentes");
    } finally {
      setExecutandoRecorrentes(false);
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
  }

  function formatarValor(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function formatarData(data: string): string {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  async function testarExecucao() {
    try {
      console.log("🔍 Testando execução...");

      // Buscar dados de debug
      const debugRes = await fetch("/api/debug");
      const debugData = await debugRes.json();
      console.log("📊 Dados de debug:", debugData);

      // Executar transações
      const execRes = await fetch("/api/recorrentes/executar", {
        method: "POST",
      });
      const execData = await execRes.json();
      console.log("🚀 Resultado da execução:", execData);

      setMensagem(`Debug: ${debugData.totais.recorrentes} recorrentes, ${debugData.totais.transacoes} transações. Execução: ${execData.message}`);
    } catch (error) {
      console.error("Erro no teste:", error);
      setMensagem("Erro no teste de execução");
    }
  }

  function formatarFrequencia(frequencia: string): string {
    const frequencias = {
      diario: "Diário",
      semanal: "Semanal",
      mensal: "Mensal",
      anual: "Anual",
    };
    return frequencias[frequencia as keyof typeof frequencias] || frequencia;
  }

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
              <HelpButton 
                title="Como usar transações recorrentes"
                steps={helpContents.recorrentes}
                size="md"
                variant="inline"
              />
            </div>
            <p className="text-gray-600">
              Configure entradas e saídas automáticas
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 sm:mt-0">
            {pendentesInfo && pendentesInfo.totalExecucoesPendentes > 0 && (
              <button
                onClick={executarRecorrentes}
                disabled={executandoRecorrentes}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors font-medium shadow-lg disabled:opacity-50"
              >
                {executandoRecorrentes ? "Executando..." : `Executar Pendentes (${pendentesInfo.totalExecucoesPendentes})`}
              </button>
            )}
            <button
              onClick={() => setMostrarTotais(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
            >
              📊 Ver Totais
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
            >
              Nova Recorrente
            </button>
            <button
              onClick={testarExecucao}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-lg"
              title="Testar execução (debug)"
            >
              Testar
            </button>
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
            {mensagem}
            <button
              onClick={() => setMensagem("")}
              className="ml-4 text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Alerta de Pendentes */}
        {pendentesInfo && pendentesInfo.totalExecucoesPendentes > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">
                  ⚠️ Transações Pendentes
                </h3>
                <p className="text-sm text-orange-700">
                  Há {pendentesInfo.totalExecucoesPendentes} execuções pendentes de {pendentesInfo.totalPendentes} transações recorrentes.
                </p>
              </div>
              <button
                onClick={executarRecorrentes}
                disabled={executandoRecorrentes}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {executandoRecorrentes ? "Executando..." : "Executar Agora"}
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativas</option>
                <option value="inativo">Inativas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Transações Recorrentes */}
        <div className="space-y-4">
          {recorrentes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma transação recorrente encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Configure suas primeiras entradas e saídas automáticas
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Criar Primeira Recorrente
              </button>
            </div>
          ) : (
            recorrentes.map((recorrente) => (
              <div
                key={recorrente.id}
                className={`bg-white rounded-2xl shadow-lg border-l-4 p-6 ${
                  recorrente.isActive 
                    ? recorrente.tipo === "receita" 
                      ? "border-l-green-500" 
                      : "border-l-red-500"
                    : "border-l-gray-400"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{recorrente.categoria.icone}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {recorrente.descricao || "Transação recorrente"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {recorrente.categoria.nome} • {formatarFrequencia(recorrente.frequencia)}
                        </p>
                      </div>
                      {!recorrente.isActive && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          Inativa
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Valor:</span>
                        <p className={`font-medium ${
                          recorrente.tipo === "receita" ? "text-green-600" : "text-red-600"
                        }`}>
                          {recorrente.tipo === "receita" ? "+" : "-"}{formatarValor(recorrente.valor)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Início:</span>
                        <p className="font-medium">{formatarData(recorrente.dataInicio)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fim:</span>
                        <p className="font-medium">
                          {recorrente.dataFim ? formatarData(recorrente.dataFim) : "Indefinido"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Execuções:</span>
                        <p className="font-medium">{recorrente._count.transacoes}</p>
                      </div>
                    </div>

                    {recorrente.proximaExecucao && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Próxima execução:</span> {formatarData(recorrente.proximaExecucao)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* Botão Executar Individual - só aparece se estiver pendente */}
                    {recorrente.isActive && pendentesInfo?.pendentes.some(p => p.id === recorrente.id) && (
                      <button
                        onClick={() => executarRecorrenteIndividual(recorrente.id, recorrente.descricao || "Transação")}
                        className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                        title="Executar agora"
                      >
                        ▶ Executar
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(recorrente.id, recorrente.isActive)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        recorrente.isActive
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {recorrente.isActive ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => handleEdit(recorrente)}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(recorrente.id, recorrente.descricao || "Transação")}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal do Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? "Editar" : "Nova"} Transação Recorrente
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição da transação"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência *
                    </label>
                    <select
                      value={formData.frequencia}
                      onChange={(e) => setFormData({ ...formData, frequencia: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="diario">Diário</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fim (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {editingId && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Transação ativa
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    >
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <TotaisRecorrentes onClose={() => setMostrarTotais(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
