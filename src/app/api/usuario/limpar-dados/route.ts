import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const opcoes = await request.json();

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userId = usuario.id;
    const resultados = [];

    // Se "todos os dados" estiver marcado, limpa tudo
    if (opcoes.todosOsDados) {
      // Deletar na ordem correta devido às foreign keys
      await prisma.anexo.deleteMany({ where: { transacao: { userId } } });
      await prisma.tag.deleteMany({ where: { Transacao: { userId } } });
      await prisma.parcelaDivida.deleteMany({ where: { divida: { userId } } });
      await prisma.transacao.deleteMany({ where: { userId } });
      await prisma.transacaoRecorrente.deleteMany({ where: { userId } });
      await prisma.divida.deleteMany({ where: { userId } });
      await prisma.meta.deleteMany({ where: { userId } });
      await prisma.categoria.deleteMany({ where: { userId } });
      
      resultados.push('Todos os dados foram removidos');
    } else {
      // Limpeza seletiva
      if (opcoes.transacoes) {
        // Deletar anexos e tags primeiro
        await prisma.anexo.deleteMany({ where: { transacao: { userId } } });
        await prisma.tag.deleteMany({ where: { Transacao: { userId } } });
        
        const transacoesCount = await prisma.transacao.count({ where: { userId } });
        await prisma.transacao.deleteMany({ where: { userId } });
        resultados.push(`${transacoesCount} transações removidas`);
      }

      if (opcoes.categorias) {
        // Primeiro, atualizar transações para remover referência às categorias
        await prisma.transacao.updateMany({
          where: { userId, categoriaId: { not: null } },
          data: { categoriaId: null }
        });
        
        // Atualizar transações recorrentes para categoria padrão
        const categoriaDefault = await prisma.categoria.findFirst({ 
          where: { userId, tipo: 'ambos' } 
        });
        
        if (categoriaDefault) {
          await prisma.transacaoRecorrente.updateMany({
            where: { userId },
            data: { categoriaId: categoriaDefault.id }
          });
        }

        // Atualizar dívidas
        await prisma.divida.updateMany({
          where: { userId, categoriaId: { not: null } },
          data: { categoriaId: null }
        });
        
        const categoriasCount = await prisma.categoria.count({ where: { userId } });
        await prisma.categoria.deleteMany({ where: { userId } });
        resultados.push(`${categoriasCount} categorias removidas`);
      }

      if (opcoes.metas) {
        // Atualizar transações que referenciam metas
        await prisma.transacao.updateMany({
          where: { userId, metaId: { not: null } },
          data: { metaId: null }
        });
        
        const metasCount = await prisma.meta.count({ where: { userId } });
        await prisma.meta.deleteMany({ where: { userId } });
        resultados.push(`${metasCount} metas removidas`);
      }

      if (opcoes.dividas) {
        // Deletar parcelas primeiro
        await prisma.parcelaDivida.deleteMany({ where: { divida: { userId } } });
        
        const dividasCount = await prisma.divida.count({ where: { userId } });
        await prisma.divida.deleteMany({ where: { userId } });
        resultados.push(`${dividasCount} dívidas removidas`);
      }
    }

    // Atualizar timestamp do usuário
    await prisma.usuario.update({
      where: { id: userId },
      data: { atualizadoEm: new Date() }
    });

    console.log('✅ Limpeza realizada para:', session.user.email, resultados);

    return NextResponse.json({ 
      success: true, 
      message: 'Dados limpos com sucesso',
      resultados 
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
