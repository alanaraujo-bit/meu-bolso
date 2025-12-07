"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CleanLoading from "@/components/CleanLoading";
import { useCleanLoading } from "@/hooks/useCleanLoading";
import StatusBadge from "@/components/StatusBadge";
import HelpButton from "@/components/HelpButton";
import { helpContents } from "@/lib/helpContents";
import SeletorCategoria from "@/components/SeletorCategoria";
import { getDataAtualBrasil, prepararDataParaBanco } from "@/lib/dateUtils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  Plus,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Check,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Info,
  X,
  User,
  RotateCcw,
  Pencil,
  Save
} from 'lucide-react';

interface ParcelaDivida {
  id: string;
  numero: number;
  valor: number;
  dataVencimento: string;
  status: "PAGA" | "PENDENTE" | "VENCIDA";
}

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  cor?: string;
  icone?: string;
}

interface Divida {
  id: string;
  nome: string;
  valorTotal: number;
  numeroParcelas: number;
  valorParcela: number;
  dataPrimeiraParcela: string;
  status: "ATIVA" | "QUITADA";
  categoria?: Categoria | null;
  parcelas: ParcelaDivida[];
  estatisticas?: {
    parcelasPagas: number;
    parcelasVencidas: number;
    valorPago: number;
    valorRestante: number;
    percentualQuitado: number;
    proximaParcelaVencimento?: ParcelaDivida;
  };
}

interface EstatisticasGerais {
  resumo: {
    totalDividas: number;
    dividasAtivas: number;
    dividasQuitadas: number;
    valorTotalDividas: number;
    valorTotalPago: number;
    valorTotalRestante: number;
    valorMedioPorDivida: number;
    percentualQuitadas: number;
    parcelasVencidas: number;
  };
  proximasParcelas: any[];
  dividasPorCategoria: any[];
  insights: any[];
}

interface FormularioDivida {
  nome: string;
  valorParcela: string;
  numeroParcelas: string;
  valorTotal: string;
  parcelasJaPagas: string;
  dataProximaParcela: string;
  categoriaId: string;
}

const CORES_GRAFICOS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
  '#EC4899', '#6366F1'
];

export default function DividasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dividas, setDividas] = useState<Divida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais | null>(null);
  const { loading, setLoading } = useCleanLoading();
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState<string | null>(null);
  const [editandoDivida, setEditandoDivida] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"TODAS" | "ATIVA" | "QUITADA">("ATIVA");
  const [dividaExpandida, setDividaExpandida] = useState<string | null>(null);
  const [mensagemFeedback, setMensagemFeedback] = useState<{texto: string, tipo: 'success' | 'error'} | null>(null);
  const [dividasElegiveis, setDividasElegiveis] = useState<any[]>([]);
  const [mostrarAutoConversao, setMostrarAutoConversao] = useState(false);
  
  // Estados para edição de valor de parcelas
  const [editandoParcela, setEditandoParcela] = useState<{dividaId: string, parcelaId: string} | null>(null);
  const [novoValorParcela, setNovoValorParcela] = useState<string>("");
  
  // Estados para personalização de parcelas na criação
  const [mostrarPersonalizacao, setMostrarPersonalizacao] = useState(false);
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<{numero: number, valor: number}[]>([]);

  const [formulario, setFormulario] = useState<FormularioDivida>({
    nome: "",
    valorParcela: "",
    numeroParcelas: "",
    valorTotal: "",
    parcelasJaPagas: "0",
    dataProximaParcela: getDataAtualBrasil().toISOString().split('T')[0],
    categoriaId: "",
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
    
    carregarDados();
    carregarCategorias();
    verificarDividasElegiveis();
  }, [session, status, router, filtroStatus]);

  // Verificar dívidas elegíveis para conversão automática
  const verificarDividasElegiveis = async () => {
    try {
      const response = await fetch('/api/dividas/auto-converter');
      if (response.ok) {
        const data = await response.json();
        setDividasElegiveis(data.dividas || []);
      }
    } catch (error) {
      console.error('Erro ao verificar dívidas elegíveis:', error);
    }
  };

  // Converter dívida em transação recorrente
  const converterDividaParaRecorrente = async (dividaId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/dividas/auto-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dividaId })
      });

      if (response.ok) {
        const data = await response.json();
        mostrarFeedback(`✅ ${data.message}`, 'success');
        carregarDados();
        verificarDividasElegiveis();
      } else {
        const error = await response.json();
        mostrarFeedback(`❌ ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Erro na conversão:', error);
      mostrarFeedback('❌ Erro inesperado na conversão', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verificar se dívida já foi convertida para recorrente
  const verificarDividaConvertida = async (nomeCompletoIdDivida: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/transacoes-recorrentes');
      if (response.ok) {
        const data = await response.json();
        const recorrentes = data.recorrentes || [];
        return recorrentes.some((r: any) => 
          r.descricao.includes(`💳 ${nomeCompletoIdDivida} - Parcela`)
        );
      }
    } catch (error) {
      console.error('Erro ao verificar conversão:', error);
    }
    return false;
  };

  // Calcular data prevista de quitação
  const calcularDataPrevistaQuitacao = (divida: Divida) => {
    const parcelasRestantes = divida.parcelas.filter(p => p.status === 'PENDENTE');
    if (parcelasRestantes.length === 0) return null;
    
    const ultimaParcela = parcelasRestantes.sort((a, b) => 
      new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime()
    )[0];
    
    return ultimaParcela ? new Date(ultimaParcela.dataVencimento) : null;
  };

  // Função para calcular estatísticas de uma dívida
  const calcularEstatisticasDivida = (divida: any) => {
    const parcelasPagas = divida.parcelas.filter((p: any) => p.status === 'PAGA').length;
    const parcelasVencidas = divida.parcelas.filter((p: any) => {
      const hoje = new Date();
      return p.status === 'PENDENTE' && new Date(p.dataVencimento) < hoje;
    }).length;
    
    const valorPago = parcelasPagas * divida.valorParcela;
    const valorRestante = divida.valorTotal - valorPago;
    const percentualQuitado = divida.valorTotal > 0 ? (valorPago / divida.valorTotal) * 100 : 0;
    
    const proximaParcelaVencimento = divida.parcelas
      .filter((p: any) => p.status === 'PENDENTE')
      .sort((a: any, b: any) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0];

    return {
      parcelasPagas,
      parcelasVencidas,
      valorPago,
      valorRestante,
      percentualQuitado: Math.round(percentualQuitado),
      proximaParcelaVencimento,
    };
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dívidas
      const filtro = filtroStatus !== "TODAS" ? `?status=${filtroStatus}` : "";
      const responseDividas = await fetch(`/api/dividas${filtro}`);
      const dividasData = await responseDividas.json();
      
      // Calcular estatísticas para cada dívida
      const dividasComEstatisticas = dividasData.map((divida: any) => ({
        ...divida,
        estatisticas: calcularEstatisticasDivida(divida)
      }));
      
      // Carregar estatísticas gerais
      const responseEstatisticas = await fetch("/api/dividas/estatisticas");
      const estatisticasData = await responseEstatisticas.json();
      
      setDividas(dividasComEstatisticas);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      const categoriasData = await response.json();
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editandoDivida) {
      // Está editando uma dívida existente
      await editarDivida();
    } else {
      // Está criando uma nova dívida
      await criarDivida();
    }
  };

  const criarDivida = async () => {
    try {
      // Calcular a data da primeira parcela baseado na próxima parcela e parcelas já pagas
      const parcelasJaPagas = parseInt(formulario.parcelasJaPagas);
      
      // Preparar a data da próxima parcela com timezone correto
      const dataProxima = prepararDataParaBanco(formulario.dataProximaParcela);
      
      // Calcular a data da primeira parcela
      const dataPrimeira = new Date(dataProxima);
      dataPrimeira.setMonth(dataPrimeira.getMonth() - parcelasJaPagas);
      
      // Se tem parcelas personalizadas, usar elas
      const parcelasParaEnviar = mostrarPersonalizacao && parcelasPersonalizadas.length > 0
        ? parcelasPersonalizadas
        : null;

      const response = await fetch("/api/dividas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formulario.nome,
          valorParcela: parseFloat(formulario.valorParcela),
          numeroParcelas: parseInt(formulario.numeroParcelas),
          parcelasJaPagas: parcelasJaPagas,
          dataPrimeiraParcela: dataPrimeira.toISOString().split('T')[0],
          categoriaId: formulario.categoriaId || null,
          parcelasPersonalizadas: parcelasParaEnviar,
        }),
      });

      if (response.ok) {
        fecharModal();
        carregarDados();
      }
    } catch (error) {
      console.error("Erro ao criar dívida:", error);
    }
  };

  const excluirDivida = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita.")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/dividas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mostrarFeedback("✅ Dívida excluída com sucesso!", "success");
        carregarDados();
      } else {
        const data = await response.json();
        mostrarFeedback(`❌ Erro: ${data.error || "Erro ao excluir a dívida."}`, "error");
      }
    } catch (error) {
      console.error("Erro ao excluir dívida:", error);
      mostrarFeedback("❌ Erro de conexão ao excluir a dívida.", "error");
    } finally {
      setLoading(false);
    }
  };

  const reativarDivida = async (id: string) => {
    if (!confirm("Tem certeza que deseja reativar esta dívida?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/dividas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "ATIVA"
        }),
      });

      if (response.ok) {
        mostrarFeedback("✅ Dívida reativada com sucesso!", "success");
        carregarDados();
      } else {
        const data = await response.json();
        mostrarFeedback(`❌ Erro: ${data.error || "Erro ao reativar a dívida."}`, "error");
      }
    } catch (error) {
      console.error("Erro ao reativar dívida:", error);
      mostrarFeedback("❌ Erro de conexão ao reativar a dívida.", "error");
    } finally {
      setLoading(false);
    }
  };

  const prepararEdicaoDivida = (divida: Divida) => {
    const proximaParcelaVencimento = divida.parcelas.find(p => p.status === 'PENDENTE');
    
    // Formatar data corretamente sem problemas de timezone
    let dataFormatada = new Date().toISOString().split('T')[0];
    if (proximaParcelaVencimento) {
      const data = new Date(proximaParcelaVencimento.dataVencimento);
      // Adicionar o offset do timezone para evitar mudança de dia
      const offset = data.getTimezoneOffset();
      const dataAjustada = new Date(data.getTime() - (offset * 60 * 1000));
      dataFormatada = dataAjustada.toISOString().split('T')[0];
    }
    
    setFormulario({
      nome: divida.nome,
      valorParcela: divida.valorParcela.toString(),
      numeroParcelas: divida.numeroParcelas.toString(),
      valorTotal: divida.valorTotal.toString(),
      parcelasJaPagas: divida.estatisticas?.parcelasPagas.toString() || "0",
      dataProximaParcela: dataFormatada,
      categoriaId: divida.categoria?.id || "",
    });
    
    setEditandoDivida(divida.id);
    setShowModal(true);
  };

  const editarDivida = async () => {
    if (!editandoDivida) return;

    try {
      const dadosAtualizados = {
        nome: formulario.nome,
        valorTotal: parseFloat(formulario.valorTotal),
        valorParcela: parseFloat(formulario.valorParcela),
        numeroParcelas: parseInt(formulario.numeroParcelas),
        parcelasJaPagas: parseInt(formulario.parcelasJaPagas),
        dataProximaParcela: formulario.dataProximaParcela,
        categoriaId: formulario.categoriaId || null,
      };

      const response = await fetch(`/api/dividas/${editandoDivida}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAtualizados),
      });

      if (response.ok) {
        fecharModal();
        carregarDados();
      } else {
        const errorData = await response.json();
        alert(`Erro ao editar dívida: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao editar dívida:", error);
      alert("Erro ao editar dívida. Tente novamente.");
    }
  };

  // Função para gerar parcelas personalizadas
  const gerarParcelasPersonalizadas = () => {
    const num = parseInt(formulario.numeroParcelas);
    const valor = parseFloat(formulario.valorParcela);
    
    if (!num || !valor || num <= 0 || valor <= 0) return;
    
    const parcelas = [];
    for (let i = 1; i <= num; i++) {
      parcelas.push({ numero: i, valor });
    }
    
    setParcelasPersonalizadas(parcelas);
    setMostrarPersonalizacao(true);
  };
  
  // Função para atualizar valor de uma parcela personalizada
  const atualizarParcelaPersonalizada = (numero: number, novoValor: string) => {
    const valor = parseFloat(novoValor);
    if (isNaN(valor) || valor < 0) return;
    
    setParcelasPersonalizadas(prev => 
      prev.map(p => p.numero === numero ? { ...p, valor } : p)
    );
  };
  
  // Função para cancelar personalização
  const cancelarPersonalizacao = () => {
    setMostrarPersonalizacao(false);
    setParcelasPersonalizadas([]);
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditandoDivida(null);
    setMostrarPersonalizacao(false);
    setParcelasPersonalizadas([]);
    setFormulario({
      nome: "",
      valorParcela: "",
      numeroParcelas: "",
      valorTotal: "",
      parcelasJaPagas: "0",
      dataProximaParcela: new Date().toISOString().split('T')[0],
      categoriaId: "",
    });
  };

  const marcarParcelaPaga = async (dividaId: string, parcelaId: string) => {
    try {
      const response = await fetch(`/api/dividas/${dividaId}/parcelas/${parcelaId}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mostrar feedback detalhado sobre a transação criada
        if (data.transacaoCriada) {
          const valor = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.transacaoCriada.valor);
          
          let mensagem = `💰 Parcela paga! Transação criada: ${valor}`;
          if (data.dividaQuitada) {
            mensagem += " 🎉 Dívida quitada completamente!";
          }
          
          mostrarFeedback(mensagem, 'success');
        }
        
        carregarDados(); // Recarregar os dados para atualizar a interface
      } else {
        const error = await response.json();
        mostrarFeedback(`Erro ao pagar parcela: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error("Erro ao marcar parcela como paga:", error);
      mostrarFeedback("Erro inesperado ao pagar parcela", 'error');
    }
  };

  // Função para alternar exibição das parcelas
  const toggleParcelas = (dividaId: string) => {
    setDividaExpandida(dividaExpandida === dividaId ? null : dividaId);
  };

  // Função para mostrar mensagem de feedback
  const mostrarFeedback = (texto: string, tipo: 'success' | 'error' = 'success') => {
    setMensagemFeedback({ texto, tipo });
    setTimeout(() => setMensagemFeedback(null), 5000); // Remove após 5 segundos
  };

  // Função para iniciar edição de valor de parcela
  const iniciarEdicaoParcela = (dividaId: string, parcelaId: string, valorAtual: number) => {
    setEditandoParcela({ dividaId, parcelaId });
    setNovoValorParcela(String(valorAtual));
  };

  // Função para cancelar edição de valor de parcela
  const cancelarEdicaoParcela = () => {
    setEditandoParcela(null);
    setNovoValorParcela("");
  };

  // Função para salvar novo valor da parcela
  const salvarNovoValorParcela = async () => {
    if (!editandoParcela || !novoValorParcela) {
      mostrarFeedback("Dados incompletos", 'error');
      return;
    }

    const valor = parseFloat(novoValorParcela.replace(',', '.'));
    
    if (valor <= 0 || isNaN(valor)) {
      mostrarFeedback("Valor deve ser um número positivo", 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Salvar IDs antes de limpar o estado
      const dividaId = editandoParcela.dividaId;
      const parcelaId = editandoParcela.parcelaId;
      
      const response = await fetch(`/api/dividas/${dividaId}/parcelas/${parcelaId}/valor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoValor: valor })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Limpar estado de edição imediatamente
        setEditandoParcela(null);
        setNovoValorParcela("");
        
        // Atualizar localmente para feedback instantâneo
        setDividas(prev => prev.map(d => {
          if (d.id === dividaId) {
            // Atualizar parcela e recalcular totais localmente
            const parcelasAtualizadas = d.parcelas.map(p => 
              p.id === parcelaId ? { ...p, valor } : p
            );
            const novoValorTotal = data.novoValorTotal || parcelasAtualizadas.reduce((sum, p) => sum + p.valor, 0);
            return {
              ...d,
              parcelas: parcelasAtualizadas,
              valorTotal: novoValorTotal,
              valorParcela: novoValorTotal / d.numeroParcelas
            };
          }
          return d;
        }));
        
        mostrarFeedback("✓ Atualizado", 'success');
      } else {
        const error = await response.json();
        mostrarFeedback(error.error || 'Erro ao salvar', 'error');
      }
    } catch (error) {
      mostrarFeedback("Erro de conexão", 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se uma parcela tem valor personalizado
  const parcelaTemValorPersonalizado = (divida: Divida, parcela: ParcelaDivida) => {
    return Math.abs(parcela.valor - divida.valorParcela) > 0.01; // Tolerância de 1 centavo
  };

  // Função para ordenar parcelas: próximas pendentes primeiro, depois pagas por último
  const ordenarParcelas = (parcelas: ParcelaDivida[]) => {
    return [...parcelas].sort((a, b) => {
      // Primeiro critério: status (PENDENTE e VENCIDA primeiro, PAGA por último)
      const statusOrder = { 'PENDENTE': 0, 'VENCIDA': 1, 'PAGA': 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Para parcelas PENDENTES e VENCIDAS: ordem crescente (próximas primeiro)
      if (a.status !== 'PAGA' && b.status !== 'PAGA') {
        return a.numero - b.numero;
      }
      
      // Para parcelas PAGAS: ordem decrescente (mais recentes primeiro)
      if (a.status === 'PAGA' && b.status === 'PAGA') {
        return b.numero - a.numero;
      }
      
      return a.numero - b.numero;
    });
  };

  // Função para obter informações da próxima parcela a ser paga
  const obterProximaParcela = (divida: Divida) => {
    // Buscar todas as parcelas pendentes e vencidas
    const parcelasAPagar = divida.parcelas
      .filter(p => p.status === 'PENDENTE' || p.status === 'VENCIDA')
      .sort((a, b) => a.numero - b.numero); // Ordenar por número crescente
    
    // Retornar a primeira da lista (menor número = próxima a ser paga)
    return parcelasAPagar[0] || null;
  };

  // Função para formatar valores monetários
  const formatarValor = (valor: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Função para formatar valores de forma compacta
  const formatarValorCompacto = (valor: number): string => {
    if (valor >= 1000000) {
      return `R$ ${(valor / 1000000).toFixed(1)}M`;
    } else if (valor >= 1000) {
      return `R$ ${(valor / 1000).toFixed(0)}k`;
    }
    return formatarValor(valor);
  };

  if (loading && !dividas.length) {
    return <CleanLoading />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    } relative overflow-hidden`}>
      
      {/* Notificação de Feedback */}
      {mensagemFeedback && (
        <div className={`fixed top-4 right-4 z-30 p-4 rounded-lg shadow-lg max-w-md animate-in slide-in-from-right duration-300 ${
          mensagemFeedback.tipo === 'success'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {mensagemFeedback.tipo === 'success' ? '✅' : '❌'}
            </span>
            <p className="font-medium">{mensagemFeedback.texto}</p>
            <button
              onClick={() => setMensagemFeedback(null)}
              className="ml-auto text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
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
        <span className="text-lg sm:text-xl">{darkMode ? '☀️' : '🌙'}</span>
      </button>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <HelpButton 
          title="Dívidas"
          steps={[
            {
              title: "💳 Dívidas",
              content: "Gerencie suas dívidas parceladas e acompanhe o progresso de pagamento."
            },
            {
              title: "📊 Como usar",
              content: "• Cadastre dívidas parceladas\n• Marque parcelas como pagas\n• Acompanhe estatísticas\n• Veja insights inteligentes"
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
                  <span className="text-3xl">💳</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    💳 Dívidas
                  </h1>
                  <p className="text-white/90 text-lg font-medium">
                    Controle suas dívidas parceladas
                  </p>
                </div>
              </div>
              
              {/* Estatísticas rápidas */}
              {estatisticas && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{estatisticas.resumo.totalDividas}</div>
                    <div className="text-white/90 text-xs sm:text-sm font-medium">Total</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{estatisticas.resumo.dividasAtivas}</div>
                    <div className="text-white/90 text-xs sm:text-sm font-medium">Ativas</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                    <div className="text-sm sm:text-lg md:text-xl font-bold text-white break-words">
                      <span className="hidden sm:inline">
                        {formatarValor(estatisticas.resumo.valorTotalRestante)}
                      </span>
                      <span className="sm:hidden">
                        {formatarValorCompacto(estatisticas.resumo.valorTotalRestante)}
                      </span>
                    </div>
                    <div className="text-white/90 text-xs sm:text-sm font-medium">Restante</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{estatisticas.resumo.parcelasVencidas}</div>
                    <div className="text-white/90 text-xs sm:text-sm font-medium">Vencidas</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insights */}
        {estatisticas?.insights && estatisticas.insights.length > 0 && (
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border mb-8 p-6 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Info size={20} />
              💡 Insights Inteligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estatisticas.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 transition-all duration-300 hover:scale-[1.02] ${
                    insight.tipo === 'success' 
                      ? darkMode ? 'bg-green-900/30 border-green-400 text-green-300' : 'bg-green-50 border-green-400 text-green-800'
                      : insight.tipo === 'warning' 
                        ? darkMode ? 'bg-yellow-900/30 border-yellow-400 text-yellow-300' : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                        : insight.tipo === 'error' 
                          ? darkMode ? 'bg-red-900/30 border-red-400 text-red-300' : 'bg-red-50 border-red-400 text-red-800'
                          : darkMode ? 'bg-blue-900/30 border-blue-400 text-blue-300' : 'bg-blue-50 border-blue-400 text-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icone}</span>
                    <div>
                      <h4 className="font-semibold">{insight.titulo}</h4>
                      <p className="text-sm opacity-80">{insight.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dívidas Elegíveis para Conversão Automática */}
        {dividasElegiveis.length > 0 && (
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border mb-8 p-6 ${
            darkMode 
              ? 'bg-purple-800/40 border-purple-700/50' 
              : 'bg-purple-50/80 border-purple-200/50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    🔄 Conversão para Recorrente Disponível
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    {dividasElegiveis.length} dívida(s) podem virar recorrentes (mantendo a dívida original)
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setMostrarAutoConversao(!mostrarAutoConversao)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {mostrarAutoConversao ? 'Ocultar' : 'Ver Detalhes'}
              </button>
            </div>

            {mostrarAutoConversao && (
              <div className="space-y-3">
                {dividasElegiveis.map((divida) => (
                  <div key={divida.id} className={`p-4 rounded-lg border ${
                    darkMode 
                      ? 'bg-purple-900/20 border-purple-600/30' 
                      : 'bg-white/60 border-purple-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          💳 {divida.nome}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-sm">
                          <div>
                            <span className={`font-medium ${
                              darkMode ? 'text-purple-300' : 'text-purple-600'
                            }`}>
                              Restantes:
                            </span>
                            <div className={`font-bold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {divida.parcelasRestantes} parcelas
                            </div>
                          </div>
                          <div>
                            <span className={`font-medium ${
                              darkMode ? 'text-purple-300' : 'text-purple-600'
                            }`}>
                              Valor:
                            </span>
                            <div className={`font-bold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatarValor(divida.valorParcela)}
                            </div>
                          </div>
                          <div>
                            <span className={`font-medium ${
                              darkMode ? 'text-purple-300' : 'text-purple-600'
                            }`}>
                              Progresso:
                            </span>
                            <div className={`font-bold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {divida.progressoPercentual}%
                            </div>
                          </div>
                          <div>
                            <span className={`font-medium ${
                              darkMode ? 'text-purple-300' : 'text-purple-600'
                            }`}>
                              Quitação:
                            </span>
                            <div className={`font-bold text-xs ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {divida.dataPrevistaQuitacao ? 
                                new Date(divida.dataPrevistaQuitacao).toLocaleDateString('pt-BR') : 
                                'N/A'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => converterDividaParaRecorrente(divida.id)}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <RotateCcw size={16} />
                        Converter
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className={`p-3 rounded-lg border-l-4 text-sm ${
                  darkMode 
                    ? 'bg-blue-900/20 border-blue-400 text-blue-300' 
                    : 'bg-blue-50 border-blue-400 text-blue-700'
                }`}>
                  <div className="flex items-center gap-2 font-medium">
                    <Info size={14} />
                    Como funciona a conversão automática?
                  </div>
                  <div className="text-xs mt-2 opacity-90">
                    • Qualquer dívida com parcelas pendentes pode ser convertida em recorrente<br/>
                    • A dívida original continua aparecendo na lista de dívidas<br/>
                    • Uma transação recorrente é criada para gerar os pagamentos automaticamente<br/>
                    • Funciona para qualquer quantidade de parcelas (1, 15, 30, etc.)<br/>
                    • A recorrente terá o mesmo valor e categoria da dívida
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controles */}
        <div className={`backdrop-blur-xl rounded-2xl shadow-xl border mb-8 p-6 ${
          darkMode 
            ? 'bg-gray-800/40 border-gray-700/50' 
            : 'bg-white/40 border-white/50'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg flex items-center justify-center gap-2 hover:scale-105"
            >
              <Plus size={18} />
              💳 Nova Dívida
            </button>
            
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Filtrar:
              </span>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className={`border-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                } focus:ring-4 focus:ring-emerald-500/20`}
              >
                <option value="TODAS">🔄 Todas</option>
                <option value="ATIVA">⚡ Ativas</option>
                <option value="QUITADA">✅ Quitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Dívidas */}
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
              Suas Dívidas ({dividas.length})
            </h2>

            {dividas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-4">💳</div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Nenhuma dívida encontrada
                </h3>
                <p className={`text-base mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filtroStatus === 'TODAS' 
                    ? 'Cadastre sua primeira dívida!'
                    : `Nenhuma dívida "${filtroStatus.toLowerCase()}" encontrada.`
                  }
                </p>
                {filtroStatus === 'TODAS' && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <span className="mr-2">💳</span>
                    Cadastrar Nova Dívida
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {dividas.map((divida) => (
                  <div
                    key={divida.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                      darkMode 
                        ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50' 
                        : 'bg-white/60 border-white/60 hover:bg-white/80'
                    }`}
                  >
                    {/* Header da dívida */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {divida.categoria && (
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ backgroundColor: (divida.categoria.cor || '#10B981') + '20', border: `2px solid ${divida.categoria.cor || '#10B981'}` }}
                          >
                            {divida.categoria.icone || '💳'}
                          </div>
                        )}
                        <div>
                          <h3 className={`font-bold text-lg ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {divida.nome}
                          </h3>
                          <StatusBadge 
                            status={divida.status} 
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleParcelas(divida.id)}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            dividaExpandida === divida.id
                              ? (darkMode 
                                  ? 'bg-blue-500/30 text-blue-300' 
                                  : 'bg-blue-200 text-blue-700')
                              : (darkMode 
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100')
                          }`}
                          title={dividaExpandida === divida.id ? "Ocultar parcelas" : "Ver parcelas"}
                        >
                          <Eye size={16} />
                        </button>
                        
                        {divida.status !== 'QUITADA' && (
                          <button
                            onClick={() => prepararEdicaoDivida(divida)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              darkMode 
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title="Editar dívida"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        
                        {divida.status === 'QUITADA' && (
                          <button
                            onClick={() => reativarDivida(divida.id)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              darkMode 
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                                : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            }`}
                            title="Reativar dívida"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => excluirDivida(divida.id)}
                          className={`p-2 rounded-lg transition-all hover:scale-110 ${
                            darkMode 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                          title="Excluir dívida"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Informações da dívida - Design Minimalista */}
                    <div className="space-y-3">
                      {/* Progresso Principal */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Progresso:
                          </span>
                          <span className={`text-lg font-bold ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {divida.estatisticas?.parcelasPagas || 0}/{divida.numeroParcelas}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          divida.estatisticas && divida.estatisticas.percentualQuitado === 100
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {divida.estatisticas?.percentualQuitado.toFixed(0)}%
                        </span>
                      </div>

                      {/* Barra de Progresso */}
                      <div className={`w-full rounded-full h-2 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${divida.estatisticas?.percentualQuitado || 0}%` }}
                        ></div>
                      </div>

                      {/* Valores Resumidos */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className={`text-center p-2 rounded-lg ${
                          darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'
                        }`}>
                          <div className={`text-xs font-medium ${
                            darkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`}>
                            Pago
                          </div>
                          <div className={`text-xs sm:text-sm font-bold break-words ${
                            darkMode ? 'text-emerald-300' : 'text-emerald-700'
                          }`}>
                            <span className="hidden sm:inline">
                              {formatarValor(divida.estatisticas?.valorPago || 0)}
                            </span>
                            <span className="sm:hidden">
                              {formatarValorCompacto(divida.estatisticas?.valorPago || 0)}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`text-center p-2 rounded-lg ${
                          darkMode ? 'bg-orange-900/20' : 'bg-orange-50'
                        }`}>
                          <div className={`text-xs font-medium ${
                            darkMode ? 'text-orange-400' : 'text-orange-600'
                          }`}>
                            Restante
                          </div>
                          <div className={`text-xs sm:text-sm font-bold break-words ${
                            darkMode ? 'text-orange-300' : 'text-orange-700'
                          }`}>
                            <span className="hidden sm:inline">
                              {formatarValor(divida.estatisticas?.valorRestante || 0)}
                            </span>
                            <span className="sm:hidden">
                              {formatarValorCompacto(divida.estatisticas?.valorRestante || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Próxima Parcela e Data Prevista de Quitação */}
                      {(() => {
                        const proximaParcela = obterProximaParcela(divida);
                        const dataPrevistaQuitacao = calcularDataPrevistaQuitacao(divida);
                        const parcelasRestantes = divida.parcelas.filter(p => p.status === 'PENDENTE').length;
                        const elegiveParaConversao = parcelasRestantes > 0 && 
                          dividasElegiveis.some(elegivel => elegivel.id === divida.id); // Só exibe se está na lista de elegíveis
                        
                        return (
                          <div className="space-y-3 mt-4">
                            {/* Próxima Parcela */}
                            {proximaParcela && (
                              <div className={`p-3 rounded-lg border-l-4 ${
                                darkMode 
                                  ? 'bg-blue-900/20 border-blue-400 text-blue-300' 
                                  : 'bg-blue-50 border-blue-400 text-blue-700'
                              }`}>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock size={14} />
                                    Próxima: #{proximaParcela.numero}
                                  </div>
                                  <div className="text-sm font-bold">
                                    {formatarValor(proximaParcela.valor)}
                                  </div>
                                </div>
                                <div className="text-xs mt-1 opacity-80">
                                  Vence: {new Date(proximaParcela.dataVencimento).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            )}

                            {/* Data Prevista de Quitação */}
                            {dataPrevistaQuitacao && (
                              <div className={`p-3 rounded-lg border-l-4 ${
                                darkMode 
                                  ? 'bg-emerald-900/20 border-emerald-400 text-emerald-300' 
                                  : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                              }`}>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  <Target size={14} />
                                  Quitação Prevista:
                                </div>
                                <div className="text-sm font-bold mt-1">
                                  📅 {dataPrevistaQuitacao.toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs mt-1 opacity-80">
                                  {parcelasRestantes} parcelas restantes
                                </div>
                              </div>
                            )}

                            {/* Conversão Automática */}
                            {elegiveParaConversao && (
                              <div className={`p-3 rounded-lg border-l-4 ${
                                darkMode 
                                  ? 'bg-purple-900/20 border-purple-400 text-purple-300' 
                                  : 'bg-purple-50 border-purple-400 text-purple-700'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                      <RotateCcw size={14} />
                                      Conversão Automática Disponível
                                    </div>
                                    <div className="text-xs opacity-80">
                                      🤖 Restam {parcelasRestantes} parcelas - pode virar recorrente!
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => converterDividaParaRecorrente(divida.id)}
                                    className="ml-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                                    title="Converter para transação recorrente"
                                  >
                                    🔄 Converter
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Seção de Parcelas (Expandida) */}
                    {dividaExpandida === divida.id && divida.parcelas && (
                      <div className={`mt-4 p-4 rounded-lg border-t ${
                        darkMode 
                          ? 'border-gray-700 bg-gray-800/50' 
                          : 'border-gray-200 bg-gray-50/50'
                      }`}>
                        <h4 className={`font-bold mb-4 flex items-center gap-2 ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          📋 Parcelas ({divida.parcelas.length})
                          <span className={`text-xs font-normal ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            • Próximas primeiro, pagas por último
                          </span>
                        </h4>
                        
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {ordenarParcelas(divida.parcelas).map((parcela, index) => {
                            const isProxima = parcela.status === 'PENDENTE' && index === 0;
                            return (
                              <div key={parcela.id} className={`p-3 rounded-lg border transition-all ${
                                parcela.status === 'PAGA'
                                  ? (darkMode 
                                      ? 'bg-emerald-900/20 border-emerald-500/30 opacity-75' 
                                      : 'bg-emerald-50 border-emerald-200 opacity-75')
                                  : parcela.status === 'VENCIDA'
                                    ? (darkMode 
                                        ? 'bg-red-900/20 border-red-500/30' 
                                        : 'bg-red-50 border-red-200')
                                    : isProxima
                                      ? (darkMode 
                                          ? 'bg-blue-900/30 border-blue-400 ring-2 ring-blue-500/50' 
                                          : 'bg-blue-100 border-blue-400 ring-2 ring-blue-500/50')
                                      : (darkMode 
                                          ? 'bg-blue-900/20 border-blue-500/30' 
                                          : 'bg-blue-50 border-blue-200')
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className={`font-bold text-lg ${
                                        darkMode ? 'text-white' : 'text-gray-800'
                                      }`}>
                                        #{parcela.numero}
                                      </span>
                                      {isProxima && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                          darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          🎯 Próxima
                                        </span>
                                      )}
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                        parcela.status === 'PAGA'
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : parcela.status === 'VENCIDA'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                      }`}>
                                        {parcela.status === 'PAGA' ? '✅ Paga' : 
                                         parcela.status === 'VENCIDA' ? '⚠️ Vencida' : '⏳ Pendente'}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className={`text-sm ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                        <span className="font-medium">Valor:</span>
                                        
                                        {/* Modo de edição */}
                                        {editandoParcela !== null && 
                                         editandoParcela.dividaId === divida.id && 
                                         editandoParcela.parcelaId === parcela.id ? (
                                          <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              value={novoValorParcela}
                                              onChange={(e) => setNovoValorParcela(e.target.value)}
                                              className={`w-20 sm:w-24 px-2 py-1 text-sm sm:text-base rounded-lg border-2 font-bold ${
                                                darkMode 
                                                  ? 'bg-gray-700 border-blue-500 text-white' 
                                                  : 'bg-white border-blue-500 text-gray-800'
                                              }`}
                                              placeholder="0.00"
                                              autoFocus
                                            />
                                            <button
                                              onClick={salvarNovoValorParcela}
                                              disabled={loading}
                                              className={`p-1.5 sm:p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ${
                                                loading ? 'opacity-50 cursor-not-allowed' : ''
                                              }`}
                                              title="Salvar"
                                            >
                                              <Check size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                              onClick={cancelarEdicaoParcela}
                                              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                                                darkMode 
                                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                              }`}
                                              title="Cancelar"
                                            >
                                              <X size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <div className={`font-bold text-lg ${
                                              parcela.status === 'PAGA' 
                                                ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                                                : (darkMode ? 'text-white' : 'text-gray-800')
                                            }`}>
                                              {formatarValor(parcela.valor)}
                                            </div>
                                            
                                            {/* Botão de editar (somente para parcelas pendentes) */}
                                            {parcela.status === 'PENDENTE' && (
                                              <button
                                                onClick={() => iniciarEdicaoParcela(divida.id, parcela.id, parcela.valor)}
                                                className={`p-1 sm:p-1.5 rounded-lg transition-all hover:scale-110 ${
                                                  darkMode 
                                                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                                }`}
                                                title="Editar"
                                              >
                                                <Pencil size={12} className="sm:w-3.5 sm:h-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className={`text-sm ${
                                        darkMode ? 'text-gray-300' : 'text-gray-600'
                                      }`}>
                                        <span className="font-medium">Vencimento:</span>
                                        <div className={`font-semibold ${
                                          darkMode ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                          {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Botão de Pagar */}
                                  {parcela.status === 'PENDENTE' && (
                                    <button
                                      onClick={() => marcarParcelaPaga(divida.id, parcela.id)}
                                      className="ml-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg"
                                      title="Marcar como paga"
                                    >
                                      <Check size={16} />
                                      Pagar
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Nova Dívida */}
        {showModal && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header do modal */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-16 -translate-x-16"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-3xl">💳</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                        {editandoDivida ? '✏️ Editar Dívida' : '✨ Nova Dívida'}
                      </h2>
                      <p className="text-white/90 text-sm font-medium">
                        {editandoDivida ? 'Edite os dados da dívida parcelada' : 'Cadastre uma nova dívida parcelada'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fecharModal}
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 font-bold text-lg hover:scale-110"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Conteúdo do modal */}
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
                      💳 Nome da Dívida *
                    </label>
                    <input
                      type="text"
                      value={formulario.nome}
                      onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                      } focus:ring-4 focus:ring-emerald-500/20 placeholder-gray-500`}
                      placeholder="Ex: Financiamento do carro, Cartão de crédito..."
                      required
                    />
                  </div>

                  {/* Valor e Parcelas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                        💰 Valor Parcela *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formulario.valorParcela}
                        onChange={(e) => setFormulario({ ...formulario, valorParcela: e.target.value })}
                        className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                        } focus:ring-4 focus:ring-emerald-500/20 placeholder-gray-500`}
                        placeholder="0,00"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <span className="w-3 h-3 bg-purple-600 rounded-full shadow-sm"></span>
                        🔢 Nº Parcelas *
                      </label>
                      <input
                        type="number"
                        value={formulario.numeroParcelas}
                        onChange={(e) => setFormulario({ ...formulario, numeroParcelas: e.target.value })}
                        className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                        } focus:ring-4 focus:ring-emerald-500/20 placeholder-gray-500`}
                        placeholder="12"
                        required
                      />
                    </div>
                  </div>

                  {/* Parcelas já pagas e próxima data */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <span className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></span>
                        ✅ Já Pagas
                      </label>
                      <input
                        type="number"
                        value={formulario.parcelasJaPagas}
                        onChange={(e) => setFormulario({ ...formulario, parcelasJaPagas: e.target.value })}
                        className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                        } focus:ring-4 focus:ring-emerald-500/20 placeholder-gray-500`}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <span className="w-3 h-3 bg-orange-600 rounded-full shadow-sm"></span>
                        📅 Próxima Parcela
                      </label>
                      <input
                        type="date"
                        value={formulario.dataProximaParcela}
                        onChange={(e) => setFormulario({ ...formulario, dataProximaParcela: e.target.value })}
                        className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                        } focus:ring-4 focus:ring-emerald-500/20`}
                      />
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-3">
                    <label className={`flex items-center gap-2 text-base font-bold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <span className="w-3 h-3 bg-pink-600 rounded-full shadow-sm"></span>
                      🏷️ Categoria (Opcional)
                    </label>
                    <select
                      value={formulario.categoriaId}
                      onChange={(e) => setFormulario({ ...formulario, categoriaId: e.target.value })}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all font-medium ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                      } focus:ring-4 focus:ring-emerald-500/20`}
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.icone} {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão Personalizar Parcelas */}
                  {formulario.numeroParcelas && formulario.valorParcela && !mostrarPersonalizacao && (
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={gerarParcelasPersonalizadas}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          darkMode 
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-2 border-blue-500/30' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200'
                        }`}
                      >
                        <Pencil size={16} />
                        Personalizar Valores das Parcelas
                      </button>
                    </div>
                  )}

                  {/* Lista de Parcelas Personalizadas */}
                  {mostrarPersonalizacao && parcelasPersonalizadas.length > 0 && (
                    <div className={`p-4 rounded-xl border-2 space-y-3 ${
                      darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          💰 Valores das Parcelas
                        </h3>
                        <button
                          type="button"
                          onClick={cancelarPersonalizacao}
                          className={`text-sm px-3 py-1 rounded-lg ${
                            darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                          }`}
                        >
                          Cancelar
                        </button>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {parcelasPersonalizadas.map((parcela) => (
                          <div key={parcela.numero} className={`flex items-center gap-3 p-3 rounded-lg ${
                            darkMode ? 'bg-gray-800' : 'bg-white'
                          }`}>
                            <span className={`font-bold min-w-[60px] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              #{parcela.numero}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={parcela.valor}
                              onChange={(e) => atualizarParcelaPersonalizada(parcela.numero, e.target.value)}
                              className={`flex-1 px-3 py-2 rounded-lg border font-semibold ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-800'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className={`pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Total:
                          </span>
                          <span className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                              parcelasPersonalizadas.reduce((sum, p) => sum + p.valor, 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={fecharModal}
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
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {editandoDivida ? 'Salvar Alterações' : 'Criar Dívida'}
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
