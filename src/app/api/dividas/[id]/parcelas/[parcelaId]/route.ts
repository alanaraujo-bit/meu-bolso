import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prepararDataParaBanco } from '@/lib/dateUtils';

// PUT - Atualizar parcela específica de uma dívida
export async function PUT(req: NextRequest, { params }: { params: { id: string; parcelaId: string } }) {
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

    const { status, dataVencimento, valor, observacoes } = await req.json();

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

    // Verificar se a parcela existe
    const parcelaExistente = await prisma.parcelaDivida.findFirst({
      where: {
        id: params.parcelaId,
        dividaId: params.id,
      },
    });

    if (!parcelaExistente) {
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {};

    if (status !== undefined) {
      if (!['PAGA', 'PENDENTE', 'VENCIDA'].includes(status)) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      }
      dadosAtualizacao.status = status;
    }

    if (dataVencimento !== undefined) {
      dadosAtualizacao.dataVencimento = prepararDataParaBanco(dataVencimento);
      console.log('📅 Debug - Atualizando data vencimento parcela:', {
        original: dataVencimento,
        preparada: dadosAtualizacao.dataVencimento,
        formatada: dadosAtualizacao.dataVencimento.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      });
    }

    if (valor !== undefined) {
      dadosAtualizacao.valor = valor;
    }

    if (observacoes !== undefined) {
      dadosAtualizacao.observacoes = observacoes;
    }

    // Atualizar a parcela
    const parcelaAtualizada = await prisma.parcelaDivida.update({
      where: { id: params.parcelaId },
      data: dadosAtualizacao,
    });

    // Verificar se todas as parcelas estão pagas para atualizar status da dívida
    const todasParcelas = await prisma.parcelaDivida.findMany({
      where: { dividaId: params.id },
    });

    const parcelasRestantes = todasParcelas.filter(p => p.status === 'PENDENTE').length;
    
    if (parcelasRestantes === 0 && divida.status === 'ATIVA') {
      // Todas as parcelas foram pagas, marcar dívida como quitada
      await prisma.divida.update({
        where: { id: params.id },
        data: { status: 'QUITADA' },
      });
    } else if (parcelasRestantes > 0 && divida.status === 'QUITADA') {
      // Tem parcelas pendentes, voltar status para ativa
      await prisma.divida.update({
        where: { id: params.id },
        data: { status: 'ATIVA' },
      });
    }

    // Retornar parcela atualizada
    const parcelaFinal = await prisma.parcelaDivida.findUnique({
      where: { id: params.parcelaId },
    });

    return NextResponse.json({
      ...parcelaFinal,
      valor: parcelaFinal?.valor.toNumber()
    });
  } catch (error) {
    console.error("Erro ao atualizar parcela:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
