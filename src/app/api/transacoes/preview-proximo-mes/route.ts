import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0);

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
        status: 'PENDENTE' // Apenas parcelas ainda não pagas
      },
      include: {
        divida: true
      }
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
        // Verificar se já existe uma transação real para esta recorrente no mês
        const jaLancada = transacoesReaisExistentes.some(real => 
          real.descricao?.toLowerCase().includes(recorrente.descricao?.toLowerCase() || '') ||
          Math.abs(Number(real.valor)) === Math.abs(Number(recorrente.valor))
        );
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

    // Adicionar TODAS as dívidas pendentes (parcelas não pagas)
    const dividasFuturas = dividasDoMes.map((parcela: any) => ({
      id: `div_${parcela.id}`,
      titulo: `${parcela.divida.nome} (Parcela ${parcela.numeroParcela || 'N/A'})`,
      valor: Number(parcela.valor),
      tipo: 'despesa' as const,
      categoria: 'Dívidas',
      dataVencimento: parcela.dataVencimento,
      isRecorrente: false,
      status: 'pendente',
      observacao: `Vence em ${new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}`
    }));

    // Adicionar metas como lembretes (não afetam saldo)
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
        totalItens: todasTransacoes.length
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
