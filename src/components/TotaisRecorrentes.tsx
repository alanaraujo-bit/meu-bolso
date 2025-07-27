'use client';

import { useState, useEffect } from 'react';

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
}

export default function TotaisRecorrentes({ onClose }: TotaisRecorrentesProps) {
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Erro ao carregar dados</h3>
          <p>{erro}</p>
          <button
            onClick={buscarTotais}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              📊 Totais de Transações Recorrentes
            </h2>
            <p className="text-gray-600 mt-1">
              Projeção de receitas e despesas recorrentes por mês
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={mesesVisualizacao}
              onChange={(e) => setMesesVisualizacao(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
              <option value={24}>24 meses</option>
            </select>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Resumo */}
      {estatisticas && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatarMoeda(estatisticas.mediaReceitasMensal)}
              </div>
              <div className="text-sm text-gray-600">Receitas/mês</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatarMoeda(estatisticas.mediaDespesasMensal)}
              </div>
              <div className="text-sm text-gray-600">Despesas/mês</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                estatisticas.mediaSaldoMensal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatarMoeda(estatisticas.mediaSaldoMensal)}
              </div>
              <div className="text-sm text-gray-600">Saldo médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(estatisticas.mediaTransacoesMensal)}
              </div>
              <div className="text-sm text-gray-600">Transações/mês</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded">
              <div className="font-semibold text-gray-700">Recorrentes Ativas</div>
              <div className="text-lg">{estatisticas.recorrentesAtivas}</div>
              <div className="text-xs text-gray-500">
                {estatisticas.recorrentesReceitas} receitas • {estatisticas.recorrentesDespesas} despesas
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-semibold text-green-700">Melhor Mês</div>
              <div className="text-lg">{estatisticas.melhorMes.mesAbbr}</div>
              <div className="text-xs text-gray-500">
                {formatarMoeda(estatisticas.melhorMes.saldo)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-semibold text-red-700">Pior Mês</div>
              <div className="text-lg">{estatisticas.piorMes.mesAbbr}</div>
              <div className="text-xs text-gray-500">
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
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Mês</th>
                <th className="text-right py-3 px-2 font-semibold text-green-700">Receitas</th>
                <th className="text-right py-3 px-2 font-semibold text-red-700">Despesas</th>
                <th className="text-right py-3 px-2 font-semibold text-blue-700">Saldo</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Transações</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dadosMensais.map((mes, index) => (
                <tr 
                  key={`${mes.ano}-${mes.mes}`}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index === 0 ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="py-3 px-2">
                    <div className="font-medium text-gray-900">
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
                    <div className="text-xs text-gray-500">
                      {mes.contadorReceitas} transações
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="font-medium text-red-600">
                      {formatarMoeda(mes.totalDespesas)}
                    </div>
                    <div className="text-xs text-gray-500">
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
                    <div className="font-medium text-gray-900">
                      {mes.totalTransacoes}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => setMesSelecionado(mes)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes de {mesSelecionado.mesNome}
                </h3>
                <button
                  onClick={() => setMesSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Resumo do mês */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">
                    {formatarMoeda(mesSelecionado.totalReceitas)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {mesSelecionado.contadorReceitas} receitas
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">
                    {formatarMoeda(mesSelecionado.totalDespesas)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {mesSelecionado.contadorDespesas} despesas
                  </div>
                </div>
                <div className={`text-center p-4 rounded ${
                  mesSelecionado.saldo >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className={`text-lg font-bold ${
                    mesSelecionado.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatarMoeda(mesSelecionado.saldo)}
                  </div>
                  <div className="text-sm text-gray-600">Saldo</div>
                </div>
              </div>

              {/* Categorias */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Por Categoria</h4>
                <div className="space-y-2">
                  {mesSelecionado.categorias.map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{categoria.icone}</span>
                        <span className="font-medium text-gray-900">
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
