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
        error: 'Esta meta já foi concluída' 
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
        userId: usuario.id,
        categoriaId: null, // Metas não têm categoria específica
        tipo: 'receita',
        valor: valorContribuicao,
        descricao: descricao && descricao.trim() !== '' ? descricao : `Contribuição para meta: ${meta.nome}`,
        data: new Date(),
        Tag: {
          create: [
            {
              nome: 'contribuicao-meta',
            },
          ],
        },
        anexos: {
          create: [],
        },
        isRecorrente: false,
        metaId: meta.id,
      }
    });

    // Atualizar valor atual da meta
    const metaAtualizada = await prisma.meta.update({
      where: { id: params.id },
      data: {
        currentAmount: novoValorAtual,
        isCompleted: novoValorAtual.gte(meta.valorAlvo)
      }
    });

    return NextResponse.json({
      message: 'Contribuição adicionada com sucesso',
      transacao: {
        ...transacao,
        valor: transacao.valor.toNumber()
      },
      meta: {
        ...metaAtualizada,
        valorAlvo: metaAtualizada.valorAlvo.toNumber(),
        currentAmount: metaAtualizada.currentAmount.toNumber(),
        progresso: metaAtualizada.currentAmount.div(metaAtualizada.valorAlvo).mul(100).toNumber()
      }
    });
  } catch (error) {
    console.error('Erro ao contribuir para meta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}