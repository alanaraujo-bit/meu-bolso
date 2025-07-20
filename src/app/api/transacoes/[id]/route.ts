import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('GET /api/transacoes/[id] - Início da requisição, id:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('GET /api/transacoes/[id] - Não autorizado');
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      console.log('GET /api/transacoes/[id] - Usuário não encontrado');
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const transacao = await prisma.transacao.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      },
      include: {
        categoria: true,
        Tag: true,
        anexos: true
      }
    });

    if (!transacao) {
      console.log('GET /api/transacoes/[id] - Transação não encontrada para id:', params.id);
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    console.log('GET /api/transacoes/[id] - Transação encontrada:', transacao);

    return NextResponse.json({
      ...transacao,
      valor: transacao.valor.toNumber()
    });
  } catch (error) {
    console.error('GET /api/transacoes/[id] - Erro interno do servidor:', error);
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

    // Atualizar a transação e as tags
    const transacaoAtualizada = await prisma.transacao.update({
      where: { id: params.id },
      data: {
        categoriaId: categoriaId || null,
        tipo,
        valor: Number(valor),
        descricao,
        data: new Date(data),
        Tag: {
          deleteMany: {}, // Remove todas as tags antigas
          create: Array.isArray(tags) ? tags.map((nome: string) => ({ nome })) : [],
        },
      },
      include: {
        categoria: true,
        Tag: true
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

    // Excluir tags associadas
    await prisma.tag.deleteMany({
      where: { transacaoId: transacao.id }
    });

    // Excluir anexos associados
    await prisma.anexo.deleteMany({
      where: { transacaoId: transacao.id }
    });

    // Se a transação estiver associada a uma meta, remover a associação
    if (transacao.metaId) {
      await prisma.transacao.update({
        where: { id: transacao.id },
        data: { metaId: null }
      });
    }

    // Excluir a transação
    await prisma.transacao.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Transação excluída com sucesso" });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}