import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API para conversão automática de dívidas em transações recorrentes
 * Converte quando restam 10 ou menos parcelas
 */
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

    const { dividaId } = await req.json();

    if (!dividaId) {
      return NextResponse.json({ error: "ID da dívida é obrigatório" }, { status: 400 });
    }

    // Buscar dívida com parcelas
    const divida = await prisma.divida.findUnique({
      where: { 
        id: dividaId,
        userId: usuario.id 
      },
      include: { 
        parcelas: {
          orderBy: { numero: 'asc' }
        },
        categoria: true
      },
    });

    if (!divida) {
      return NextResponse.json({ error: "Dívida não encontrada" }, { status: 404 });
    }

    // Verificar quantas parcelas restam
    const parcelasRestantes = divida.parcelas.filter(p => p.status === 'PENDENTE');
    
    if (parcelasRestantes.length > 10) {
      return NextResponse.json({ 
        error: "Ainda restam mais de 10 parcelas. Conversão disponível apenas quando restam 10 ou menos parcelas." 
      }, { status: 400 });
    }

    if (parcelasRestantes.length === 0) {
      return NextResponse.json({ 
        error: "Não há parcelas pendentes para converter." 
      }, { status: 400 });
    }

    // Verificar se já existe transação recorrente para esta dívida
    const recorrenteExistente = await prisma.transacaoRecorrente.findFirst({
      where: {
        userId: usuario.id,
        descricao: {
          contains: divida.nome
        }
      }
    });

    if (recorrenteExistente) {
      return NextResponse.json({ 
        error: "Já existe uma transação recorrente relacionada a esta dívida." 
      }, { status: 400 });
    }

    // Criar transação recorrente baseada na dívida
    const proximaParcela = parcelasRestantes[0];
    const ultimaParcela = parcelasRestantes[parcelasRestantes.length - 1];

    const dadosRecorrente: any = {
      userId: usuario.id,
      tipo: 'despesa' as const,
      valor: divida.valorParcela,
      descricao: `💳 ${divida.nome} - Parcela (Auto-gerada)`,
      frequencia: 'mensal' as const,
      dataInicio: proximaParcela.dataVencimento,
      dataFim: ultimaParcela.dataVencimento,
      isActive: true,
    };

    if (divida.categoriaId) {
      dadosRecorrente.categoriaId = divida.categoriaId;
    }

    const transacaoRecorrente = await prisma.transacaoRecorrente.create({
      data: dadosRecorrente,
    });

    // Log para auditoria
    console.log(`🔄 CONVERSÃO AUTOMÁTICA REALIZADA:`);
    console.log(`   📋 Dívida: ${divida.nome}`);
    console.log(`   💰 Valor: R$ ${divida.valorParcela}`);
    console.log(`   📅 De: ${proximaParcela.dataVencimento.toLocaleDateString('pt-BR')}`);
    console.log(`   📅 Até: ${ultimaParcela.dataVencimento.toLocaleDateString('pt-BR')}`);
    console.log(`   📊 Parcelas restantes: ${parcelasRestantes.length}`);

    return NextResponse.json({
      success: true,
      message: `Dívida "${divida.nome}" convertida em transação recorrente com sucesso!`,
      transacaoRecorrente: {
        id: transacaoRecorrente.id,
        descricao: transacaoRecorrente.descricao,
        valor: transacaoRecorrente.valor,
        dataInicio: transacaoRecorrente.dataInicio,
        dataFim: transacaoRecorrente.dataFim,
        parcelasRestantes: parcelasRestantes.length,
      },
      dataPrevistaQuitacao: ultimaParcela.dataVencimento,
    });

  } catch (error) {
    console.error('❌ Erro na conversão automática:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Verificar dívidas elegíveis para conversão automática
 */
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

    // Buscar todas as dívidas ativas do usuário
    const dividas = await prisma.divida.findMany({
      where: {
        userId: usuario.id,
        status: 'ATIVA'
      },
      include: {
        parcelas: {
          orderBy: { numero: 'asc' }
        },
        categoria: true
      }
    });

    // Analisar quais são elegíveis para conversão
    const elegiveisParaConversao = dividas.map(divida => {
      const parcelasRestantes = divida.parcelas.filter(p => p.status === 'PENDENTE');
      const parcelasPagas = divida.parcelas.filter(p => p.status === 'PAGA');
      const ultimaParcela = parcelasRestantes[parcelasRestantes.length - 1];
      
      // Calcular data prevista de quitação
      const dataPrevistaQuitacao = ultimaParcela?.dataVencimento;
      
      // Calcular progresso
      const progressoPercentual = (parcelasPagas.length / divida.numeroParcelas) * 100;
      
      return {
        id: divida.id,
        nome: divida.nome,
        valorParcela: divida.valorParcela,
        parcelasRestantes: parcelasRestantes.length,
        parcelasPagas: parcelasPagas.length,
        totalParcelas: divida.numeroParcelas,
        progressoPercentual: Math.round(progressoPercentual),
        dataPrevistaQuitacao,
        elegivel: parcelasRestantes.length <= 10 && parcelasRestantes.length > 0,
        categoria: divida.categoria?.nome || 'Sem categoria',
        proximaParcelaData: parcelasRestantes[0]?.dataVencimento,
      };
    }).filter(divida => divida.elegivel);

    return NextResponse.json({
      total: elegiveisParaConversao.length,
      dividas: elegiveisParaConversao,
      criterios: {
        maxParcelasRestantes: 10,
        tipo: 'Conversão automática para recorrente'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dívidas elegíveis:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
