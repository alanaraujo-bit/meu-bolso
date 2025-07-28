import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


// Função para calcular próxima data baseada na frequência
function calcularProximaData(ultimaData: Date, frequencia: string): Date {
  const novaData = new Date(ultimaData);
  
  switch (frequencia) {
    case 'diaria':
      novaData.setDate(novaData.getDate() + 1);
      break;
    case 'semanal':
      novaData.setDate(novaData.getDate() + 7);
      break;
    case 'quinzenal':
      novaData.setDate(novaData.getDate() + 15);
      break;
    case 'mensal':
      novaData.setMonth(novaData.getMonth() + 1);
      break;
    case 'trimestral':
      novaData.setMonth(novaData.getMonth() + 3);
      break;
    case 'semestral':
      novaData.setMonth(novaData.getMonth() + 6);
      break;
    case 'anual':
      novaData.setFullYear(novaData.getFullYear() + 1);
      break;
    default:
      break;
  }
  
  return novaData;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mesParam = searchParams.get('mes');
    const anoParam = searchParams.get('ano');
    
    if (!mesParam || !anoParam) {
      return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 });
    }

    const mes = parseInt(mesParam);
    const ano = parseInt(anoParam);

    if (mes < 1 || mes > 12) {
      return NextResponse.json({ error: 'Mês deve estar entre 1 e 12' }, { status: 400 });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Datas para o período solicitado
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59);

    // Buscar transações reais do mês
    const transacoesReais = await prisma.transacao.findMany({
      where: {
        userId: usuario.id,
        data: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      include: {
        categoria: true
      },
      orderBy: {
        data: 'desc'
      }
    });

    // Buscar transações recorrentes para projetar no mês
    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: usuario.id,
        isActive: true,
        dataInicio: { lte: fimMes }, // Recorrentes que já começaram ou começam até o fim do mês
        OR: [
          { dataFim: null }, // Sem data fim
          { dataFim: { gte: inicioMes } } // Ou que terminam depois do início do mês
        ]
      },
      include: {
        categoria: true
      }
    });

    // Gerar projeções das transações recorrentes para o mês
    const projecoes = [];
    for (const recorrente of recorrentes) {
      let dataProjecao = new Date(recorrente.dataInicio);
      
      // Avançar até o mês solicitado se necessário
      while (dataProjecao < inicioMes) {
        dataProjecao = calcularProximaData(dataProjecao, recorrente.frequencia);
      }
      
      // Gerar todas as ocorrências do mês
      while (dataProjecao <= fimMes) {
        // Verificar se está dentro do período de validade
        if (recorrente.dataFim && dataProjecao > recorrente.dataFim) {
          break;
        }
        
        // Verificar se já existe uma transação real para esta data
        const transacaoExistente = transacoesReais.find(t => 
          t.recorrenteId === recorrente.id &&
          t.data.toDateString() === dataProjecao.toDateString()
        );
        
        if (!transacaoExistente) {
          // Adicionar projeção
          projecoes.push({
            id: `projection_${recorrente.id}_${dataProjecao.getTime()}`,
            userId: recorrente.userId,
            categoriaId: recorrente.categoriaId,
            tipo: recorrente.tipo,
            valor: recorrente.valor,
            descricao: `${recorrente.descricao}`,
            data: dataProjecao.toISOString(),
            isRecorrente: true,
            recorrenteId: recorrente.id,
            isProjection: true,
            categoria: recorrente.categoria,
            recorrente: {
              id: recorrente.id,
              frequencia: recorrente.frequencia,
              dataInicio: recorrente.dataInicio.toISOString(),
              dataFim: recorrente.dataFim?.toISOString() || null
            }
          });
        }
        
        dataProjecao = calcularProximaData(dataProjecao, recorrente.frequencia);
      }
    }

    // Combinar transações reais com projeções
    const todasTransacoes = [
      ...transacoesReais.map(t => ({
        ...t,
        valor: Number(t.valor),
        data: t.data.toISOString(),
        isProjection: false,
        isReal: true
      })),
      ...projecoes
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    // Calcular totais
    const totalReceitas = todasTransacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesas = todasTransacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const totalReceitasReais = transacoesReais
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    
    const totalDespesasReais = transacoesReais
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    return NextResponse.json({
      periodo: {
        mes,
        ano,
        nome: new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      },
      transacoes: todasTransacoes,
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        totalReceitasReais,
        totalDespesasReais,
        saldoReal: totalReceitasReais - totalDespesasReais,
        totalReceitasProjetadas: totalReceitas - totalReceitasReais,
        totalDespesasProjetadas: totalDespesas - totalDespesasReais,
        transacoesReaisCount: transacoesReais.length,
        projecoesCount: projecoes.length,
        totalTransacoesCount: todasTransacoes.length
      },
      informacoes: {
        mesAtual: mes === new Date().getMonth() + 1 && ano === new Date().getFullYear(),
        temProjecoes: projecoes.length > 0,
        temTransacoesReais: transacoesReais.length > 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar transações do mês:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
