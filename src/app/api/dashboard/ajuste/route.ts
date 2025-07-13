import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { tipo, valor, descricao } = await req.json();

    if (!tipo || !valor || !descricao) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    if (tipo !== 'receita' && tipo !== 'despesa') {
      return NextResponse.json({ error: 'Tipo deve ser receita ou despesa' }, { status: 400 });
    }

    const transacaoAjuste = await prisma.transacao.create({
      data: {
        userId: usuario.id,
        categoriaId: undefined,
        tipo: tipo as 'receita' | 'despesa',
        valor: Math.abs(Number(valor)),
        descricao: `[AJUSTE] ${descricao}`,
        data: new Date(),
      },
    });

    return NextResponse.json({ 
      message: 'Ajuste criado com sucesso',
      transacao: transacaoAjuste
    });
  } catch (error: unknown) {
    console.error('Erro ao criar ajuste:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}