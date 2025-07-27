import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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

// POST - Executar transações recorrentes automaticamente
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const agora = new Date();
    console.log(`🕐 Execução automática iniciada em: ${agora.toISOString()}`);

    // Buscar transações recorrentes ativas
    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: usuario.id,
        isActive: true,
        dataInicio: { lte: agora },
        OR: [
          { dataFim: null },
          { dataFim: { gte: agora } }
        ]
      },
      include: {
        transacoes: {
          orderBy: { data: "desc" },
          take: 1,
        },
        categoria: true,
      },
    });

    console.log(`📋 Recorrentes ativas encontradas: ${recorrentes.length}`);

    const transacoesCriadas = [];
    const erros = [];

    for (const recorrente of recorrentes) {
      console.log(`\n🔄 Processando: ${recorrente.descricao} (${recorrente.frequencia})`);

      try {
        // Determinar a data da próxima execução
        let proximaExecucao = new Date(recorrente.dataInicio);

        // Se já há transações, calcular a partir da última
        if (recorrente.transacoes.length > 0) {
          const ultimaTransacao = recorrente.transacoes[0];
          console.log(`  📅 Última transação: ${ultimaTransacao.data.toISOString()}`);
          proximaExecucao = calcularProximaData(ultimaTransacao.data, recorrente.frequencia);
        } else {
          console.log(`  ℹ️ Primeira execução, usando data inicial: ${proximaExecucao.toISOString()}`);
        }

        // Executar todas as transações pendentes até a data atual
        let execucoesPendentes = 0;
        while (proximaExecucao <= agora) {
          // Verificar se a transação está dentro do período de validade
          if (recorrente.dataFim && proximaExecucao > recorrente.dataFim) {
            console.log(`  ⏹️ Transação fora do período de validade: ${proximaExecucao.toISOString()}`);
            break;
          }

          // Verificar se já existe uma transação para esta data
          const inicioData = new Date(proximaExecucao.getFullYear(), proximaExecucao.getMonth(), proximaExecucao.getDate());
          const fimData = new Date(proximaExecucao.getFullYear(), proximaExecucao.getMonth(), proximaExecucao.getDate() + 1);

          const transacaoExistente = await prisma.transacao.findFirst({
            where: {
              userId: usuario.id,
              recorrenteId: recorrente.id,
              data: {
                gte: inicioData,
                lt: fimData,
              },
            },
          });

          if (!transacaoExistente) {
            // Criar nova transação
            const novaTransacao = await prisma.transacao.create({
              data: {
                userId: usuario.id,
                categoriaId: recorrente.categoriaId,
                tipo: recorrente.tipo,
                valor: recorrente.valor,
                descricao: recorrente.descricao || `${recorrente.tipo === 'receita' ? 'Receita' : 'Despesa'} recorrente`,
                data: proximaExecucao,
                isRecorrente: true,
                recorrenteId: recorrente.id,
              },
              include: {
                categoria: true,
              }
            });

            transacoesCriadas.push({
              id: novaTransacao.id,
              descricao: novaTransacao.descricao,
              valor: Number(novaTransacao.valor),
              tipo: novaTransacao.tipo,
              data: novaTransacao.data.toISOString(),
              categoria: novaTransacao.categoria?.nome || 'Sem categoria',
              recorrente: {
                id: recorrente.id,
                descricao: recorrente.descricao,
                frequencia: recorrente.frequencia
              }
            });

            execucoesPendentes++;
            console.log(`  ✅ Transação criada para ${proximaExecucao.toISOString()}: R$ ${recorrente.valor}`);
          } else {
            console.log(`  ⏭️ Transação já existe para ${proximaExecucao.toISOString()}`);
          }

          // Calcular próxima data para verificar se há mais pendências
          proximaExecucao = calcularProximaData(proximaExecucao, recorrente.frequencia);
        }

        if (execucoesPendentes === 0) {
          console.log(`  ✅ Nenhuma execução pendente para: ${recorrente.descricao}`);
        }

      } catch (error) {
        console.error(`  ❌ Erro ao processar recorrente ${recorrente.id}:`, error);
        erros.push({
          recorrenteId: recorrente.id,
          descricao: recorrente.descricao,
          erro: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    console.log(`\n📊 Resumo da execução automática:`);
    console.log(`  ✅ Transações criadas: ${transacoesCriadas.length}`);
    console.log(`  ❌ Erros: ${erros.length}`);

    return NextResponse.json({
      sucesso: true,
      executadoEm: agora.toISOString(),
      resumo: {
        recorrentesProcessadas: recorrentes.length,
        transacoesCriadas: transacoesCriadas.length,
        erros: erros.length
      },
      transacoesCriadas,
      erros: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    console.error("❌ Erro na execução automática:", error);
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}
