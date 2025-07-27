import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'alanvitoraraujo1a@outlook.com') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tipo = searchParams.get('tipo') || 'todos';
    const ordenacao = searchParams.get('ordenacao') || 'valor_desc';

    // Construir where clause
    const whereClause: any = {
      ...(tipo !== 'todos' && { tipo }),
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { user: { nome: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    // Buscar categorias com estatísticas
    const categorias = await prisma.categoria.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        transacoes: {
          select: {
            valor: true,
            data: true
          }
        }
      }
    });

    // Processar dados das categorias
    const categoriasComEstatisticas = categorias.map(categoria => {
      const transacoes = categoria.transacoes;
      const totalTransacoes = transacoes.length;
      const valorTotal = transacoes.reduce((sum, t) => sum + Number(t.valor), 0);
      const mediaTransacao = totalTransacoes > 0 ? valorTotal / totalTransacoes : 0;
      const ultimaTransacao = transacoes.length > 0 
        ? transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0].data
        : null;

      return {
        id: categoria.id,
        nome: categoria.nome,
        cor: categoria.cor || '#6B7280',
        icone: categoria.icone || '📁',
        tipo: categoria.tipo,
        userId: categoria.userId,
        usuarioNome: categoria.user?.nome || 'N/A',
        usuarioEmail: categoria.user?.email || 'N/A',
        totalTransacoes,
        valorTotal,
        mediaTransacao,
        ultimaTransacao: ultimaTransacao?.toISOString() || null
      };
    });

    // Aplicar ordenação
    categoriasComEstatisticas.sort((a, b) => {
      switch (ordenacao) {
        case 'valor_desc':
          return b.valorTotal - a.valorTotal;
        case 'valor_asc':
          return a.valorTotal - b.valorTotal;
        case 'transacoes_desc':
          return b.totalTransacoes - a.totalTransacoes;
        case 'transacoes_asc':
          return a.totalTransacoes - b.totalTransacoes;
        case 'nome_asc':
          return a.nome.localeCompare(b.nome);
        case 'nome_desc':
          return b.nome.localeCompare(a.nome);
        default:
          return b.valorTotal - a.valorTotal;
      }
    });

    // Buscar estatísticas gerais
    const [totalCategorias, categoriasReceita, categoriasDespesa] = await Promise.all([
      prisma.categoria.count(),
      prisma.categoria.count({ where: { tipo: 'receita' } }),
      prisma.categoria.count({ where: { tipo: 'despesa' } })
    ]);

    // Calcular estatísticas agregadas
    const valorTotalMovimentado = categoriasComEstatisticas.reduce((sum, cat) => sum + cat.valorTotal, 0);
    const categoriasMaisUsadas = categoriasComEstatisticas.filter(cat => cat.totalTransacoes > 0).length;

    const stats = {
      totalCategorias,
      categoriasMaisUsadas,
      valorTotalMovimentado,
      categoriasReceita,
      categoriasDespesa
    };

    // Criar estatísticas para gráfico (top categorias)
    const totalGeral = categoriasComEstatisticas.reduce((sum, cat) => sum + cat.valorTotal, 0);
    const estatisticas = categoriasComEstatisticas
      .filter(cat => cat.totalTransacoes > 0)
      .map(cat => ({
        nome: cat.nome,
        cor: cat.cor,
        totalTransacoes: cat.totalTransacoes,
        valorTotal: cat.valorTotal,
        percentual: totalGeral > 0 ? (cat.valorTotal / totalGeral) * 100 : 0
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    return NextResponse.json({
      categorias: categoriasComEstatisticas,
      estatisticas,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar categorias globais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
