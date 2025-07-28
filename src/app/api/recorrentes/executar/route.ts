import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

// POST - Executar transações recorrentes pendentes
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

    // Verificar se é execução individual
    const body = await req.json().catch(() => ({}));
    const { recorrenteId } = body;

    const agora = new Date();
    console.log(`🕐 Data/hora atual: ${agora.toISOString()}`);

    // Buscar transações recorrentes (todas ou uma específica)
    let whereClause: any = {
      userId: usuario.id,
      isActive: true,
      dataInicio: { lte: agora },
      OR: [
        { dataFim: null },
        { dataFim: { gte: agora } }
      ]
    };

    // Se for execução individual, filtrar por ID específico
    if (recorrenteId) {
      whereClause.id = recorrenteId;
      console.log(`🎯 Execução individual para recorrente ID: ${recorrenteId}`);
    } else {
      console.log(`🔄 Execução em lote para todas as recorrentes`);
    }

    console.log("🔍 Filtros para busca de recorrentes:", JSON.stringify(whereClause, null, 2));

    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: whereClause,
      include: {
        transacoes: {
          orderBy: { data: "desc" },
          take: 1, // Última transação gerada
        },
      },
    });

    console.log(`📋 Recorrentes ativas encontradas: ${recorrentes.length}`);
    recorrentes.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.descricao} - ${rec.tipo} - R$ ${rec.valor} - Frequência: ${rec.frequencia}`);
    });

    const pendentes = [];
    const transacoesCriadas = [];
    const erros = [];

    for (const recorrente of recorrentes) {
      console.log(`\n🔄 Processando: ${recorrente.descricao}`);

      try {
        // Determinar a data da próxima execução
        let proximaExecucao = new Date(recorrente.dataInicio);

        // Se já há transações, calcular a partir da última
        if (recorrente.transacoes.length > 0) {
          const ultimaTransacao = recorrente.transacoes[0];
          console.log(`  📅 Última transação encontrada: ${ultimaTransacao.data.toISOString()}`);
          proximaExecucao = calcularProximaData(ultimaTransacao.data, recorrente.frequencia);
        } else {
          console.log(`  ℹ️ Nenhuma transação gerada ainda, usando data inicial: ${proximaExecucao.toISOString()}`);
        }

        console.log(`  ➡️ Próxima execução calculada: ${proximaExecucao.toISOString()}`);

        // Verificar se é hora de executar
        if (proximaExecucao <= agora) {
          console.log(`  ⚠️ Pendente: Próxima execução (${proximaExecucao.toISOString()}) é anterior a agora (${agora.toISOString()})`);

          // Verificar se já existe uma transação para esta data
          const inicioData = new Date(proximaExecucao.getFullYear(), proximaExecucao.getMonth(), proximaExecucao.getDate());
          const fimData = new Date(proximaExecucao.getFullYear(), proximaExecucao.getMonth(), proximaExecucao.getDate() + 1);

          console.log(`  🔍 Verificando transações existentes entre ${inicioData.toISOString()} e ${fimData.toISOString()}`);

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
            // Criar a transação
            try {
              const novaTransacao = await prisma.transacao.create({
                data: {
                  userId: usuario.id,
                  categoriaId: recorrente.categoriaId,
                  tipo: recorrente.tipo,
                  valor: recorrente.valor,
                  descricao: `[RECORRENTE] ${recorrente.descricao}`,
                  data: proximaExecucao,
                  recorrenteId: recorrente.id,
                  isRecorrente: true,
                  Tag: {
                    create: [],
                  },
                  anexos: {
                    create: [],
                  },
                },
              });

              transacoesCriadas.push(novaTransacao);

              // Atualizar a próxima execução para a próxima data após a criação
              proximaExecucao = calcularProximaData(proximaExecucao, recorrente.frequencia);

            } catch (createError) {
              const error = createError as Error;
              erros.push({
                recorrenteId: recorrente.id,
                descricao: recorrente.descricao,
                erro: error.message,
                stack: error.stack,
              });
              console.error(`Erro ao criar transação para recorrente ${recorrente.id}:`, error);
            }
          } else {
            console.log(`  ⚠️ Transação já existe para esta data: ID ${transacaoExistente.id}`);
          }

          pendentes.push({
            ...recorrente,
            proximaExecucao,
            ultimaExecucao: recorrente.transacoes[0]?.data || null,
          });
        }
      } catch (error) {
        const err = error as Error;
        erros.push({
          recorrenteId: recorrente.id,
          descricao: recorrente.descricao,
          erro: err.message,
          stack: err.stack,
        });
        console.error(`Erro ao processar recorrente ${recorrente.id}:`, err);
      }
    }

    console.log(`\n📊 Resumo da execução:`);
    console.log(`  ✅ Transações criadas: ${transacoesCriadas.length}`);
    console.log(`  ❌ Erros: ${erros.length}`);
    console.log(`  ⚠️ Pendentes: ${pendentes.length}`);

    // Atualizar pendentes para refletir as próximas execuções após criação
    const pendentesAtualizados = [];
    for (const recorrente of recorrentes) {
      let proximaExecucao = new Date(recorrente.dataInicio);
      if (recorrente.transacoes.length > 0) {
        const ultimaTransacao = recorrente.transacoes[0];
        proximaExecucao = calcularProximaData(ultimaTransacao.data, recorrente.frequencia);
      }
      if (proximaExecucao <= agora) {
        pendentesAtualizados.push({
          ...recorrente,
          proximaExecucao,
          ultimaExecucao: recorrente.transacoes[0]?.data || null,
        });
      }
    }

    const message = `${transacoesCriadas.length} transações criadas${erros.length > 0 ? `, ${erros.length} erros` : ''}`;

    return NextResponse.json({
      success: true,
      message,
      transacoesCriadas: transacoesCriadas.length,
      erros: erros.length,
      pendentes: pendentesAtualizados,
      detalhes: {
        transacoes: transacoesCriadas,
        erros
      }
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Erro ao executar transações recorrentes:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: err.message },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular a próxima data baseada na frequência
function calcularProximaData(dataAtual: Date, frequencia: string): Date {
  const novaData = new Date(dataAtual);
  const freq = frequencia.toUpperCase(); // Normalizar para maiúsculo

  console.log(`  📅 Calculando próxima data a partir de ${dataAtual.toISOString()} com frequência ${freq}`);

  switch (freq) {
    case 'DIARIA':
    case 'DIARIO':
      novaData.setDate(novaData.getDate() + 1);
      break;
    case 'SEMANAL':
      novaData.setDate(novaData.getDate() + 7);
      break;
    case 'QUINZENAL':
      novaData.setDate(novaData.getDate() + 15);
      break;
    case 'MENSAL':
      novaData.setMonth(novaData.getMonth() + 1);
      break;
    case 'BIMESTRAL':
      novaData.setMonth(novaData.getMonth() + 2);
      break;
    case 'TRIMESTRAL':
      novaData.setMonth(novaData.getMonth() + 3);
      break;
    case 'SEMESTRAL':
      novaData.setMonth(novaData.getMonth() + 6);
      break;
    case 'ANUAL':
      novaData.setFullYear(novaData.getFullYear() + 1);
      break;
    default:
      console.warn(`Frequência não reconhecida: ${frequencia}, usando MENSAL como padrão`);
      novaData.setMonth(novaData.getMonth() + 1);
  }

  console.log(`  📅 Nova data calculada: ${novaData.toISOString()}`);
  return novaData;
}

// GET - Verificar transações pendentes (para debug)
export async function GET(req: NextRequest) {
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
        categoria: true,
        transacoes: {
          orderBy: { data: "desc" },
          take: 1,
        },
      },
    });

    const pendentes = [];

    for (const recorrente of recorrentes) {
      let proximaExecucao = new Date(recorrente.dataInicio);
      
      if (recorrente.transacoes.length > 0) {
        const ultimaTransacao = recorrente.transacoes[0];
        proximaExecucao = calcularProximaData(ultimaTransacao.data, recorrente.frequencia);
      }

      if (proximaExecucao <= agora) {
        pendentes.push({
          ...recorrente,
          proximaExecucao,
          ultimaExecucao: recorrente.transacoes[0]?.data || null
        });
      }
    }

    return NextResponse.json({
      pendentes: pendentes,
      totalPendentes: pendentes.length,
      totalExecucoesPendentes: pendentes.length
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Erro ao verificar transações pendentes:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: err.message },
      { status: 500 }
    );
  }
}