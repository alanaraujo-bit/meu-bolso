import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function POST(req: NextRequest) {
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

    const {
      nome,
      valorTotal,
      numeroParcelas,
      valorParcela,
      dataPrimeiraParcela,
      categoriaId,
      status,
    } = await req.json();

    if (!nome || !valorTotal || !numeroParcelas || !dataPrimeiraParcela) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Calcular valorParcela se não fornecido
    const valorParcelaCalculado = valorParcela || (valorTotal / numeroParcelas);

    // Criar dívida
    const divida = await prisma.divida.create({
      data: {
        userId: usuario.id,
        nome,
        valorTotal,
        numeroParcelas,
        valorParcela: valorParcelaCalculado,
        dataPrimeiraParcela: new Date(dataPrimeiraParcela),
        categoriaId: categoriaId || null,
        status: status || "ATIVA",
      },
    });

    // Gerar parcelas
    const parcelasData = [];
    for (let i = 0; i < numeroParcelas; i++) {
      parcelasData.push({
        dividaId: divida.id,
        numero: i + 1,
        valor: valorParcelaCalculado,
        dataVencimento: new Date(new Date(dataPrimeiraParcela).setMonth(new Date(dataPrimeiraParcela).getMonth() + i)),
        status: "PENDENTE" as any,
      });
    }

    await prisma.parcelaDivida.createMany({ data: parcelasData });

    const dividaComParcelas = await prisma.divida.findUnique({
      where: { id: divida.id },
      include: { parcelas: true },
    });

    return NextResponse.json(dividaComParcelas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

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

    const url = new URL(req.url);
    const statusFiltro = url.searchParams.get("status");

    const where: any = { userId: usuario.id };
    if (statusFiltro) {
      where.status = statusFiltro;
    }

    const dividas = await prisma.divida.findMany({
      where,
      include: {
        parcelas: true,
        categoria: true,
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return NextResponse.json(dividas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const dividaId = searchParams.get("id");

    if (!dividaId) {
      return NextResponse.json({ error: "ID da dívida não fornecido" }, { status: 400 });
    }

    // Verificar se a dívida pertence ao usuário
    const divida = await prisma.divida.findUnique({
      where: { id: dividaId },
    });

    if (!divida || divida.userId !== usuario.id) {
      return NextResponse.json({ error: "Dívida não encontrada ou não pertence ao usuário" }, { status: 404 });
    }

    // Deletar parcelas associadas
    await prisma.parcelaDivida.deleteMany({
      where: { dividaId: dividaId },
    });

    // Deletar a dívida
    await prisma.divida.delete({
      where: { id: dividaId },
    });

    return NextResponse.json({ message: "Dívida deletada com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ... existing code ...
