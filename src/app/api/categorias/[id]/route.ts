import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Buscar a categoria
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      },
      include: {
        _count: {
          select: {
            transacoes: true
          }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    return NextResponse.json(categoria);
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

    const { nome, tipo, cor, icone } = await req.json();

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Nome e tipo são obrigatórios" }, { status: 400 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se a categoria existe e pertence ao usuário
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      }
    });

    if (!categoriaExistente) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    // Verificar se já existe outra categoria com o mesmo nome para este usuário
    const categoriaComMesmoNome = await prisma.categoria.findFirst({
      where: {
        nome,
        userId: usuario.id,
        id: { not: params.id }
      }
    });

    if (categoriaComMesmoNome) {
      return NextResponse.json({ error: "Já existe uma categoria com este nome" }, { status: 400 });
    }

    // Atualizar a categoria
    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data: {
        nome,
        tipo,
        cor: cor || "#6B7280",
        icone: icone || "📊",
      },
      include: {
        _count: {
          select: {
            transacoes: true
          }
        }
      }
    });

    return NextResponse.json(categoria);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar se a categoria existe e pertence ao usuário
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      },
      include: {
        _count: {
          select: {
            transacoes: true
          }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    // Verificar se a categoria tem transações associadas
    if (categoria._count.transacoes > 0) {
      return NextResponse.json({ 
        error: `Não é possível excluir esta categoria pois ela possui ${categoria._count.transacoes} transação(ões) associada(s)` 
      }, { status: 400 });
    }

    // Excluir a categoria
    await prisma.categoria.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}