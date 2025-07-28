import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar todas as transações recorrentes
    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: { userId: usuario.id },
      include: {
        categoria: true,
        transacoes: {
          orderBy: { data: "desc" },
          take: 5
        },
        _count: {
          select: { transacoes: true }
        }
      }
    });

    // Buscar todas as transações normais
    const transacoes = await prisma.transacao.findMany({
      where: { userId: usuario.id },
      include: {
        categoria: true
      },
      orderBy: { data: "desc" },
      take: 10
    });

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      },
      recorrentes: recorrentes.map(r => ({
        id: r.id,
        descricao: r.descricao,
        tipo: r.tipo,
        valor: r.valor.toNumber(),
        frequencia: r.frequencia,
        isActive: r.isActive,
        categoria: r.categoria?.nome,
        transacoesCriadas: r._count.transacoes,
        ultimasTransacoes: r.transacoes.map(t => ({
          id: t.id,
          data: t.data,
          valor: t.valor.toNumber()
        }))
      })),
      transacoes: transacoes.map(t => ({
        id: t.id,
        descricao: t.descricao,
        tipo: t.tipo,
        valor: t.valor.toNumber(),
        data: t.data,
        categoria: t.categoria?.nome,
        isRecorrente: t.isRecorrente
        // transacaoRecorrenteId removido para evitar erro de tipo
      })),
      totais: {
        recorrentes: recorrentes.length,
        transacoes: transacoes.length
      },
      databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + "..."
    });

  } catch (error) {
    console.error("Erro no debug:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro interno do servidor",
        details: error instanceof Error ? {
          message: error.message,
          stack: error.stack?.substring(0, 500)
        } : error
      },
      { status: 500 }
    );
  }
}