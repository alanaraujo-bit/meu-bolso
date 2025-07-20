import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const meta = await prisma.meta.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      },
      include: {
        transacoes: {
          select: {
            id: true,
            valor: true,
            data: true,
            descricao: true
          },
          orderBy: {
            data: 'desc'
          }
        }
      }
    });

    if (!meta) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      ...meta,
      valorAlvo: meta.valorAlvo.toNumber(),
      currentAmount: meta.currentAmount.toNumber(),
      transacoes: meta.transacoes?.map(t => ({
        ...t,
        valor: t.valor.toNumber()
      })) || []
    });
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const meta = await prisma.meta.findFirst({
      where: {
        id: params.id,
        userId: usuario.id
      }
    });

    if (!meta) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 });
    }

    const { nome, valorAlvo, dataAlvo, isCompleted } = await req.json();

    if (!nome || !valorAlvo || !dataAlvo) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    const metaAtualizada = await prisma.meta.update({
      where: { id: params.id },
      data: {
        nome,
        valorAlvo: Number(valorAlvo),
        dataAlvo: new Date(dataAlvo),
        isCompleted: Boolean(isCompleted)
      }
    });

    return NextResponse.json({
      ...metaAtualizada,
      valorAlvo: metaAtualizada.valorAlvo.toNumber(),
      currentAmount: metaAtualizada.currentAmount.toNumber()
    });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const meta = await prisma.meta.findFirst({
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

    if (!meta) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 });
    }

    if (meta._count.transacoes > 0) {
      return NextResponse.json({ 
        error: 'Não é possível excluir uma meta que possui transações associadas' 
      }, { status: 400 });
    }

    await prisma.meta.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Meta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}