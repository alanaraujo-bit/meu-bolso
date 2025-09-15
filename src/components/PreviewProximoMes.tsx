'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarDays, TrendingUp, TrendingDown, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles, Database, Code, Info } from 'lucide-react';

interface TransacaoFutura {
  id: string;
  titulo: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  dataVencimento: Date;
  isRecorrente: boolean;
  status?: string;
  observacao?: string;
}

interface DadosDebug {
  endpoint: string;
  dataConsulta: string;
  totalRecorrentes?: number;
  totalDividas?: number;
  dividasConvertidas?: string[];
  fontesDados: string[];
  transacoesDetalhadas: TransacaoFutura[];
  calculos: {
    totalReceitas: number;
    totalDespesas: number;
    saldoPrevisao: number;
  };
}

interface PreviewProximoMesProps {
  darkMode?: boolean;
  mesAtual: number;
  anoAtual: number;
  forceRefresh?: number; // Prop para forçar atualização quando há mudanças
}

export default function PreviewProximoMes({ darkMode = false, mesAtual, anoAtual, forceRefresh = 0 }: PreviewProximoMesProps) {
  const { data: session } = useSession();
  const [transacoesFuturas, setTransacoesFuturas] = useState<TransacaoFutura[]>([]);
  const [mostrarDebug, setMostrarDebug] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dadosDebug, setDadosDebug] = useState<DadosDebug | null>(null);

  // Calcular o mês seguinte
  const calcularProximoMes = () => {
    let proximoMes = mesAtual;
    let proximoAno = anoAtual;
    
    if (mesAtual === 12) {
      proximoMes = 1;
      proximoAno = anoAtual + 1;
    } else {
      proximoMes = mesAtual + 1;
    }
    
    return { mes: proximoMes, ano: proximoAno };
  };

  useEffect(() => {
    if (session?.user?.id) {
      carregarTransacoesFuturas();
    }
  }, [session, mesAtual, anoAtual, forceRefresh]); // Adicionado forceRefresh como dependência

  const carregarTransacoesFuturas = async () => {
    try {
      const { mes: proximoMes, ano: proximoAno } = calcularProximoMes();
      
      // Chamada para API com o mês seguinte
      const response = await fetch(`/api/transacoes/preview-proximo-mes?mes=${proximoMes}&ano=${proximoAno}`);
      
      if (response.ok) {
        const data = await response.json();
        setTransacoesFuturas(data.transacoes || []);
        
        // Preparar dados de debug
        const totalReceitas = (data.transacoes || [])
          .filter((t: TransacaoFutura) => t.tipo === 'receita')
          .reduce((acc: number, t: TransacaoFutura) => acc + t.valor, 0);
        
        const totalDespesas = (data.transacoes || [])
          .filter((t: TransacaoFutura) => t.tipo === 'despesa')
          .reduce((acc: number, t: TransacaoFutura) => acc + t.valor, 0);

        setDadosDebug({
          endpoint: `/api/transacoes/preview-proximo-mes?mes=${proximoMes}&ano=${proximoAno}`,
          dataConsulta: new Date().toLocaleString('pt-BR'),
          totalRecorrentes: (data.transacoes || []).filter((t: TransacaoFutura) => t.isRecorrente).length,
          totalDividas: (data.transacoes || []).filter((t: TransacaoFutura) => !t.isRecorrente && t.categoria === 'Dívidas').length,
          transacoesDetalhadas: data.transacoes || [],
          fontesDados: [
            'Transações Recorrentes Ativas',
            'Parcelas de Dívidas Pendentes', 
            'Filtro: Apenas não lançadas no mês',
            'Exclusão: Dívidas convertidas para recorrentes'
          ],
          calculos: {
            totalReceitas,
            totalDespesas,
            saldoPrevisao: totalReceitas - totalDespesas
          }
        });
      } else {
        // Mock de dados caso a API não funcione
        const dataProximoMes = new Date(proximoAno, proximoMes - 1);
        
        const mockData: TransacaoFutura[] = [
          {
            id: '1',
            titulo: 'Aluguel',
            valor: 1200,
            tipo: 'despesa',
            categoria: 'Moradia',
            dataVencimento: new Date(proximoAno, proximoMes - 1, 5),
            isRecorrente: true
          },
          {
            id: '2',
            titulo: 'Salário',
            valor: 3500,
            tipo: 'receita',
            categoria: 'Trabalho',
            dataVencimento: new Date(proximoAno, proximoMes - 1, 1),
            isRecorrente: true
          },
          {
            id: '3',
            titulo: 'Netflix',
            valor: 29.90,
            tipo: 'despesa',
            categoria: 'Entretenimento',
            dataVencimento: new Date(proximoAno, proximoMes - 1, 15),
            isRecorrente: true
          },
          {
            id: '4',
            titulo: 'Cartão de Crédito',
            valor: 450,
            tipo: 'despesa',
            categoria: 'Cartão',
            dataVencimento: new Date(proximoAno, proximoMes - 1, 10),
            isRecorrente: true
          }
        ];
        
        setTransacoesFuturas(mockData);
        
        // Mock de dados debug
        setDadosDebug({
          endpoint: `MOCK - API não funcionou`,
          dataConsulta: new Date().toLocaleString('pt-BR'),
          totalRecorrentes: 4,
          totalDividas: 1,
          transacoesDetalhadas: mockData,
          fontesDados: [
            'Dados simulados (MOCK)',
            'API não respondeu corretamente'
          ],
          calculos: {
            totalReceitas: 3500,
            totalDespesas: 1679.90,
            saldoPrevisao: 1820.10
          }
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar transações futuras:', error);
      setTransacoesFuturas([]);
      setDadosDebug(null);
    } finally {
      setLoading(false);
    }
  };

  const totalReceitas = transacoesFuturas
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoesFuturas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoPrevisao = totalReceitas - totalDespesas;

  // Formatar o nome do mês seguinte baseado no período atual do dashboard
  const { mes: proximoMes, ano: proximoAno } = calcularProximoMes();
  const dataProximoMes = new Date(proximoAno, proximoMes - 1);
  const nomeProximoMes = dataProximoMes.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função helper para formatar data de forma segura
  const formatDateSafe = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 mb-6 backdrop-blur-sm border transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800/40 border-gray-700/50' 
          : 'bg-white/60 border-white/60'
      }`}>
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando preview...
          </span>
        </div>
      </div>
    );
  }

  if (transacoesFuturas.length === 0) {
    return (
      <div className={`rounded-2xl p-6 mb-6 backdrop-blur-sm border transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800/40 border-gray-700/50' 
          : 'bg-white/60 border-white/60'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'
          }`}>
            <CalendarDays className={`w-5 h-5 ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Preview {nomeProximoMes}
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Nenhuma transação recorrente configurada para o próximo mês
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-xl border-l-4 border-emerald-500 mb-6 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
      darkMode 
        ? 'bg-gray-800/40 border-gray-700/50' 
        : 'bg-white/60 border-white/60'
    }`}>
      {/* Header do Preview */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-emerald-600/20' : 'bg-emerald-100'
            }`}>
              <CalendarDays className={`w-5 h-5 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Preview {nomeProximoMes}
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Transações recorrentes e compromissos futuros
              </p>
            </div>
          </div>
          
          {/* Botão único para mostrar/ocultar dados detalhados */}
          <button
            onClick={() => setMostrarDebug(!mostrarDebug)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title={mostrarDebug ? "Ocultar detalhes" : "Ver dados detalhados"}
          >
            <Database className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo dos Totais */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-gray-700/30' : 'bg-emerald-50/80'
          }`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Receitas</span>
            </div>
            <p className={`font-bold ${
              darkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              {formatCurrency(totalReceitas)}
            </p>
          </div>

          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-gray-700/30' : 'bg-red-50/80'
          }`}>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Despesas</span>
            </div>
            <p className={`font-bold ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              {formatCurrency(totalDespesas)}
            </p>
          </div>

          <div className={`p-3 rounded-xl ${
            darkMode ? 'bg-gray-700/30' : 'bg-blue-50/80'
          }`}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className={`text-xs font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Saldo</span>
            </div>
            <p className={`font-bold ${
              saldoPrevisao >= 0 
                ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                : (darkMode ? 'text-red-400' : 'text-red-600')
            }`}>
              {formatCurrency(saldoPrevisao)}
            </p>
          </div>
        </div>
      </div>

      {/* Seção Simplificada - Apenas Lista de Transações */}
      {mostrarDebug && dadosDebug && (
        <div className={`border-t border-b px-6 py-4 ${
          darkMode ? 'border-gray-700/50 bg-gray-900/30' : 'border-gray-200/50 bg-gray-50/80'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-500" />
            <h4 className={`font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              � Transações Encontradas ({dadosDebug.transacoesDetalhadas.length})
            </h4>
          </div>
          
          {dadosDebug.transacoesDetalhadas.length === 0 ? (
            <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Nenhuma transação encontrada para outubro de 2025
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dadosDebug.transacoesDetalhadas.map((transacao, index) => (
                <div 
                  key={`${transacao.id}-${index}`}
                  className={`p-3 rounded-lg border-l-4 ${
                    transacao.tipo === 'receita'
                      ? 'border-emerald-500 bg-emerald-50/10'
                      : 'border-red-500 bg-red-50/10'
                  } ${darkMode ? 'bg-gray-800/30' : 'bg-white/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {transacao.titulo}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          � {transacao.categoria}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          📅 {formatDateSafe(transacao.dataVencimento)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          transacao.isRecorrente 
                            ? (darkMode ? 'bg-blue-700 text-blue-300' : 'bg-blue-100 text-blue-700')
                            : (darkMode ? 'bg-orange-700 text-orange-300' : 'bg-orange-100 text-orange-700')
                        }`}>
                          {transacao.isRecorrente ? '🔄 Recorrente' : '💳 Dívida'}
                        </span>
                      </div>
                      <p className={`text-xs font-mono mt-1 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        ID: {transacao.id}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-lg font-bold ${
                        transacao.tipo === 'receita'
                          ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                          : (darkMode ? 'text-red-400' : 'text-red-600')
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(transacao.valor))}
                      </p>
                      <p className={`text-xs uppercase font-semibold ${
                        transacao.tipo === 'receita'
                          ? (darkMode ? 'text-emerald-300' : 'text-emerald-500')
                          : (darkMode ? 'text-red-300' : 'text-red-500')
                      }`}>
                        {transacao.tipo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
