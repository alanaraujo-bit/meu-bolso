import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar a transação
    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      },
      include: {
        categoria: true
      }
    });

    if (!transacao) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      ...transacao,
      valor: transacao.valor.toNumber()
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar a transação
    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      }
    });

    if (!transacao) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    const { categoriaId, tipo, valor, descricao, data, tags } = await req.json();

    // Validações
    if (!valor || !tipo || !data) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
    }

    // Verificar se a categoria existe e pertence ao usuário (se fornecida)
    if (categoriaId) {
      const categoria = await prisma.categoria.findFirst({
        where: {
          id: categoriaId,
          userId: usuario.id
        }
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
    }

    // Atualizar a transação
    const transacaoAtualizada = await prisma.transacao.update({
      where: { id: params.id },
      data: {
        categoriaId: categoriaId || null,
        tipo,
        valor: Number(valor),
        descricao,
        data: new Date(data),
        tags: tags || []
      },
      include: {
        categoria: true
      }
    });

    return NextResponse.json({
      ...transacaoAtualizada,
      valor: transacaoAtualizada.valor.toNumber()
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar a transação
    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      }
    });

    if (!transacao) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    // Excluir a transação
    await prisma.transacao.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Transação excluída com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}