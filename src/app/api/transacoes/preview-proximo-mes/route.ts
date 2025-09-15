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

    // ✅ NOVA LÓGICA: Buscar parcelas de dívidas que vencem no mês, mas limitar para as 5 mais próximas
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
      },
      orderBy: {
        dataVencimento: 'asc' // Ordenar por data de vencimento (mais próximas primeiro)
      },
      take: 2 // Limitar para apenas as 2 parcelas mais próximas
    });

    // DEBUG: Log das parcelas filtradas (apenas as 2 mais próximas)
    console.log('🔍 PREVIEW - Parcelas mais próximas (máx 2):', {
      totalParcelas: dividasDoMes.length,
      limiteParcelas: 2,
      parcelas: dividasDoMes.map(p => ({
        nome: p.divida.nome,
        parcela: p.numero,
        vencimento: new Date(p.dataVencimento).toLocaleDateString('pt-BR'),
        valor: Number(p.valor)
      }))
    });

    // ✅ NOVA LÓGICA: Buscar dívidas que foram convertidas para recorrentes (evitar contagem dupla)
    const dividasConvertidas = new Set<string>();
    const recorrentesGeradas = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: userId,
        descricao: {
          contains: '💳'
        }
      }
    });
    
    // Extrair nomes das dívidas convertidas
    recorrentesGeradas.forEach(rec => {
      if (rec.descricao) {
        const match = rec.descricao.match(/💳 (.+) - Parcela/);
        if (match) {
          const nomeDivida = match[1];
          const dividaConvertida = dividasDoMes.find(d => d.divida.nome === nomeDivida);
          if (dividaConvertida) {
            dividasConvertidas.add(dividaConvertida.divida.id);
          }
        }
      }
    });

    // DEBUG: Log das dívidas convertidas para evitar duplicação
    console.log('🔍 PREVIEW - Dívidas convertidas para recorrentes:', {
      totalRecorrentes: recorrentesGeradas.length,
      totalDividas: dividasDoMes.length,
      dividasConvertidas: Array.from(dividasConvertidas),
      nomesDividasConvertidas: recorrentesGeradas.map(r => r.descricao).filter(d => d?.includes('💳'))
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
        // ✅ CORREÇÃO: Lógica mais específica para evitar false positives
        const jaLancada = transacoesReaisExistentes.some(real => {
          // Verificar se é exatamente a mesma transação (descrição E valor E tipo)
          const mesmaDescricao = real.descricao?.toLowerCase().trim() === recorrente.descricao?.toLowerCase().trim();
          const mesmoValor = Math.abs(Number(real.valor)) === Math.abs(Number(recorrente.valor));
          
          // Para ser considerada "já lançada", precisa ter descrição E valor idênticos
          return mesmaDescricao && mesmoValor;
        });
        
        // Log para debug
        if (jaLancada) {
          console.log(`🚫 Transação recorrente "${recorrente.descricao}" já foi lançada no mês ${mes}/${ano}`);
        }
        
        return !jaLancada; // Só incluir se ainda não foi lançada
      })
      .slice(0, 1) // ✅ LIMITE: Máximo 1 transação recorrente
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
      .filter(parcela => !dividasConvertidas.has(parcela.divida.id)) // Excluir convertidas
      .map((parcela: any) => {
        // Calcular quantos dias faltam para vencer
        const hoje = new Date();
        const dataVencimento = new Date(parcela.dataVencimento);
        const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        let statusVencimento = '';
        if (diasRestantes <= 0) {
          statusVencimento = 'Vencido! ⚠️';
        } else if (diasRestantes === 1) {
          statusVencimento = 'Vence amanhã! ⚠️';
        } else if (diasRestantes <= 3) {
          statusVencimento = `Vence em ${diasRestantes} dias ⚠️`;
        } else if (diasRestantes <= 7) {
          statusVencimento = `Vence em ${diasRestantes} dias`;
        } else {
          statusVencimento = `Vence em ${diasRestantes} dias`;
        }
        
        return {
          id: `div_${parcela.id}`,
          titulo: `${parcela.divida.nome} (Parcela ${parcela.numero || 'N/A'})`,
          valor: Number(parcela.valor),
          tipo: 'despesa' as const,
          categoria: 'Dívidas',
          dataVencimento: parcela.dataVencimento,
          isRecorrente: false,
          status: 'pendente',
          observacao: statusVencimento
        };
      });

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

    // ✅ LIMITE ABSOLUTO: Máximo 3 itens para manter interface limpa
    const transacoesLimitadas = todasTransacoes.slice(0, 3);
    
    console.log('🔒 LIMITE APLICADO:', {
      totalOriginal: todasTransacoes.length,
      totalLimitado: transacoesLimitadas.length,
      itensLimitados: transacoesLimitadas.map(t => ({
        titulo: t.titulo,
        valor: t.valor,
        vencimento: new Date(t.dataVencimento).toLocaleDateString('pt-BR')
      }))
    });

    const dataPreview = new Date(ano, mes - 1);
    const mesPreview = dataPreview.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });

    return NextResponse.json({
      success: true,
      transacoes: transacoesLimitadas, // ✅ USAR LISTA LIMITADA
      mesPreview,
      resumo: {
        totalReceitas: transacoesLimitadas
          .filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + t.valor, 0),
        totalDespesas: transacoesLimitadas
          .filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + t.valor, 0),
        totalItens: transacoesLimitadas.length,
        totalOriginal: todasTransacoes.length // Para debug
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
