import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const parcelaId = searchParams.get("id");

    if (!parcelaId) {
      return NextResponse.json({ error: "ID da parcela não fornecido" }, { status: 400 });
    }

    // Verificar se a parcela pertence ao usuário
    const parcela = await prisma.parcelaDivida.findUnique({
      where: { id: parcelaId },
      include: { divida: true },
    });

    if (!parcela || parcela.divida.userId !== usuario.id) {
      return NextResponse.json({ error: "Parcela não encontrada ou não pertence ao usuário" }, { status: 404 });
    }

    // Deletar a parcela
    await prisma.parcelaDivida.delete({
      where: { id: parcelaId },
    });

    return NextResponse.json({ message: "Parcela deletada com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ... existing code ...
