import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prepararDataParaBanco, adicionarMeses } from '@/lib/dateUtils';

// GET - Obter detalhes de uma dívida específica
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

    const divida = await prisma.divida.findFirst({
      where: {
        id: params.id,
        userId: usuario.id,
      },
      include: {
        categoria: true,
        parcelas: {
          orderBy: { numero: 'asc' },
        },
      },
    });

    if (!divida) {
      return NextResponse.json({ error: "Dívida não encontrada" }, { status: 404 });
    }

    // Calcular estatísticas
    const parcelasPagas = divida.parcelas.filter(p => p.status === 'PAGA').length;
    const parcelasVencidas = divida.parcelas.filter(p => {
      const hoje = new Date();
      return p.status === 'PENDENTE' && new Date(p.dataVencimento) < hoje;
    }).length;
    const proximaParcelaVencimento = divida.parcelas
      .filter(p => p.status === 'PENDENTE')
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0];

    const valorPago = parcelasPagas * divida.valorParcela.toNumber();
    const valorRestante = divida.valorTotal.toNumber() - valorPago;
    const percentualQuitado = (valorPago / divida.valorTotal.toNumber()) * 100;

    return NextResponse.json({
      ...divida,
      valorTotal: divida.valorTotal.toNumber(),
      valorParcela: divida.valorParcela.toNumber(),
      parcelas: divida.parcelas.map(p => ({
        ...p,
        valor: p.valor.toNumber()
      })),
      estatisticas: {
        parcelasPagas,
        parcelasVencidas,
        valorPago,
        valorRestante,
        percentualQuitado: Math.round(percentualQuitado),
        proximaParcelaVencimento,
      }
    });
  } catch (error) {
    console.error("Erro ao buscar dívida:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT - Atualizar dívida
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { 
      nome, 
      valorTotal, 
      valorParcela, 
      numeroParcelas,
      parcelasJaPagas,
      dataProximaParcela,
      categoriaId, 
      status 
    } = await req.json();

    // Verificar se a dívida existe e pertence ao usuário
    const dividaExistente = await prisma.divida.findFirst({
      where: {
        id: params.id,
        userId: usuario.id,
      },
      include: {
        parcelas: true
      }
    });

    if (!dividaExistente) {
      return NextResponse.json({ error: "Dívida não encontrada" }, { status: 404 });
    }

    // Verificar se a categoria existe (se fornecida)
    if (categoriaId) {
      const categoria = await prisma.categoria.findFirst({
        where: {
          id: categoriaId,
          userId: usuario.id,
        },
      });

      if (!categoria) {
        return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
      }
    }

    // Se mudou o número de parcelas, valores, parcelas já pagas ou data, recrear parcelas
    const parcelasJaPagasAntes = dividaExistente.parcelas.filter(p => p.status === 'PAGA').length;
    const recalcularParcelas = 
      (numeroParcelas && numeroParcelas !== dividaExistente.numeroParcelas) ||
      (valorParcela && valorParcela !== dividaExistente.valorParcela.toNumber()) ||
      (valorTotal && valorTotal !== dividaExistente.valorTotal.toNumber()) ||
      (parcelasJaPagas !== undefined && parcelasJaPagas !== parcelasJaPagasAntes) ||
      (dataProximaParcela !== undefined); // Sempre recalcular se mudou a data

    if (recalcularParcelas) {
      // Deletar TODAS as parcelas existentes para recriar
      await prisma.parcelaDivida.deleteMany({
        where: { 
          dividaId: params.id
        },
      });

      // Calcular nova data da primeira parcela com timezone correto
      const dataProximaBase = dataProximaParcela || new Date().toISOString().split('T')[0];
      console.log('📅 EDITAR - Data recebida:', {
        dataProximaParcela,
        dataProximaBase,
        parcelasJaPagas,
        parcelasJaPagasAntes
      });
      
      const dataProxima = prepararDataParaBanco(dataProximaBase);
      const parcelasJaFeitas = parcelasJaPagas !== undefined ? parcelasJaPagas : parcelasJaPagasAntes;
      
      console.log('📅 EDITAR - Data preparada:', {
        dataProxima,
        formatada: dataProxima.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        parcelasJaFeitas
      });
      
      // Calcular a data da primeira parcela usando adicionarMeses para manter timezone
      const dataPrimeira = adicionarMeses(dataProxima, -parcelasJaFeitas);
      
      console.log('📅 EDITAR - Data primeira parcela:', {
        dataPrimeira,
        formatada: dataPrimeira.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      });

      // Criar novas parcelas
      const parcelas = [];
      const valorParcelaFinal = valorParcela || dividaExistente.valorParcela.toNumber();
      const numParcelas = numeroParcelas || dividaExistente.numeroParcelas;

      for (let i = 1; i <= numParcelas; i++) {
        const dataVencimento = adicionarMeses(dataPrimeira, i - 1);
        
        const isPaga = i <= parcelasJaFeitas;

        parcelas.push({
          numero: i,
          valor: valorParcelaFinal,
          dataVencimento: dataVencimento,
          status: isPaga ? 'PAGA' as const : 'PENDENTE' as const,
          dividaId: params.id,
        });
      }

      await prisma.parcelaDivida.createMany({
        data: parcelas,
      });
    }

    // Atualizar a dívida
    const dividaAtualizada = await prisma.divida.update({
      where: { id: params.id },
      data: {
        nome: nome || dividaExistente.nome,
        valorTotal: valorTotal || dividaExistente.valorTotal.toNumber(),
        valorParcela: valorParcela || dividaExistente.valorParcela.toNumber(),
        numeroParcelas: numeroParcelas || dividaExistente.numeroParcelas,
        categoriaId: categoriaId !== undefined ? categoriaId : dividaExistente.categoriaId,
        status: status || dividaExistente.status,
      },
      include: {
        categoria: true,
        parcelas: {
          orderBy: { numero: 'asc' },
        },
      },
    });

    return NextResponse.json({
      ...dividaAtualizada,
      valorTotal: dividaAtualizada.valorTotal.toNumber(),
      valorParcela: dividaAtualizada.valorParcela.toNumber(),
      parcelas: dividaAtualizada.parcelas.map(p => ({
        ...p,
        valor: p.valor.toNumber()
      }))
    });
  } catch (error) {
    console.error("Erro ao atualizar dívida:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// DELETE - Excluir dívida
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Verificar se a dívida existe e pertence ao usuário
    const divida = await prisma.divida.findFirst({
      where: {
        id: params.id,
        userId: usuario.id,
      },
    });

    if (!divida) {
      return NextResponse.json({ error: "Dívida não encontrada" }, { status: 404 });
    }

    // Deletar parcelas primeiro
    await prisma.parcelaDivida.deleteMany({
      where: { dividaId: params.id },
    });

    // Deletar a dívida
    await prisma.divida.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Dívida excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir dívida:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
