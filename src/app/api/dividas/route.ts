import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseDataBrasil, prepararDataParaBanco, adicionarMeses } from '@/lib/dateUtils';


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
      valorParcela,
      numeroParcelas,
      parcelasJaPagas = 0,
      dataPrimeiraParcela,
      categoriaId,
      status,
      parcelasPersonalizadas,
    } = await req.json();

    if (!nome || !valorParcela || !numeroParcelas || !dataPrimeiraParcela) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    console.log('📅 Debug - Data recebida para dívida:', {
      dataPrimeiraParcela,
      tipo: typeof dataPrimeiraParcela,
      temPersonalizacao: !!parcelasPersonalizadas
    });

    // Calcular valorTotal - se tem personalização, somar valores personalizados
    const valorTotal = parcelasPersonalizadas && parcelasPersonalizadas.length > 0
      ? parcelasPersonalizadas.reduce((sum: number, p: any) => sum + p.valor, 0)
      : valorParcela * numeroParcelas;

    // Preparar data da primeira parcela corretamente
    const dataParcelaPreparada = prepararDataParaBanco(dataPrimeiraParcela);
    
    console.log('📅 Debug - Data preparada para dívida:', {
      original: dataPrimeiraParcela,
      preparada: dataParcelaPreparada,
      formatada: dataParcelaPreparada.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    // Criar dívida
    const divida = await prisma.divida.create({
      data: {
        userId: usuario.id,
        nome,
        valorTotal,
        numeroParcelas,
        valorParcela: valorParcela,
        dataPrimeiraParcela: dataParcelaPreparada,
        categoriaId: categoriaId || null,
        status: status || "ATIVA",
      },
    });

    // Gerar parcelas com timezone correto
    const parcelasData = [];
    const dataPrimeira = dataParcelaPreparada;
    
    for (let i = 0; i < numeroParcelas; i++) {
      const isPaga = i < parcelasJaPagas;
      const dataVencimento = adicionarMeses(dataPrimeira, i);
      
      // Se tem personalização, usar o valor personalizado, senão usar o padrão
      const valorParcela = parcelasPersonalizadas && parcelasPersonalizadas.length > 0
        ? parcelasPersonalizadas[i].valor
        : valorParcela;
      
      console.log(`📅 Debug - Parcela ${i + 1}:`, {
        numero: i + 1,
        valor: valorParcela,
        dataVencimento: dataVencimento,
        formatada: dataVencimento.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        status: isPaga ? "PAGA" : "PENDENTE",
        personalizado: !!(parcelasPersonalizadas && parcelasPersonalizadas.length > 0)
      });
      
      parcelasData.push({
        dividaId: divida.id,
        numero: i + 1,
        valor: valorParcela,
        dataVencimento: dataVencimento,
        status: isPaga ? "PAGA" : "PENDENTE" as any,
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
