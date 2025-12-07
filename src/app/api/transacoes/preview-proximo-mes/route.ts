import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inicioMesBrasil, fimMesBrasil } from '@/lib/dateUtils';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

// Force no cache para sempre ter dados atualizados
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Pegar parâmetros de mês e ano da URL
    const { searchParams } = new URL(request.url);
    const mes = parseInt(searchParams.get('mes') || '0');
    const ano = parseInt(searchParams.get('ano') || '0');
    
    if (!mes || !ano) {
      return NextResponse.json({ error: 'Parâmetros mês e ano são obrigatórios' }, { status: 400 });
    }
    
    // Calcular o período do mês especificado
    // Usar helpers com timezone BR para não perder parcelas no limite do mês
    const inicioMes = inicioMesBrasil(ano, mes);
    const fimMes = fimMesBrasil(ano, mes);

    console.log('🔍 PREVIEW - Parâmetros de busca:', {
      mes,
      ano,
      inicioMes: inicioMes.toISOString(),
      fimMes: fimMes.toISOString(),
      inicioMesBR: inicioMes.toLocaleString('pt-BR'),
      fimMesBR: fimMes.toLocaleString('pt-BR')
    });

    // Buscar transações recorrentes ativas que deveriam gerar transações no mês
    const transacoesRecorrentes = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: userId,
        isActive: true,
        dataInicio: { lte: fimMes }, // Só incluir recorrentes que já começaram
        OR: [
          { dataFim: null }, // Sem data fim
          { dataFim: { gte: inicioMes } } // Data fim após o início do mês
        ]
      },
      include: {
        categoria: true
      }
    });

    // Buscar TODAS as parcelas de dívidas pendentes que vencem no mês (não pagas)
    const dividasDoMes = await prisma.parcelaDivida.findMany({
      where: {
        divida: {
          userId: userId,
          status: 'ATIVA'
        },
        dataVencimento: {
          gte: inicioMes,
          lte: fimMes
        },
        // Também traz vencidas para evitar perder parcelas marcadas incorretamente
        status: { in: ['PENDENTE', 'VENCIDA'] }
      },
      include: {
        divida: {
          include: { categoria: true }
        }
      }
    });

    console.log('🔍 PREVIEW - Dívidas encontradas:', {
      total: dividasDoMes.length,
      parcelas: dividasDoMes.map(p => ({
        divida: p.divida.nome,
        parcela: p.numero,
        valor: p.valor,
        vencimento: p.dataVencimento.toLocaleDateString('pt-BR'),
        status: p.status
      }))
    });

    // ✅ NOVA LÓGICA: Buscar dívidas que foram convertidas para recorrentes (evitar contagem dupla)
    const dividasConvertidas = new Set<string>();
    const recorrentesGeradas = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: userId,
        isActive: true,
        descricao: {
          contains: '- Parcela' // Buscar por padrão de parcela ao invés de emoji
        }
      }
    });
    
    // Extrair nomes das dívidas convertidas
    recorrentesGeradas.forEach(rec => {
      if (rec.descricao) {
        // Tentar múltiplos padrões de match
        const patterns = [
          /💳 (.+) - Parcela/,
          /(.+) - Parcela \d+/,
          /Dívida: (.+) - Parcela/
        ];
        
        for (const pattern of patterns) {
          const match = rec.descricao.match(pattern);
          if (match) {
            const nomeDivida = match[1].trim();
            const dividaConvertida = dividasDoMes.find(d => 
              d.divida.nome.toLowerCase().trim() === nomeDivida.toLowerCase().trim()
            );
            if (dividaConvertida) {
              dividasConvertidas.add(dividaConvertida.divida.id);
              break;
            }
          }
        }
      }
    });

    // DEBUG: Log das dívidas convertidas para evitar duplicação
    console.log('🔍 PREVIEW - Análise de dívidas:', {
      totalRecorrentes: recorrentesGeradas.length,
      totalDividasEncontradas: dividasDoMes.length,
      dividasConvertidasIds: Array.from(dividasConvertidas),
      recorrentesComParcela: recorrentesGeradas.map(r => r.descricao),
      nomesDividas: dividasDoMes.map(d => d.divida.nome)
    });

    // Buscar compromissos e metas com vencimento no mês
    const metasDoMes = await prisma.meta.findMany({
      where: {
        userId: userId,
        isCompleted: false,
        dataAlvo: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    // Verificar se existem transações reais já lançadas no mês
    const transacoesReaisExistentes = await prisma.transacao.findMany({
      where: {
        userId: userId,
        data: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      select: {
        id: true,
        descricao: true,
        valor: true,
        data: true
      }
    });

    // Converter transações recorrentes que ainda não foram lançadas para o formato esperado
    const transacoesFuturas = transacoesRecorrentes
      .filter(recorrente => {
        // CORREÇÃO: Melhorar a lógica de verificação se já foi lançada
        const jaLancada = transacoesReaisExistentes.some(real => {
          // Verificação mais precisa baseada na descrição completa
          const descricaoRecorrente = recorrente.descricao?.toLowerCase().trim() || '';
          const descricaoReal = real.descricao?.toLowerCase().trim() || '';
          const valorRecorrente = Math.abs(Number(recorrente.valor));
          const valorReal = Math.abs(Number(real.valor));
          
          // Verificar se é a mesma transação (mesmo valor E descrição similar)
          const mesmoValor = Math.abs(valorRecorrente - valorReal) < 0.01;
          const descricaoSimilar = descricaoRecorrente && descricaoReal && 
            (descricaoReal.includes(descricaoRecorrente) || 
             descricaoRecorrente.includes(descricaoReal));
          
          return mesmoValor && descricaoSimilar;
        });
        
        console.log(`🔍 RECORRENTE [${recorrente.descricao}]: ${jaLancada ? 'JÁ LANÇADA' : 'PENDENTE'}`);
        return !jaLancada; // Só incluir se ainda não foi lançada
      })
      .map(recorrente => {
        // Calcular próxima data baseada na frequência
        let proximaData = new Date(inicioMes);
        
        switch (recorrente.frequencia) {
          case 'mensal':
            // Para mensal, usar o dia de início como referência
            const diaInicio = recorrente.dataInicio.getDate();
            proximaData.setDate(Math.min(diaInicio, fimMes.getDate()));
            break;
          case 'semanal':
            // Calcular próxima data semanal baseada no dia da semana
            const diaSemanaInicio = recorrente.dataInicio.getDay();
            proximaData.setDate(proximaData.getDate() + (diaSemanaInicio - proximaData.getDay() + 7) % 7);
            break;
          case 'anual':
            proximaData = new Date(recorrente.dataInicio);
            proximaData.setFullYear(ano);
            break;
          default:
            // Para outras frequências, usar o dia 1
            proximaData.setDate(1);
        }

        return {
          id: `rec_${recorrente.id}`,
          titulo: `${recorrente.descricao || 'Transação recorrente'} (Recorrente)`,
          valor: Number(recorrente.valor),
          tipo: recorrente.tipo,
          categoria: recorrente.categoria?.nome || 'Sem categoria',
          dataVencimento: proximaData,
          isRecorrente: true
        };
      });

    // ✅ CORREÇÃO: Adicionar APENAS dívidas que NÃO foram convertidas para recorrentes
    const dividasFuturas = dividasDoMes
      .filter(parcela => {
        const isConvertida = dividasConvertidas.has(parcela.divida.id);
        console.log(`🔍 Parcela ${parcela.divida.nome} #${parcela.numero}: ${isConvertida ? 'CONVERTIDA (ignorando)' : 'INCLUINDO'}`);
        return !isConvertida;
      })
      .map((parcela: any) => ({
        id: `div_${parcela.id}`,
        titulo: `${parcela.divida.nome} (Parcela ${parcela.numero || 'N/A'})`,
        valor: Number(parcela.valor),
        tipo: 'despesa' as const,
        categoria: parcela.divida.categoria?.nome || 'Dívidas',
        dataVencimento: parcela.dataVencimento,
        isRecorrente: false,
        status: 'pendente',
        observacao: `Vence em ${new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}`  
      }));    // Adicionar metas como lembretes (não afetam saldo)
    const metasFuturas = metasDoMes.map((meta: any) => ({
      id: `meta_${meta.id}`,
      titulo: `Meta: ${meta.nome}`,
      valor: Number(meta.valorAlvo),
      tipo: 'receita' as const, // Representa economia/meta
      categoria: 'Metas',
      dataVencimento: meta.dataAlvo,
      isRecorrente: false
    }));

    const todasTransacoes = [
      ...transacoesFuturas,
      ...dividasFuturas
      // Metas removidas do cálculo por enquanto
    ];

    // Ordenar por data
    todasTransacoes.sort((a, b) => 
      new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
    );

    const dataPreview = new Date(ano, mes - 1);
    const mesPreview = dataPreview.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });

    console.log(`📊 PREVIEW [${mesPreview}]:`, {
      recorrentesEncontradas: transacoesRecorrentes.length,
      recorrentesPendentes: transacoesFuturas.length,
      dividasEncontradas: dividasDoMes.length,
      dividasPendentes: dividasFuturas.length,
      transacoesReaisJaLancadas: transacoesReaisExistentes.length,
      totalItens: todasTransacoes.length,
      dividasConvertidas: Array.from(dividasConvertidas)
    });

    return NextResponse.json({
      success: true,
      transacoes: todasTransacoes,
      mesPreview,
      resumo: {
        totalReceitas: todasTransacoes
          .filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + t.valor, 0),
        totalDespesas: todasTransacoes
          .filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + t.valor, 0),
        totalItens: todasTransacoes.length,
        dividasConvertidas: Array.from(dividasConvertidas),
        debug: {
          recorrentesEncontradas: transacoesRecorrentes.length,
          recorrentesPendentes: transacoesFuturas.length,
          dividasEncontradas: dividasDoMes.length,
          dividasPendentes: dividasFuturas.length
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar preview do próximo mês:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
