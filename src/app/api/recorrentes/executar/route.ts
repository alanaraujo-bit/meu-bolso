import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Executar transações recorrentes pendentes
export async function POST(req: NextRequest) {
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
    
    // Buscar todas as transações recorrentes ativas do usuário
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
          take: 1, // Última transação gerada
        },
      },
    });

    const transacoesCriadas = [];
    const erros = [];

    for (const recorrente of recorrentes) {
      try {
        // Determinar a data da próxima execução
        let proximaExecucao = new Date(recorrente.dataInicio);
        
        // Se já há transações, calcular a partir da última
        if (recorrente.transacoes.length > 0) {
          const ultimaTransacao = recorrente.transacoes[0];
          proximaExecucao = new Date(ultimaTransacao.data);
          
          // Avançar para a próxima data baseada na frequência
          switch (recorrente.frequencia) {
            case "diario":
              proximaExecucao.setDate(proximaExecucao.getDate() + 1);
              break;
            case "semanal":
              proximaExecucao.setDate(proximaExecucao.getDate() + 7);
              break;
            case "mensal":
              proximaExecucao.setMonth(proximaExecucao.getMonth() + 1);
              break;
            case "anual":
              proximaExecucao.setFullYear(proximaExecucao.getFullYear() + 1);
              break;
          }
        }

        // Gerar todas as transações pendentes até a data atual
        const transacoesParaCriar = [];
        
        while (proximaExecucao <= agora && (!recorrente.dataFim || proximaExecucao <= recorrente.dataFim)) {
          transacoesParaCriar.push({
            userId: usuario.id,
            categoriaId: recorrente.categoriaId,
            tipo: recorrente.tipo,
            valor: recorrente.valor,
            descricao: `${recorrente.descricao || 'Transação recorrente'} (${recorrente.frequencia})`,
            data: new Date(proximaExecucao),
            tags: ['recorrente'],
            anexos: [],
            isRecorrente: true,
            recorrenteId: recorrente.id,
          });

          // Avançar para a próxima data
          switch (recorrente.frequencia) {
            case "diario":
              proximaExecucao.setDate(proximaExecucao.getDate() + 1);
              break;
            case "semanal":
              proximaExecucao.setDate(proximaExecucao.getDate() + 7);
              break;
            case "mensal":
              proximaExecucao.setMonth(proximaExecucao.getMonth() + 1);
              break;
            case "anual":
              proximaExecucao.setFullYear(proximaExecucao.getFullYear() + 1);
              break;
          }
        }

        // Criar as transações em lote
        if (transacoesParaCriar.length > 0) {
          const novasTransacoes = await prisma.transacao.createMany({
            data: transacoesParaCriar,
          });
          
          transacoesCriadas.push({
            recorrenteId: recorrente.id,
            descricao: recorrente.descricao,
            quantidade: transacoesParaCriar.length,
          });
        }
      } catch (error) {
        console.error(`Erro ao processar recorrente ${recorrente.id}:`, error);
        erros.push({
          recorrenteId: recorrente.id,
          descricao: recorrente.descricao,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    return NextResponse.json({
      message: "Execução de transações recorrentes concluída",
      transacoesCriadas,
      erros,
      totalRecorrentes: recorrentes.length,
      totalTransacoesCriadas: transacoesCriadas.reduce((acc, item) => acc + item.quantidade, 0),
    });
  } catch (error) {
    console.error("Erro ao executar transações recorrentes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// GET - Verificar transações recorrentes pendentes
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
    
    // Buscar todas as transações recorrentes ativas do usuário
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
          take: 1, // Última transação gerada
        },
      },
    });

    const pendentes = [];

    for (const recorrente of recorrentes) {
      // Determinar a data da próxima execução
      let proximaExecucao = new Date(recorrente.dataInicio);
      
      // Se já há transações, calcular a partir da última
      if (recorrente.transacoes.length > 0) {
        const ultimaTransacao = recorrente.transacoes[0];
        proximaExecucao = new Date(ultimaTransacao.data);
        
        // Avançar para a próxima data baseada na frequência
        switch (recorrente.frequencia) {
          case "diario":
            proximaExecucao.setDate(proximaExecucao.getDate() + 1);
            break;
          case "semanal":
            proximaExecucao.setDate(proximaExecucao.getDate() + 7);
            break;
          case "mensal":
            proximaExecucao.setMonth(proximaExecucao.getMonth() + 1);
            break;
          case "anual":
            proximaExecucao.setFullYear(proximaExecucao.getFullYear() + 1);
            break;
        }
      }

      // Contar quantas execuções estão pendentes
      let execucoesPendentes = 0;
      let dataVerificacao = new Date(proximaExecucao);
      
      while (dataVerificacao <= agora && (!recorrente.dataFim || dataVerificacao <= recorrente.dataFim)) {
        execucoesPendentes++;
        
        // Avançar para a próxima data
        switch (recorrente.frequencia) {
          case "diario":
            dataVerificacao.setDate(dataVerificacao.getDate() + 1);
            break;
          case "semanal":
            dataVerificacao.setDate(dataVerificacao.getDate() + 7);
            break;
          case "mensal":
            dataVerificacao.setMonth(dataVerificacao.getMonth() + 1);
            break;
          case "anual":
            dataVerificacao.setFullYear(dataVerificacao.getFullYear() + 1);
            break;
        }
      }

      if (execucoesPendentes > 0) {
        pendentes.push({
          ...recorrente,
          execucoesPendentes,
          proximaExecucao,
        });
      }
    }

    return NextResponse.json({
      pendentes,
      totalPendentes: pendentes.length,
      totalExecucoesPendentes: pendentes.reduce((acc, item) => acc + item.execucoesPendentes, 0),
    });
  } catch (error) {
    console.error("Erro ao verificar transações recorrentes pendentes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}