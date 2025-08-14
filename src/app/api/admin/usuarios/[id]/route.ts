import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        transacoes: true,
        metas: true,
        categorias: true,
        recorrentes: true,
        dividas: true,
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Log da operação para auditoria
    console.log(`🗑️ INICIANDO DELEÇÃO DO USUÁRIO: ${usuario.email}`);
    console.log(`📊 Dados que serão deletados:`);
    console.log(`   - ${usuario.transacoes.length} transações`);
    console.log(`   - ${usuario.metas.length} metas`);
    console.log(`   - ${usuario.categorias.length} categorias`);
    console.log(`   - ${usuario.recorrentes.length} transações recorrentes`);
    console.log(`   - ${usuario.dividas.length} dívidas`);

    // Deletar em transação para garantir integridade
    await prisma.$transaction(async (tx) => {
      // 1. Deletar anexos de transações
      await tx.anexo.deleteMany({
        where: {
          transacao: {
            userId: userId
          }
        }
      });

      // 2. Deletar tags de transações
      await tx.tag.deleteMany({
        where: {
          Transacao: {
            userId: userId
          }
        }
      });

      // 3. Deletar parcelas de dívidas
      await tx.parcelaDivida.deleteMany({
        where: {
          divida: {
            userId: userId
          }
        }
      });

      // 4. Deletar dívidas
      await tx.divida.deleteMany({
        where: {
          userId: userId
        }
      });

      // 5. Deletar transações
      await tx.transacao.deleteMany({
        where: {
          userId: userId
        }
      });

      // 6. Deletar transações recorrentes
      await tx.transacaoRecorrente.deleteMany({
        where: {
          userId: userId
        }
      });

      // 7. Deletar metas
      await tx.meta.deleteMany({
        where: {
          userId: userId
        }
      });

      // 8. Deletar categorias
      await tx.categoria.deleteMany({
        where: {
          userId: userId
        }
      });

      // 9. Deletar perfil financeiro se existir
      await tx.perfilFinanceiro.deleteMany({
        where: {
          userEmail: usuario.email
        }
      });

      // 10. Finalmente, deletar o usuário
      await tx.usuario.delete({
        where: {
          id: userId
        }
      });
    });

    console.log(`✅ USUÁRIO DELETADO COM SUCESSO: ${usuario.email}`);

    return NextResponse.json({
      success: true,
      message: 'Usuário e todos os dados associados foram deletados com sucesso',
      dados_deletados: {
        usuario: usuario.email,
        transacoes: usuario.transacoes.length,
        metas: usuario.metas.length,
        categorias: usuario.categorias.length,
        recorrentes: usuario.recorrentes.length,
        dividas: usuario.dividas.length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
