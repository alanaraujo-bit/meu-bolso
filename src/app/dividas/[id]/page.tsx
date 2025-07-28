"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import CleanLoading from "@/components/CleanLoading";
import StatusBadge from "@/components/StatusBadge";
import SeletorCategoria from "@/components/SeletorCategoria";
import { 
  ArrowLeft,
  Save,
  Edit,
  Check,
  X,
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock
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
  cor: string;
  icone: string;
  tipo: string;
}

interface DividaDetalhes {
  id: string;
  nome: string;
  valorTotal: number;
  valorParcela: number;
  numeroParcelas: number;
  dataPrimeiraParcela: string;
  status: "ATIVA" | "QUITADA" | "CANCELADA";
  categoria?: Categoria;
  parcelas: ParcelaDivida[];
  estatisticas: {
    parcelasPagas: number;
    parcelasVencidas: number;
    valorPago: number;
    valorRestante: number;
    percentualQuitado: number;
    proximaParcelaVencimento?: ParcelaDivida;
  };
}

export default function DividaDetalhes() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [divida, setDivida] = useState<DividaDetalhes | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Estados para edição
  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const carregarDivida = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dividas/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setDivida(data);
        setNovoNome(data.nome);
        setNovaCategoria(data.categoria?.id || "");
      } else {
        console.error("Erro ao carregar dívida:", data.error);
        router.push("/dividas");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      router.push("/dividas");
    } finally {
      setLoading(false);
    }
  };

  const carregarCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
      const data = await response.json();
      if (response.ok) {
        setCategorias(data);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const salvarEdicaoNome = async () => {
    if (!novoNome.trim()) return;
    
    try {
      setSalvando(true);
      const response = await fetch(`/api/dividas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim() }),
      });

      if (response.ok) {
        setDivida(prev => prev ? { ...prev, nome: novoNome.trim() } : null);
        setEditandoNome(false);
      } else {
        console.error("Erro ao salvar nome");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setSalvando(false);
    }
  };

  const salvarEdicaoCategoria = async () => {
    try {
      setSalvando(true);
      const response = await fetch(`/api/dividas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoriaId: novaCategoria || null }),
      });

      if (response.ok) {
        const categoriaEncontrada = categorias.find(c => c.id === novaCategoria);
        setDivida(prev => prev ? { 
          ...prev, 
          categoria: categoriaEncontrada || undefined 
        } : null);
        setEditandoCategoria(false);
      } else {
        console.error("Erro ao salvar categoria");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setSalvando(false);
    }
  };

  const alterarStatusParcela = async (parcelaId: string, novoStatus: string) => {
    try {
      const response = await fetch(`/api/dividas/${params.id}/parcelas/${parcelaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        // Recarregar dados da dívida para atualizar estatísticas
        await carregarDivida();
      } else {
        console.error("Erro ao alterar status da parcela");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const getStatusParcelaColor = (parcela: ParcelaDivida) => {
    if (parcela.status === 'PAGA') return 'text-green-600 bg-green-50';
    if (parcela.status === 'VENCIDA') return 'text-red-600 bg-red-50';
    
    const hoje = new Date();
    const dataVencimento = new Date(parcela.dataVencimento);
    const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasParaVencimento <= 0) return 'text-red-600 bg-red-50';
    if (diasParaVencimento <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  useEffect(() => {
    if (session) {
      carregarDivida();
      carregarCategorias();
    }
  }, [session, params.id]);

  if (loading) {
    return <CleanLoading text="Carregando dívida..." fullScreen />;
  }

  if (!divida) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dívida não encontrada</h2>
          <button
            onClick={() => router.push("/dividas")}
            className="text-blue-600 hover:text-blue-800"
          >
            Voltar para dívidas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dividas")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Voltar para dívidas
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Detalhes da Dívida</h1>
              <StatusBadge 
                status={divida.status === 'ATIVA' ? 'pending' : 'completed'}
              />
            </div>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Detalhes da Dívida */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h2>
            
            {/* Nome da Dívida */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Dívida</label>
              {editandoNome ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={salvando}
                  />
                  <button
                    onClick={salvarEdicaoNome}
                    disabled={salvando || !novoNome.trim()}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditandoNome(false);
                      setNovoNome(divida.nome);
                    }}
                    disabled={salvando}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-gray-900">{divida.nome}</span>
                  <button
                    onClick={() => setEditandoNome(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Categoria */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              {editandoCategoria ? (
                <div className="flex items-center gap-2">
                  <SeletorCategoria
                    categorias={categorias}
                    categoriaSelecionada={novaCategoria}
                    onChange={setNovaCategoria}
                    tipo="despesa"
                  />
                  <button
                    onClick={salvarEdicaoCategoria}
                    disabled={salvando}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditandoCategoria(false);
                      setNovaCategoria(divida.categoria?.id || "");
                    }}
                    disabled={salvando}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    {divida.categoria ? (
                      <span className="flex items-center gap-2 text-gray-900">
                        <span>{divida.categoria.icone}</span>
                        {divida.categoria.nome}
                      </span>
                    ) : (
                      <span className="text-gray-500">Sem categoria</span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditandoCategoria(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Informações Financeiras */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="block text-sm font-medium text-gray-700">Valor Total</span>
                <span className="text-lg font-bold text-red-600">{formatarMoeda(divida.valorTotal)}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">Valor da Parcela</span>
                <span className="text-lg font-bold text-gray-900">{formatarMoeda(divida.valorParcela)}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">Número de Parcelas</span>
                <span className="text-lg font-bold text-gray-900">{divida.numeroParcelas}x</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">Data da Primeira Parcela</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Date(divida.dataPrimeiraParcela).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{divida.estatisticas.percentualQuitado}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${divida.estatisticas.percentualQuitado}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{divida.estatisticas.parcelasPagas}</div>
                  <div className="text-xs text-gray-600">Parcelas Pagas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{divida.estatisticas.parcelasVencidas}</div>
                  <div className="text-xs text-gray-600">Vencidas</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-1">Valor Pago</div>
                <div className="text-lg font-bold text-green-600">
                  {formatarMoeda(divida.estatisticas.valorPago)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Valor Restante</div>
                <div className="text-lg font-bold text-red-600">
                  {formatarMoeda(divida.estatisticas.valorRestante)}
                </div>
              </div>

              {divida.estatisticas.proximaParcelaVencimento && (
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600 mb-2">Próxima Parcela</div>
                  <div className="text-sm">
                    <div className="font-medium">
                      Parcela {divida.estatisticas.proximaParcelaVencimento.numero}
                    </div>
                    <div className="text-gray-600">
                      {new Date(divida.estatisticas.proximaParcelaVencimento.dataVencimento).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="font-bold text-gray-900">
                      {formatarMoeda(divida.estatisticas.proximaParcelaVencimento.valor)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Parcelas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Parcelas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcela
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {divida.parcelas.map((parcela) => (
                  <tr key={parcela.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{parcela.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatarMoeda(parcela.valor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusParcelaColor(parcela)}`}>
                        {parcela.status === 'PAGA' && <CheckCircle size={12} className="mr-1" />}
                        {parcela.status === 'VENCIDA' && <AlertTriangle size={12} className="mr-1" />}
                        {parcela.status === 'PENDENTE' && <Clock size={12} className="mr-1" />}
                        {parcela.status === 'PAGA' ? 'Paga' : 
                         parcela.status === 'VENCIDA' ? 'Vencida' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {parcela.status === 'PENDENTE' && (
                          <button
                            onClick={() => alterarStatusParcela(parcela.id, 'PAGA')}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como paga"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {parcela.status === 'PAGA' && (
                          <button
                            onClick={() => alterarStatusParcela(parcela.id, 'PENDENTE')}
                            className="text-gray-600 hover:text-gray-900"
                            title="Marcar como pendente"
                          >
                            <Clock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
