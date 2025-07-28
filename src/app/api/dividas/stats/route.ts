import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Parcelas a vencer no mês
    const parcelasAVencer = await prisma.parcelaDivida.count({
      where: {
        divida: { userId: usuario.id },
        status: "PENDENTE",
        dataVencimento: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    });

    // Parcelas quitadas
    const parcelasQuitadas = await prisma.parcelaDivida.count({
      where: {
        divida: { userId: usuario.id },
        status: "PAGA",
      },
    });

    // Dívidas por categoria
    const dividasPorCategoriaRaw = await prisma.divida.groupBy({
      by: ["categoriaId"],
      where: { userId: usuario.id },
      _count: {
        id: true,
      },
    });

    // Buscar nomes das categorias
    const categorias = await prisma.categoria.findMany({
      where: {
        id: { in: dividasPorCategoriaRaw.map((c: { categoriaId: string | null }) => c.categoriaId).filter(Boolean) as string[] },
      },
    });

    const dividasPorCategoria = dividasPorCategoriaRaw.map((item: { categoriaId: string | null; _count: { id: number } }) => {
      const categoria = categorias.find((c: { id: string; nome: string }) => c.id === item.categoriaId);
      return {
        categoria: categoria ? categoria.nome : "Sem categoria",
        total: item._count.id,
      };
    });

    return NextResponse.json({ parcelasAVencer, parcelasQuitadas, dividasPorCategoria });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ... existing code ...
