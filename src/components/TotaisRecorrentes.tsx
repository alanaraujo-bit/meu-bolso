'use client';

import { useState, useEffect } from 'react';
import CleanLoading from './CleanLoading';

interface DadosMensal {
  mes: number;
  ano: number;
  mesNome: string;
  mesAbbr: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  contadorReceitas: number;
  contadorDespesas: number;
  totalTransacoes: number;
  categorias: Array<{
    nome: string;
    cor: string;
    icone: string;
    receitas: number;
    despesas: number;
    contadorReceitas: number;
    contadorDespesas: number;
  }>;
}

interface Estatisticas {
  mediaReceitasMensal: number;
  mediaDespesasMensal: number;
  mediaSaldoMensal: number;
  mediaTransacoesMensal: number;
  totalReceitasAno: number;
  totalDespesasAno: number;
  totalTransacoesAno: number;
  melhorMes: DadosMensal;
  piorMes: DadosMensal;
  recorrentesAtivas: number;
  recorrentesReceitas: number;
  recorrentesDespesas: number;
}

interface TotaisRecorrentesProps {
  onClose?: () => void;
  darkMode?: boolean;
}

export default function TotaisRecorrentes({ onClose, darkMode = false }: TotaisRecorrentesProps) {
  const [dadosMensais, setDadosMensais] = useState<DadosMensal[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mesesVisualizacao, setMesesVisualizacao] = useState(12);
  const [mesSelecionado, setMesSelecionado] = useState<DadosMensal | null>(null);

  useEffect(() => {
    buscarTotais();
  }, [mesesVisualizacao]);

  const buscarTotais = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recorrentes/totais?meses=${mesesVisualizacao}`);
      const data = await response.json();

      if (response.ok) {
        setDadosMensais(data.dadosMensais);
        setEstatisticas(data.estatisticas);
        setErro('');
      } else {
        setErro(data.error || 'Erro ao carregar dados');
      }
    } catch (error) {
      setErro('Erro ao carregar totais recorrentes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return (
      <div className={`rounded-lg shadow-md p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 relative mr-3">
            <div className={`absolute inset-0 border-2 rounded-full ${
              darkMode ? 'border-gray-600' : 'border-blue-200'
            }`}></div>
            <div className={`absolute inset-0 border-2 border-transparent rounded-full animate-spin ${
              darkMode ? 'border-t-blue-400' : 'border-t-blue-500'
            }`}></div>
          </div>
          <span className={`text-sm ${
            darkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>Carregando totais...</span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={`rounded-lg shadow-md p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Erro ao carregar dados</h3>
          <p>{erro}</p>
          <button
            onClick={buscarTotais}
            className={`mt-3 px-4 py-2 text-white rounded transition-colors ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-md ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              📊 Totais de Transações Recorrentes
            </h2>
            <p className={`mt-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Projeção de receitas e despesas recorrentes por mês
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={mesesVisualizacao}
              onChange={(e) => setMesesVisualizacao(parseInt(e.target.value))}
              className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
              <option value={24}>24 meses</option>
            </select>
            {onClose && (
              <button
                onClick={onClose}
                className={`text-xl transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Resumo */}
      {estatisticas && (
        <div className={`p-6 border-b ${
          darkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatarMoeda(estatisticas.mediaReceitasMensal)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Receitas/mês</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatarMoeda(estatisticas.mediaDespesasMensal)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Despesas/mês</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                estatisticas.mediaSaldoMensal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatarMoeda(estatisticas.mediaSaldoMensal)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Saldo médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(estatisticas.mediaTransacoesMensal)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Transações/mês</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`text-center p-3 rounded ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`font-semibold ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>Recorrentes Ativas</div>
              <div className="text-lg">{estatisticas.recorrentesAtivas}</div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {estatisticas.recorrentesReceitas} receitas • {estatisticas.recorrentesDespesas} despesas
              </div>
            </div>
            <div className={`text-center p-3 rounded ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="font-semibold text-green-700">Melhor Mês</div>
              <div className="text-lg">{estatisticas.melhorMes.mesAbbr}</div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatarMoeda(estatisticas.melhorMes.saldo)}
              </div>
            </div>
            <div className={`text-center p-3 rounded ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="font-semibold text-red-700">Pior Mês</div>
              <div className="text-lg">{estatisticas.piorMes.mesAbbr}</div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatarMoeda(estatisticas.piorMes.saldo)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Dados Mensais */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <th className={`text-left py-3 px-2 font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Mês</th>
                <th className="text-right py-3 px-2 font-semibold text-green-700">Receitas</th>
                <th className="text-right py-3 px-2 font-semibold text-red-700">Despesas</th>
                <th className="text-right py-3 px-2 font-semibold text-blue-700">Saldo</th>
                <th className={`text-right py-3 px-2 font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Transações</th>
                <th className={`text-center py-3 px-2 font-semibold ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosMensais.map((mes, index) => (
                <tr 
                  key={`${mes.ano}-${mes.mes}`}
                  className={`border-b transition-colors ${
                    darkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-100 hover:bg-gray-50'
                  } ${
                    index === 0 
                      ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50') 
                      : ''
                  }`}
                >
                  <td className="py-3 px-2">
                    <div className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mes.mesAbbr.charAt(0).toUpperCase() + mes.mesAbbr.slice(1)} {mes.ano}
                    </div>
                    {index === 0 && (
                      <div className="text-xs text-blue-600">Mês atual</div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="font-medium text-green-600">
                      {formatarMoeda(mes.totalReceitas)}
                    </div>
                    <div className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {mes.contadorReceitas} transações
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="font-medium text-red-600">
                      {formatarMoeda(mes.totalDespesas)}
                    </div>
                    <div className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {mes.contadorDespesas} transações
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className={`font-medium ${
                      mes.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatarMoeda(mes.saldo)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mes.totalTransacoes}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => setMesSelecionado(mes)}
                      className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Mês */}
      {mesSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Detalhes de {mesSelecionado.mesNome}
                </h3>
                <button
                  onClick={() => setMesSelecionado(null)}
                  className={`text-xl transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Resumo do mês */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`text-center p-4 rounded ${
                  darkMode ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <div className="text-lg font-bold text-green-600">
                    {formatarMoeda(mesSelecionado.totalReceitas)}
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {mesSelecionado.contadorReceitas} receitas
                  </div>
                </div>
                <div className={`text-center p-4 rounded ${
                  darkMode ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <div className="text-lg font-bold text-red-600">
                    {formatarMoeda(mesSelecionado.totalDespesas)}
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {mesSelecionado.contadorDespesas} despesas
                  </div>
                </div>
                <div className={`text-center p-4 rounded ${
                  mesSelecionado.saldo >= 0 
                    ? (darkMode ? 'bg-green-900/20' : 'bg-green-50')
                    : (darkMode ? 'bg-red-900/20' : 'bg-red-50')
                }`}>
                  <div className={`text-lg font-bold ${
                    mesSelecionado.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatarMoeda(mesSelecionado.saldo)}
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Saldo</div>
                </div>
              </div>

              {/* Categorias */}
              <div>
                <h4 className={`font-semibold mb-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Por Categoria</h4>
                <div className="space-y-2">
                  {mesSelecionado.categorias.map((categoria, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoria.icone}</span>
                        <span className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {categoria.nome}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        {categoria.receitas > 0 && (
                          <div className="text-green-600">
                            +{formatarMoeda(categoria.receitas)}
                          </div>
                        )}
                        {categoria.despesas > 0 && (
                          <div className="text-red-600">
                            -{formatarMoeda(categoria.despesas)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
