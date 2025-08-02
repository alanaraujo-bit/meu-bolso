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
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Info,
  X,
  User
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
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState<string | null>(null);
  const [editandoDivida, setEditandoDivida] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"TODAS" | "ATIVA" | "QUITADA">("TODAS");

  const [formulario, setFormulario] = useState<FormularioDivida>({
    nome: "",
    valorParcela: "",
    numeroParcelas: "",
    valorTotal: "",
    parcelasJaPagas: "0",
    dataProximaParcela: new Date().toISOString().split('T')[0], // Data de hoje
    categoriaId: "",
  });

  useEffect(() => {
    if (session) {
      carregarDados();
      carregarCategorias();
    }
  }, [session, filtroStatus]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar dívidas
      const filtro = filtroStatus !== "TODAS" ? `?status=${filtroStatus}` : "";
      const responseDividas = await fetch(`/api/dividas${filtro}`);
      const dividasData = await responseDividas.json();
      
      // Carregar estatísticas
      const responseEstatisticas = await fetch("/api/dividas/estatisticas");
      const estatisticasData = await responseEstatisticas.json();
      
      setDividas(dividasData);
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
    try {
      // Calcular a data da primeira parcela baseado na próxima parcela e parcelas já pagas
      const dataProxima = new Date(formulario.dataProximaParcela);
      const parcelasJaPagas = parseInt(formulario.parcelasJaPagas);
      const dataPrimeira = new Date(dataProxima);
      dataPrimeira.setMonth(dataPrimeira.getMonth() - parcelasJaPagas);

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
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setFormulario({
          nome: "",
          valorParcela: "",
          numeroParcelas: "",
          valorTotal: "",
          parcelasJaPagas: "0",
          dataProximaParcela: new Date().toISOString().split('T')[0], // Data de hoje
          categoriaId: "",
        });
        carregarDados();
      }
    } catch (error) {
      console.error("Erro ao criar dívida:", error);
    }
  };

  const marcarParcela = async (dividaId: string, parcelaId: string, novoStatus: string) => {
    try {
      const response = await fetch(`/api/dividas/${dividaId}/parcelas/${parcelaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        carregarDados();
      }
    } catch (error) {
      console.error("Erro ao marcar parcela:", error);
    }
  };

  const excluirDivida = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta dívida?")) {
      try {
        const response = await fetch(`/api/dividas/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          carregarDados();
        }
      } catch (error) {
        console.error("Erro ao excluir dívida:", error);
      }
    }
  };

  const calcularValorTotal = () => {
    if (formulario.valorParcela && formulario.numeroParcelas) {
      const valor = parseFloat(formulario.valorParcela) * parseInt(formulario.numeroParcelas);
      setFormulario({ ...formulario, valorTotal: valor.toFixed(2) });
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (status === "loading" || loading) {
    return <CleanLoading text="Carregando dívidas..." fullScreen />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              💳 Controle de Dívidas
            </h1>
            <HelpButton 
              title="Como controlar suas dívidas"
              steps={helpContents.dividas}
              size="md"
              variant="inline"
            />
          </div>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Organize e controle suas dívidas de forma estratégica
          </p>
        </div>

        {/* Estatísticas Gerais */}
        {estatisticas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-blue-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <CreditCard className="text-blue-600 flex-shrink-0" size={20} />
                <span className="text-gray-600 font-medium text-sm sm:text-base">Total de Dívidas</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {estatisticas.resumo.totalDividas}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {estatisticas.resumo.dividasAtivas} ativas, {estatisticas.resumo.dividasQuitadas} quitadas
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-red-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <DollarSign className="text-red-600 flex-shrink-0" size={20} />
                <span className="text-gray-600 font-medium text-sm sm:text-base">Valor Total</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {formatarMoeda(estatisticas.resumo.valorTotalDividas)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {formatarMoeda(estatisticas.resumo.valorTotalRestante)} restante
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <TrendingDown className="text-green-600 flex-shrink-0" size={20} />
                <span className="text-gray-600 font-medium text-sm sm:text-base">Progresso</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {estatisticas.resumo.percentualQuitadas}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {formatarMoeda(estatisticas.resumo.valorTotalPago)} pagos
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-orange-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
                <span className="text-gray-600 font-medium text-sm sm:text-base">Parcelas Vencidas</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {estatisticas.resumo.parcelasVencidas}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Requerem atenção
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        {estatisticas?.insights && estatisticas.insights.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info size={20} />
              Insights Inteligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estatisticas.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.tipo === 'success' ? 'bg-green-50 border-green-400' :
                    insight.tipo === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    insight.tipo === 'error' ? 'bg-red-50 border-red-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icone}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.titulo}</h4>
                      <p className="text-sm text-gray-600">{insight.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus size={18} />
              Nova Dívida
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Filtrar:</span>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-none"
              >
                <option value="TODAS">Todas</option>
                <option value="ATIVA">Ativas</option>
                <option value="QUITADA">Quitadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Dívidas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {dividas.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <CreditCard size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Nenhuma dívida cadastrada
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                Comece cadastrando suas dívidas para ter controle total das suas finanças
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Cadastrar Primeira Dívida
              </button>
            </div>
          ) : (
            dividas.map((divida) => (
              <div key={divida.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Header da Dívida */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{divida.nome}</h3>
                        <StatusBadge 
                          status={divida.status === 'ATIVA' ? 'pending' : 'completed'}
                        />
                      </div>
                      {divida.categoria && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span>{divida.categoria.icone}</span>
                          <span className="truncate">{divida.categoria.nome}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => setShowDetalhes(showDetalhes === divida.id ? null : divida.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => router.push(`/dividas/${divida.id}`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar dívida"
                      >
                        <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => excluirDivida(divida.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>

                  {/* Informações Principais */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <span className="text-xs sm:text-sm text-gray-600">Valor Total</span>
                      <div className="text-base sm:text-lg font-bold text-red-600">
                        {formatarMoeda(divida.valorTotal)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-gray-600">Valor da Parcela</span>
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        {formatarMoeda(divida.valorParcela)}
                      </div>
                    </div>
                  </div>

                  {/* Progresso */}
                  {divida.estatisticas && (
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mb-2">
                        <span className="text-xs sm:text-sm text-gray-600">Progresso</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {divida.estatisticas.parcelasPagas}/{divida.numeroParcelas} parcelas
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${divida.estatisticas.percentualQuitado}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 mt-1">
                        <span className="text-sm text-green-600">
                          {formatarMoeda(divida.estatisticas.valorPago)} pagos
                        </span>
                        <span className="text-sm text-red-600">
                          {formatarMoeda(divida.estatisticas.valorRestante)} restante
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Próxima Parcela */}
                  {divida.estatisticas?.proximaParcelaVencimento && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Próxima Parcela</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">
                          Parcela {divida.estatisticas.proximaParcelaVencimento.numero} - {formatarMoeda(divida.estatisticas.proximaParcelaVencimento.valor)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-700">
                            {formatarData(divida.estatisticas.proximaParcelaVencimento.dataVencimento)}
                          </span>
                          <button
                            onClick={() => marcarParcela(divida.id, divida.estatisticas!.proximaParcelaVencimento!.id, 'PAGA')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Marcar como Paga
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detalhes das Parcelas */}
                  {showDetalhes === divida.id && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Histórico de Parcelas</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="grid gap-2">
                          {divida.parcelas
                            .sort((a, b) => a.numero - b.numero)
                            .map((parcela) => {
                            const isVencida = new Date(parcela.dataVencimento) < new Date() && parcela.status === 'PENDENTE';
                            return (
                              <div
                                key={parcela.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  parcela.status === 'PAGA' ? 'bg-green-50 border-green-200' :
                                  isVencida ? 'bg-red-50 border-red-200' :
                                  'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-900">
                                    {parcela.numero}ª
                                  </span>
                                  <div>
                                    <div className="text-sm font-medium">
                                      {formatarMoeda(parcela.valor)}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {formatarData(parcela.dataVencimento)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge
                                    status={
                                      parcela.status === 'PAGA' ? 'completed' :
                                      isVencida ? 'error' : 'pending'
                                    }
                                  />
                                  {parcela.status !== 'PAGA' && (
                                    <button
                                      onClick={() => marcarParcela(divida.id, parcela.id, 'PAGA')}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                      title="Marcar como paga"
                                    >
                                      ✓ Pagar
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gráficos */}
        {estatisticas && estatisticas.dividasPorCategoria.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Dívidas por Categoria */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dívidas por Categoria
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estatisticas.dividasPorCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, percentage }) => percentage > 5 ? `${percentage}%` : ''}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="valorRestante"
                    >
                      {estatisticas.dividasPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        formatarMoeda(value), 
                        `${props.payload.nome} (${props.payload.percentage}%)`
                      ]} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => `${entry.payload.nome}: ${entry.payload.percentage}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Próximas Parcelas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Próximas Parcelas (30 dias)
              </h3>
              <div className="space-y-3">
                {estatisticas.proximasParcelas.slice(0, 5).map((parcela, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{parcela.dividaNome}</div>
                      <div className="text-sm text-gray-600">
                        Parcela {parcela.numero} - {formatarData(parcela.dataVencimento)}
                      </div>
                    </div>
                    <div className="font-bold text-red-600">
                      {formatarMoeda(parcela.valor)}
                    </div>
                  </div>
                ))}
                {estatisticas.proximasParcelas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Nenhuma parcela vence nos próximos 30 dias</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Nova Dívida */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Nova Dívida</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Nome da Dívida */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                      📝 Nome da Dívida *
                    </label>
                    <input
                      type="text"
                      value={formulario.nome}
                      onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      placeholder="Ex: Cartão Nubank, Financiamento do Carro, Empréstimo..."
                      required
                    />
                  </div>

                  {/* Valor da Parcela e Número de Parcelas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                        💰 Valor de Cada Parcela *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formulario.valorParcela}
                        onChange={(e) => setFormulario({ ...formulario, valorParcela: e.target.value })}
                        onBlur={calcularValorTotal}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                        placeholder="Ex: 250,00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                        🔢 Quantidade de Parcelas *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formulario.numeroParcelas}
                        onChange={(e) => setFormulario({ ...formulario, numeroParcelas: e.target.value })}
                        onBlur={calcularValorTotal}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                        placeholder="Ex: 12"
                        required
                      />
                    </div>
                  </div>

                  {/* Valor Total (Calculado) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                      💵 Valor Total da Dívida (Calculado Automaticamente)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formulario.valorTotal}
                      readOnly
                      className="w-full border-2 border-green-300 bg-green-50 rounded-lg px-4 py-3 text-green-800 font-semibold cursor-not-allowed"
                      placeholder="R$ 0,00"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Este valor é calculado automaticamente: Valor da Parcela × Quantidade de Parcelas
                    </p>
                  </div>

                  {/* Parcelas já pagas e Data */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        ✅ Parcelas Já Pagas
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formulario.parcelasJaPagas}
                        onChange={(e) => setFormulario({ ...formulario, parcelasJaPagas: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Quantas parcelas você já pagou desta dívida?
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        📅 Data da Próxima Parcela *
                      </label>
                      <input
                        type="date"
                        value={formulario.dataProximaParcela}
                        onChange={(e) => setFormulario({ ...formulario, dataProximaParcela: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      🏷️ Categoria (Opcional)
                    </label>
                    <SeletorCategoria
                      categorias={categorias}
                      categoriaSelecionada={formulario.categoriaId}
                      onChange={(id: string) => setFormulario({ ...formulario, categoriaId: id })}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2 sm:py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 rounded-lg transition-colors font-semibold text-sm sm:text-base"
                    >
                      💾 Cadastrar Dívida
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
