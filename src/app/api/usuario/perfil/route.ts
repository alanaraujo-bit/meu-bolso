import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 === CARREGANDO PERFIL ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados do usuário com configurações
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    }) as any;

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Contar estatísticas separadamente
    const totalTransacoes = await prisma.transacao.count({
      where: { userId: usuario.id }
    });
    
    const totalCategorias = await prisma.categoria.count({
      where: { userId: usuario.id }
    });
    
    const totalMetas = await prisma.meta.count({
      where: { userId: usuario.id }
    });
    
    const totalDividas = await prisma.divida.count({
      where: { userId: usuario.id }
    });

    // Calcular valor total movimentado
    const transacoes = await prisma.transacao.findMany({
      where: { userId: usuario.id },
      select: { valor: true }
    });

    const valorTotalMovimentado = transacoes.reduce((total, transacao) => {
      return total + Number(transacao.valor);
    }, 0);

    // Calcular tempo de uso em dias
    const tempoUso = Math.floor(
      (new Date().getTime() - new Date(usuario.criadoEm).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Configurações do usuário (com fallback para valores padrão)
    const configuracoes = {
      tema: usuario.tema || 'automatico',
      formatoMoeda: usuario.formatoMoeda || 'BRL',
      confirmarExclusoes: usuario.confirmarExclusoes ?? true,
      timeoutSessao: usuario.timeoutSessao || 60,
      paginaInicial: usuario.paginaInicial || 'dashboard',
      mostrarTooltips: usuario.mostrarTooltips ?? true,
    };

    const perfil = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      avatarUrl: usuario.avatarUrl,
      criadoEm: usuario.criadoEm,
      atualizadoEm: usuario.atualizadoEm,
      ultimaAtividade: usuario.ultimaAtividade,
      configuracoes,
      estatisticas: {
        totalTransacoes,
        totalCategorias,
        totalMetas,
        totalDividas,
        valorTotalMovimentado,
        tempoUso,
        ultimoLogin: usuario.ultimaAtividade
      }
    };

    console.log('✅ Perfil carregado:', {
      usuario: usuario.email,
      configuracoes
    });

    return NextResponse.json({ perfil });
  } catch (error) {
    console.error('💥 Erro ao buscar perfil:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
