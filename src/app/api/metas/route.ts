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

    const { nome, valorAlvo, dataAlvo } = await req.json();

    if (!nome || !valorAlvo || !dataAlvo) {
      return NextResponse.json({ 
        error: 'Nome, valor alvo e data alvo são obrigatórios' 
      }, { status: 400 });
    }

    if (valorAlvo <= 0) {
      return NextResponse.json({ 
        error: 'Valor alvo deve ser maior que zero' 
      }, { status: 400 });
    }

    // Criar data mantendo o fuso horário local
    const dataAlvoDate = new Date(dataAlvo + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas a data

    if (dataAlvoDate <= hoje) {
      return NextResponse.json({
        error: 'Data alvo deve ser no futuro'
      }, { status: 400 });
    }

    const meta = await prisma.meta.create({
      data: {
        nome,
        valorAlvo: parseFloat(valorAlvo),
        dataAlvo: dataAlvoDate,
        currentAmount: 0,
        isCompleted: false,
        userId: usuario.id
      }
    });

    return NextResponse.json({
      ...meta,
      valorAlvo: meta.valorAlvo.toNumber(),
      currentAmount: meta.currentAmount.toNumber()
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'ativas', 'concluidas', 'vencidas'

    let whereClause: any = {
      userId: usuario.id
    };

    const hoje = new Date();
    
    if (status === 'ativas') {
      whereClause.isCompleted = false;
      whereClause.dataAlvo = { gte: hoje };
    } else if (status === 'concluidas') {
      whereClause.isCompleted = true;
    } else if (status === 'vencidas') {
      whereClause.isCompleted = false;
      whereClause.dataAlvo = { lt: hoje };
    }

    const metas = await prisma.meta.findMany({
      where: whereClause,
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
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });

    // Calcular estatísticas
    const estatisticas = {
      total: await prisma.meta.count({ where: { userId: usuario.id } }),
      ativas: await prisma.meta.count({ 
        where: { 
          userId: usuario.id, 
          isCompleted: false,
          dataAlvo: { gte: hoje }
        } 
      }),
      concluidas: await prisma.meta.count({ 
        where: { 
          userId: usuario.id, 
          isCompleted: true 
        } 
      }),
      vencidas: await prisma.meta.count({ 
        where: { 
          userId: usuario.id, 
          isCompleted: false,
          dataAlvo: { lt: hoje }
        } 
      })
    };

    return NextResponse.json({
      metas: metas.map(meta => ({
        ...meta,
        valorAlvo: meta.valorAlvo.toNumber(),
        currentAmount: meta.currentAmount.toNumber(),
        transacoes: meta.transacoes?.map(t => ({
          ...t,
          valor: t.valor.toNumber()
        }))
      })),
      estatisticas
    });
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}