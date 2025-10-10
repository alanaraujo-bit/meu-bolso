import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Editar valor de uma parcela específica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, parcelaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { novoValor } = await request.json();

    if (!novoValor || novoValor <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Verificar se a dívida pertence ao usuário
    const divida = await prisma.divida.findFirst({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
      include: {
        parcelas: true,
      },
    });

    if (!divida) {
      return NextResponse.json({ error: "Dívida não encontrada" }, { status: 404 });
    }

    // Verificar se a parcela existe e pertence à dívida
    const parcela = divida.parcelas.find((p: any) => p.id === params.parcelaId);
    if (!parcela) {
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }

    // Não permitir editar parcelas já pagas
    if (parcela.status === 'PAGA') {
      return NextResponse.json({ 
        error: "Não é possível editar o valor de uma parcela já paga" 
      }, { status: 400 });
    }

    // Atualizar o valor da parcela
    const parcelaAtualizada = await prisma.parcelaDivida.update({
      where: { id: params.parcelaId },
      data: { valor: novoValor },
    });

    // Recalcular o valor total da dívida baseado na soma de todas as parcelas
    const todasParcelas = await prisma.parcelaDivida.findMany({
      where: { dividaId: params.id },
    });

    const novoValorTotal = todasParcelas.reduce((acc: number, p: any) => acc + p.valor.toNumber(), 0);

    // Atualizar o valor total da dívida
    await prisma.divida.update({
      where: { id: params.id },
      data: { 
        valorTotal: novoValorTotal,
        // Atualizar também o valor médio da parcela para referência
        valorParcela: novoValorTotal / divida.numeroParcelas
      },
    });

    console.log(`💰 Valor da parcela ${parcela.numero} atualizado: ${parcela.valor.toNumber()} → ${novoValor}`);
    console.log(`📊 Valor total da dívida recalculado: ${novoValorTotal}`);

    return NextResponse.json({
      message: "Valor da parcela atualizado com sucesso",
      parcela: {
        ...parcelaAtualizada,
        valor: parcelaAtualizada.valor.toNumber(),
      },
      novoValorTotalDivida: novoValorTotal,
    });

  } catch (error) {
    console.error("❌ Erro ao editar valor da parcela:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}