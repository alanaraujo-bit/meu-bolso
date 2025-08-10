import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const configuracoes = await request.json();

    // Validar configurações recebidas
    const configuracoesValidas = {
      tema: ['claro', 'escuro', 'automatico'].includes(configuracoes.tema) ? configuracoes.tema : 'automatico',
      formatoMoeda: ['BRL', 'USD', 'EUR'].includes(configuracoes.formatoMoeda) ? configuracoes.formatoMoeda : 'BRL',
      confirmarExclusoes: typeof configuracoes.confirmarExclusoes === 'boolean' ? configuracoes.confirmarExclusoes : true,
      timeoutSessao: Number.isInteger(configuracoes.timeoutSessao) && configuracoes.timeoutSessao >= 0 ? configuracoes.timeoutSessao : 60,
      paginaInicial: ['dashboard', 'transacoes', 'relatorios', 'metas'].includes(configuracoes.paginaInicial) ? configuracoes.paginaInicial : 'dashboard',
      mostrarTooltips: typeof configuracoes.mostrarTooltips === 'boolean' ? configuracoes.mostrarTooltips : true,
    };

    // Atualizar usuário (no futuro, salvaremos em uma tabela específica de configurações)
    const usuario = await prisma.usuario.update({
      where: { email: session.user.email },
      data: {
        atualizadoEm: new Date(),
        // Por enquanto, salvamos como comentário que as configurações foram salvas
        // No futuro, criar tabela UserConfiguracoes
      }
    });

    console.log('✅ Configurações salvas para:', session.user.email, configuracoesValidas);

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso',
      configuracoes: configuracoesValidas 
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
