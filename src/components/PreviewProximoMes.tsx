'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarDays, TrendingUp, TrendingDown, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

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

interface PreviewProximoMesProps {
  darkMode?: boolean;
  mesAtual: number;
  anoAtual: number;
}

export default function PreviewProximoMes({ darkMode = false, mesAtual, anoAtual }: PreviewProximoMesProps) {
  const { data: session } = useSession();
  const [transacoesFuturas, setTransacoesFuturas] = useState<TransacaoFutura[]>([]);
  const [expandido, setExpandido] = useState(false);
  const [loading, setLoading] = useState(true);

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
  }, [session, mesAtual, anoAtual]);

  const carregarTransacoesFuturas = async () => {
    try {
      const { mes: proximoMes, ano: proximoAno } = calcularProximoMes();
      
      // Chamada para API com o mês seguinte
      const response = await fetch(`/api/transacoes/preview-proximo-mes?mes=${proximoMes}&ano=${proximoAno}`);
      
      if (response.ok) {
        const data = await response.json();
        setTransacoesFuturas(data.transacoes || []);
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
      }
    } catch (error) {
      console.error('❌ Erro ao carregar transações futuras:', error);
      setTransacoesFuturas([]);
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
          
          <button
            onClick={() => setExpandido(!expandido)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            {expandido ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
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

      {/* Lista Detalhada (expandível) */}
      {expandido && (
        <div className={`border-t px-6 pb-6 ${
          darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}>
          <div className="space-y-3 mt-4">
            {transacoesFuturas.map((transacao) => (
              <div 
                key={transacao.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    transacao.tipo === 'receita'
                      ? (darkMode ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                      : (darkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-700')
                  }`}>
                    {transacao.tipo === 'receita' ? '+' : '-'}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transacao.titulo}
                    </p>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {transacao.categoria} • {transacao.dataVencimento.toLocaleDateString('pt-BR')}
                      {transacao.isRecorrente && ' • Recorrente'}
                      {transacao.status === 'pendente' && ' • Pendente'}
                    </p>
                    {transacao.observacao && (
                      <p className={`text-xs italic ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {transacao.observacao}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`font-bold ${
                  transacao.tipo === 'receita'
                    ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                    : (darkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(transacao.valor))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
