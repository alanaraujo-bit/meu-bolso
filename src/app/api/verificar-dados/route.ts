import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        criadoEm: true
      }
    });

    // Verificar transações órfãs (sem usuário válido)
    const transacoesOrfas = await prisma.transacao.findMany({
      select: {
        id: true,
        userId: true,
        descricao: true,
        valor: true,
        data: true
      },
      take: 10
    });

    // Verificar categorias órfãs
    const categoriasOrfas = await prisma.categoria.findMany({
      select: {
        id: true,
        userId: true,
        nome: true
      },
      take: 10
    });

    // Verificar metas órfãs
    const metasOrfas = await prisma.meta.findMany({
      select: {
        id: true,
        userId: true,
        nome: true,
        valorAlvo: true
      },
      take: 10
    });

    // Verificar total de registros
    const totais = {
      usuarios: await prisma.usuario.count(),
      transacoes: await prisma.transacao.count(),
      categorias: await prisma.categoria.count(),
      metas: await prisma.meta.count()
    };

    return NextResponse.json({
      success: true,
      usuarios,
      totais,
      dadosOrfaos: {
        transacoes: transacoesOrfas.length,
        categorias: categoriasOrfas.length,
        metas: metasOrfas.length
      },
      transacoesExistentes: transacoesOrfas.slice(0, 5), // Primeiras 5
      categoriasExistentes: categoriasOrfas.slice(0, 5),
      metasExistentes: metasOrfas.slice(0, 5)
    });

  } catch (error: any) {
    console.error('Erro ao verificar dados:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
