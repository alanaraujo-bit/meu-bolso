import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nome: true,
        email: true,
        avatarUrl: true,
        criadoEm: true,
        atualizadoEm: true,
        ultimaAtividade: true,
        // Contar estatísticas
        _count: {
          select: {
            transacoes: true,
            categorias: true,
            metas: true,
            dividas: true
          }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Calcular valor total movimentado
    const transacoes = await prisma.transacao.findMany({
      where: { userId: usuario.id },
      select: { valor: true }
    });

    const valorTotalMovimentado = transacoes.reduce((total, transacao) => {
      return total + Number(transacao.valor);
    }, 0);

    // Calcular tempo de uso (dias desde o cadastro)
    const tempoUso = Math.floor(
      (new Date().getTime() - new Date(usuario.criadoEm).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Configurações padrão (podem ser expandidas no futuro)
    const configuracoes = {
      tema: 'automatico',
      formatoMoeda: 'BRL',
      confirmarExclusoes: true,
      timeoutSessao: 60,
      paginaInicial: 'dashboard',
      mostrarTooltips: true,
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
        totalTransacoes: usuario._count.transacoes,
        totalCategorias: usuario._count.categorias,
        totalMetas: usuario._count.metas,
        totalDividas: usuario._count.dividas,
        valorTotalMovimentado,
        tempoUso,
        ultimoLogin: usuario.ultimaAtividade
      }
    };

    return NextResponse.json({ perfil });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
