import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com',
  'admin@meubolso.com',
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'todos';

    // Filtros
    let whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const agora = new Date();
    if (status === 'ativos') {
      const setesDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      whereClause.atualizadoEm = { gte: setesDiasAtras };
    } else if (status === 'inativos') {
      const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
      whereClause.atualizadoEm = { lt: trintaDiasAtras };
    }

    // Buscar todos os usuários para export
    const usuarios = await prisma.usuario.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            transacoes: true,
            metas: true,
            categorias: true,
            recorrentes: true,
          }
        }
      },
      orderBy: {
        atualizadoEm: 'desc'
      }
    });

    // Calcular estatísticas de cada usuário
    const usuariosComEstatisticas = await Promise.all(
      usuarios.map(async (usuario) => {
        const valorTotal = await prisma.transacao.aggregate({
          where: { userId: usuario.id },
          _sum: { valor: true }
        });

        const diasInativo = Math.floor(
          (agora.getTime() - usuario.atualizadoEm.getTime()) / (1000 * 60 * 60 * 24)
        );

        let statusAtividade = 'ativo';
        if (diasInativo > 30) statusAtividade = 'inativo';
        else if (diasInativo > 7) statusAtividade = 'pouco_ativo';

        return {
          id: usuario.id,
          nome: usuario.nome || 'Usuário sem nome',
          email: usuario.email,
          criadoEm: usuario.criadoEm.toLocaleDateString('pt-BR'),
          atualizadoEm: usuario.atualizadoEm.toLocaleDateString('pt-BR'),
          diasInativo,
          statusAtividade,
          totalTransacoes: usuario._count.transacoes,
          totalMetas: usuario._count.metas,
          totalCategorias: usuario._count.categorias,
          totalRecorrentes: usuario._count.recorrentes,
          valorTotalMovimentado: Number(valorTotal._sum.valor || 0),
        };
      })
    );

    // Gerar CSV
    const csvHeader = [
      'ID',
      'Nome',
      'Email',
      'Data de Cadastro',
      'Última Atividade',
      'Dias Inativo',
      'Status',
      'Total de Transações',
      'Total de Metas',
      'Total de Categorias',
      'Recorrentes Ativas',
      'Valor Total Movimentado'
    ].join(',');

    const csvRows = usuariosComEstatisticas.map(usuario => [
      usuario.id,
      `"${usuario.nome}"`,
      usuario.email,
      usuario.criadoEm,
      usuario.atualizadoEm,
      usuario.diasInativo,
      usuario.statusAtividade,
      usuario.totalTransacoes,
      usuario.totalMetas,
      usuario.totalCategorias,
      usuario.totalRecorrentes,
      `"R$ ${usuario.valorTotalMovimentado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}"`
    ].join(','));

    const csvContent = [
      `# RELATÓRIO DE USUÁRIOS - MEU BOLSO`,
      `# Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      `# Filtros aplicados: ${search ? `Busca: "${search}", ` : ''}Status: ${status}`,
      `# Total de usuários: ${usuariosComEstatisticas.length}`,
      ``,
      csvHeader,
      ...csvRows
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="usuarios-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Erro ao exportar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
