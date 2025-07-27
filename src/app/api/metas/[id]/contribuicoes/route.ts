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

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const metaId = params.id;

    const contribuicoes = await prisma.transacao.findMany({
      where: {
        metaId: metaId,
        userId: usuario.id,
        tipo: "receita",
      },
      orderBy: {
        data: "desc",
      },
      select: {
        id: true,
        valor: true,
        data: true,
        descricao: true,
      },
    });

    return NextResponse.json({ contribuicoes });
  } catch (error) {
    console.error("Erro ao buscar contribuições da meta:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
