import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    const { tipo, valor, descricao } = await req.json();

    if (!tipo || valor === undefined || !descricao) {
      return NextResponse.json({ error: 'Dados obrigatórios: tipo, valor, descricao' }, { status: 400 });
    }

    if (!['receita', 'despesa'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo deve ser receita ou despesa' }, { status: 400 });
    }

    // Criar transação de ajuste
    const transacaoAjuste = await prisma.transacao.create({
      data: {
        userId: usuario.id,
        categoriaId: null as any,
        tipo: tipo,
        valor: Math.abs(parseFloat(valor.toString())),
        descricao: `[AJUSTE] ${descricao}`,
        data: new Date()
      }
    });

    return NextResponse.json({
      message: 'Ajuste realizado com sucesso',
      transacao: transacaoAjuste
    });

  } catch (error) {
    console.error('Erro ao realizar ajuste:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}