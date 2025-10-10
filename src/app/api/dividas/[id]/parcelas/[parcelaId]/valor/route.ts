import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Editar valor de uma parcela específica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, parcelaId: string } }
) {
  console.log('� === INICIANDO EDIÇÃO DE VALOR ===');
  console.log('� Params recebidos:', params);
  
  try {
    // 1. Verificar sessão
    const session = await getServerSession(authOptions);
    console.log('👤 Sessão:', session?.user?.email || 'Não encontrada');
    
    if (!session?.user?.email) {
      console.log('❌ ERRO: Usuário não autenticado');
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    // 2. Obter dados da requisição
    const body = await request.json();
    console.log('� Body da requisição:', body);
    
    const { novoValor } = body;
    const valor = parseFloat(novoValor);
    
    console.log('💰 Valor a ser salvo:', valor, typeof valor);

    // 3. Validar valor
    if (!valor || valor <= 0 || isNaN(valor)) {
      console.log('❌ ERRO: Valor inválido -', valor);
      return NextResponse.json({ 
        error: "Valor deve ser um número positivo",
        valorRecebido: valor,
        tipo: typeof valor
      }, { status: 400 });
    }

    // 4. Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      console.log('❌ ERRO: Usuário não encontrado no banco');
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', usuario.nome || usuario.email);

    // 5. Verificar se a parcela existe e pertence ao usuário
    const parcela = await prisma.parcelaDivida.findFirst({
      where: {
        id: params.parcelaId,
        divida: {
          id: params.id,
          userId: usuario.id
        }
      },
      include: {
        divida: true
      }
    });

    if (!parcela) {
      console.log('❌ ERRO: Parcela não encontrada ou não pertence ao usuário');
      return NextResponse.json({ error: "Parcela não encontrada" }, { status: 404 });
    }

    console.log('📋 Parcela encontrada:', {
      numero: parcela.numero,
      valorAtual: parcela.valor.toNumber(),
      status: parcela.status,
      dividaNome: parcela.divida.nome
    });

    // 6. Verificar se pode editar
    if (parcela.status === 'PAGA') {
      console.log('❌ ERRO: Tentando editar parcela já paga');
      return NextResponse.json({ 
        error: "Não é possível editar parcelas já pagas" 
      }, { status: 400 });
    }

    // 7. Atualizar a parcela
    console.log('� Atualizando parcela...');
    const parcelaAtualizada = await prisma.parcelaDivida.update({
      where: { id: params.parcelaId },
      data: { valor: valor }
    });

    console.log('✅ Parcela atualizada:', {
      de: parcela.valor.toNumber(),
      para: parcelaAtualizada.valor.toNumber()
    });

    // 8. Recalcular valor total da dívida
    console.log('🧮 Recalculando valor total da dívida...');
    const todasParcelas = await prisma.parcelaDivida.findMany({
      where: { dividaId: params.id }
    });

    const novoValorTotal = todasParcelas.reduce((acc: number, p: any) => acc + p.valor.toNumber(), 0);
    console.log('💰 Novo valor total calculado:', novoValorTotal);

    // 9. Atualizar dívida
    await prisma.divida.update({
      where: { id: params.id },
      data: { 
        valorTotal: novoValorTotal,
        valorParcela: novoValorTotal / parcela.divida.numeroParcelas
      }
    });

    console.log('🎉 === EDIÇÃO CONCLUÍDA COM SUCESSO ===');

    return NextResponse.json({
      success: true,
      message: "Valor atualizado com sucesso!",
      parcela: {
        id: parcelaAtualizada.id,
        numero: parcela.numero,
        valorAnterior: parcela.valor.toNumber(),
        valorNovo: parcelaAtualizada.valor.toNumber(),
      },
      divida: {
        id: params.id,
        novoValorTotal: novoValorTotal
      }
    });

  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error);
    return NextResponse.json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}