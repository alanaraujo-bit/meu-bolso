import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔄 Carregando configuracoes');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.log('❌ Usuario nao autenticado');
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    }) as any;

    if (!usuario) {
      console.log('❌ Usuario nao encontrado');
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
    }

    // Configuracoes com valores padrao
    const configuracoes = {
      tema: usuario.tema || 'automatico',
      formatoMoeda: usuario.formatoMoeda || 'BRL',
      confirmarExclusoes: usuario.confirmarExclusoes ?? true,
      timeoutSessao: usuario.timeoutSessao || 60,
      paginaInicial: usuario.paginaInicial || 'dashboard',
      mostrarTooltips: usuario.mostrarTooltips ?? true,
    };

    console.log('✅ Configuracoes carregadas:', configuracoes);

    return NextResponse.json({ configuracoes });
  } catch (error) {
    console.error('❌ Erro ao buscar configuracoes:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('💾 Iniciando salvamento de configurações');
    
    const session = await getServerSession(authOptions);
    console.log('🔐 Sessão verificada:', session?.user?.email || 'não autenticado');
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Dados recebidos:', body);
    
    const configuracoes = body;

    // Validações simples
    const configuracoesValidas: any = {};

    if (configuracoes.tema && ['claro', 'escuro', 'automatico'].includes(configuracoes.tema)) {
      configuracoesValidas.tema = configuracoes.tema;
    }

    if (configuracoes.formatoMoeda && ['BRL', 'USD', 'EUR'].includes(configuracoes.formatoMoeda)) {
      configuracoesValidas.formatoMoeda = configuracoes.formatoMoeda;
    }

    if (typeof configuracoes.confirmarExclusoes === 'boolean') {
      configuracoesValidas.confirmarExclusoes = configuracoes.confirmarExclusoes;
    }

    if (typeof configuracoes.timeoutSessao === 'number') {
      configuracoesValidas.timeoutSessao = configuracoes.timeoutSessao;
    }

    if (configuracoes.paginaInicial && ['dashboard', 'transacoes', 'categorias', 'metas', 'relatorios'].includes(configuracoes.paginaInicial)) {
      configuracoesValidas.paginaInicial = configuracoes.paginaInicial;
    }

    if (typeof configuracoes.mostrarTooltips === 'boolean') {
      configuracoesValidas.mostrarTooltips = configuracoes.mostrarTooltips;
    }

    console.log('✅ Configurações válidas:', configuracoesValidas);

    if (Object.keys(configuracoesValidas).length === 0) {
      return NextResponse.json({ error: 'Nenhuma configuração válida fornecida' }, { status: 400 });
    }

    // Atualizar no banco
    const usuarioAtualizado = await prisma.usuario.update({
      where: { email: session.user.email },
      data: {
        ...configuracoesValidas,
        atualizadoEm: new Date()
      }
    });

    console.log('✅ Configurações salvas com sucesso para:', session.user.email);

    return NextResponse.json({
      message: 'Configurações salvas com sucesso',
      configuracoes: configuracoesValidas,
      success: true
    });

  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
