import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userId = usuario.id;

    // Deletar todos os dados do usuário na ordem correta
    console.log('🗑️ Iniciando exclusão completa da conta:', usuario.email);

    // 1. Deletar anexos
    await prisma.anexo.deleteMany({ 
      where: { transacao: { userId } } 
    });

    // 2. Deletar tags
    await prisma.tag.deleteMany({ 
      where: { Transacao: { userId } } 
    });

    // 3. Deletar parcelas de dívidas
    await prisma.parcelaDivida.deleteMany({ 
      where: { divida: { userId } } 
    });

    // 4. Deletar transações
    await prisma.transacao.deleteMany({ 
      where: { userId } 
    });

    // 5. Deletar transações recorrentes
    await prisma.transacaoRecorrente.deleteMany({ 
      where: { userId } 
    });

    // 6. Deletar dívidas
    await prisma.divida.deleteMany({ 
      where: { userId } 
    });

    // 7. Deletar metas
    await prisma.meta.deleteMany({ 
      where: { userId } 
    });

    // 8. Deletar categorias
    await prisma.categoria.deleteMany({ 
      where: { userId } 
    });

    // 9. Finalmente, deletar o usuário
    await prisma.usuario.delete({ 
      where: { id: userId } 
    });

    console.log('✅ Conta excluída com sucesso:', usuario.email);

    return NextResponse.json({ 
      success: true, 
      message: 'Conta excluída com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
