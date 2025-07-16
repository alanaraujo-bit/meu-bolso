import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { tipo, valor, descricao } = body;

    // Validar dados
    if (!tipo || !valor || !descricao) {
      return NextResponse.json({ error: "Dados obrigatórios: tipo, valor, descricao" }, { status: 400 });
    }

    if (tipo !== "receita" && tipo !== "despesa") {
      return NextResponse.json({ error: "Tipo deve ser 'receita' ou 'despesa'" }, { status: 400 });
    }

    // Criar transação de teste
    const transacao = await prisma.transacao.create({
      data: {
        userId: usuario.id,
        categoriaId: undefined, // Sem categoria para teste
        tipo: tipo,
        valor: Math.abs(parseFloat(valor)),
        descricao: `[AJUSTE] ${descricao}`,
        data: new Date(),
        tags: [],
        anexos: [],
        isRecorrente: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Transação de ajuste criada com sucesso",
      transacao: {
        id: transacao.id,
        tipo: transacao.tipo,
        valor: transacao.valor.toNumber(),
        descricao: transacao.descricao,
        data: transacao.data
      }
    });

  } catch (error) {
    console.error("Erro ao criar ajuste:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}