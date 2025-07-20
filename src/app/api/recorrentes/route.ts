import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Criar nova transação recorrente
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

    const { categoriaId, tipo, valor, descricao, frequencia, dataInicio, dataFim } = await req.json();

    // Validar campos obrigatórios
    if (!categoriaId || !tipo || !valor || !frequencia || !dataInicio) {
      return NextResponse.json(
        { error: "Campos obrigatórios: categoriaId, tipo, valor, frequencia, dataInicio" },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe e pertence ao usuário
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: categoriaId,
        userId: usuario.id,
      },
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    // Verificar se o tipo da transação é compatível com a categoria
    if (categoria.tipo !== "ambos" && categoria.tipo !== tipo) {
      return NextResponse.json(
        { error: "Tipo de transação incompatível com a categoria" },
        { status: 400 }
      );
    }

    // Criar a transação recorrente
    const recorrente = await prisma.transacaoRecorrente.create({
      data: {
        userId: usuario.id,
        categoriaId,
        tipo,
        valor: parseFloat(valor),
        descricao,
        frequencia,
        dataInicio: new Date(dataInicio + 'T00:00:00'),
        dataFim: dataFim ? new Date(dataFim + 'T00:00:00') : null,
        isActive: true,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json({
      ...recorrente,
      valor: recorrente.valor.toNumber()
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transação recorrente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// GET - Listar transações recorrentes do usuário
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "ativo", "inativo", ou null para todos
    const tipo = searchParams.get("tipo"); // "receita", "despesa", ou null para todos

    // Construir filtros
    const where: any = {
      userId: usuario.id,
    };

    if (status === "ativo") {
      where.isActive = true;
    } else if (status === "inativo") {
      where.isActive = false;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where,
      include: {
        categoria: true,
        transacoes: {
          orderBy: { data: "desc" },
          take: 5, // Últimas 5 execuções
        },
        _count: {
          select: {
            transacoes: true,
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    // Calcular próxima execução para cada recorrente ativa
    const recorrentesComProximaExecucao = recorrentes.map((recorrente) => {
      let proximaExecucao = null;

      if (recorrente.isActive) {
        const agora = new Date();
        const dataInicio = new Date(recorrente.dataInicio);
        const dataFim = recorrente.dataFim ? new Date(recorrente.dataFim) : null;

        // Se ainda não passou da data de início
        if (agora < dataInicio) {
          proximaExecucao = dataInicio;
        } else if (!dataFim || agora <= dataFim) {
          // Calcular próxima execução baseada na frequência
          let proxima = new Date(dataInicio);

          switch (recorrente.frequencia) {
            case "diario":
              while (proxima <= agora) {
                proxima.setDate(proxima.getDate() + 1);
              }
              break;
            case "semanal":
              while (proxima <= agora) {
                proxima.setDate(proxima.getDate() + 7);
              }
              break;
            case "mensal":
              while (proxima <= agora) {
                proxima.setMonth(proxima.getMonth() + 1);
              }
              break;
            case "anual":
              while (proxima <= agora) {
                proxima.setFullYear(proxima.getFullYear() + 1);
              }
              break;
          }

          // Verificar se a próxima execução não ultrapassa a data fim
          if (!dataFim || proxima <= dataFim) {
            proximaExecucao = proxima;
          }
        }
      }

      return {
        ...recorrente,
        proximaExecucao,
      };
    });

    return NextResponse.json(recorrentesComProximaExecucao.map(recorrente => ({
      ...recorrente,
      valor: recorrente.valor.toNumber(),
      transacoes: recorrente.transacoes?.map(t => ({
        ...t,
        valor: t.valor.toNumber()
      }))
    })));
  } catch (error) {
    console.error("Erro ao buscar transações recorrentes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}