import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Buscar transação recorrente específica
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
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

    const recorrente = await prisma.transacaoRecorrente.findFirst({
      where: {
        id: params.id,
        userId: usuario.id,
      },
      include: {
        categoria: true,
        transacoes: {
          orderBy: { data: "desc" },
        },
        _count: {
          select: {
            transacoes: true,
          },
        },
      },
    });

    if (!recorrente) {
      return NextResponse.json({ error: "Transação recorrente não encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      ...recorrente,
      valor: recorrente.valor.toNumber(),
      transacoes: recorrente.transacoes?.map(t => ({
        ...t,
        valor: t.valor.toNumber()
      }))
    });
  } catch (error) {
    console.error("Erro ao buscar transação recorrente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT - Atualizar transação recorrente
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const recorrente = await prisma.transacaoRecorrente.findFirst({
      where: {
        id: params.id,
        userId: usuario.id,
      },
    });

    if (!recorrente) {
      return NextResponse.json({ error: "Transação recorrente não encontrada" }, { status: 404 });
    }

    const { categoriaId, tipo, valor, descricao, frequencia, dataInicio, dataFim, isActive } = await req.json();

    // Validações
    if (!categoriaId || !tipo || !valor || !descricao || !frequencia || !dataInicio) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
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

    // Verificar compatibilidade de tipo
    if (categoria.tipo !== 'ambos' && categoria.tipo !== tipo) {
      return NextResponse.json({ 
        error: `Esta categoria só aceita transações do tipo: ${categoria.tipo}` 
      }, { status: 400 });
    }

    const recorrenteAtualizada = await prisma.transacaoRecorrente.update({
      where: { id: params.id },
      data: {
        categoriaId,
        tipo,
        valor: Number(valor),
        descricao,
        frequencia,
        dataInicio: new Date(dataInicio),
        dataFim: dataFim ? new Date(dataFim) : null,
        isActive: Boolean(isActive),
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json({
      ...recorrenteAtualizada,
      valor: recorrenteAtualizada.valor.toNumber()
    });
  } catch (error) {
    console.error("Erro ao atualizar transação recorrente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// DELETE - Excluir transação recorrente
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
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

    const recorrente = await prisma.transacaoRecorrente.findFirst({
      where: {
        id: params.id,
        userId: usuario.id,
      },
      include: {
        _count: {
          select: {
            transacoes: true,
          },
        },
      },
    });

    if (!recorrente) {
      return NextResponse.json({ error: "Transação recorrente não encontrada" }, { status: 404 });
    }

    // Verificar se há transações associadas
    if (recorrente._count.transacoes > 0) {
      return NextResponse.json({ 
        error: "Não é possível excluir uma transação recorrente que possui transações associadas" 
      }, { status: 400 });
    }

    await prisma.transacaoRecorrente.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Transação recorrente excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir transação recorrente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}