import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    if (meta.isCompleted) {
      return NextResponse.json({ 
        error: 'Não é possível contribuir para uma meta já concluída' 
      }, { status: 400 });
    }

    const { valor, descricao } = await req.json();

    if (!valor || valor <= 0) {
      return NextResponse.json({ 
        error: 'Valor da contribuição deve ser maior que zero' 
      }, { status: 400 });
    }

    const valorContribuicao = new Decimal(valor);
    const currentAmountDecimal = new Decimal(meta.currentAmount.toString());
    const novoValorAtual = currentAmountDecimal.add(valorContribuicao);

    // Criar transação de contribuição
    const transacao = await prisma.transacao.create({
      data: {
        tipo: 'receita',
        valor: new Decimal(valor),
        descricao: descricao || `Contribuição para meta: ${meta.nome}`,
        data: new Date(),
        tags: [],
        anexos: [],
        userId: usuario.id,
        metaId: meta.id,
        categoriaId: null as any
      }
    });

    // Atualizar valor atual da meta
    const metaAtualizada = await prisma.meta.update({
      where: { id: params.id },
      data: {
        currentAmount: novoValorAtual,
        isCompleted: novoValorAtual.gte(meta.valorAlvo)
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

    return NextResponse.json({
      meta: {
        ...metaAtualizada,
        valorAlvo: metaAtualizada.valorAlvo.toNumber(),
        currentAmount: metaAtualizada.currentAmount.toNumber(),
        transacoes: metaAtualizada.transacoes?.map(t => ({
          ...t,
          valor: t.valor.toNumber()
        }))
      },
      transacao: {
        ...transacao,
        valor: transacao.valor.toNumber()
      },
      message: metaAtualizada.isCompleted ? 'Parabéns! Meta concluída!' : 'Contribuição adicionada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao adicionar contribuição:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}