import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';


// GET - Estatísticas gerais das dívidas do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar todas as dívidas do usuário
    const dividas = await prisma.divida.findMany({
      where: { userId: usuario.id },
      include: {
        parcelas: true,
        categoria: true,
      },
    });

    // Calcular estatísticas gerais
    const totalDividas = dividas.length;
    const dividasAtivas = dividas.filter(d => d.status === 'ATIVA').length;
    const dividasQuitadas = dividas.filter(d => d.status === 'QUITADA').length;

    const valorTotalDividas = dividas.reduce((acc, d) => acc + d.valorTotal.toNumber(), 0);
    const valorTotalPago = dividas.reduce((acc, divida) => {
      const parcelasPagas = divida.parcelas.filter(p => p.status === 'PAGA').length;
      return acc + (parcelasPagas * divida.valorParcela.toNumber());
    }, 0);
    const valorTotalRestante = valorTotalDividas - valorTotalPago;

    // Parcelas vencidas
    const hoje = new Date();
    const parcelasVencidas = dividas.reduce((acc, divida) => {
      const vencidas = divida.parcelas.filter(p => 
        p.status === 'PENDENTE' && new Date(p.dataVencimento) < hoje
      ).length;
      return acc + vencidas;
    }, 0);

    // Próximas parcelas (próximos 30 dias)
    const em30Dias = new Date();
    em30Dias.setDate(em30Dias.getDate() + 30);
    
    const proximasParcelas = dividas.reduce((acc, divida) => {
      const proximas = divida.parcelas.filter(p => 
        p.status === 'PENDENTE' && 
        new Date(p.dataVencimento) >= hoje && 
        new Date(p.dataVencimento) <= em30Dias
      );
      return acc.concat(proximas.map(p => ({
        ...p,
        valor: p.valor.toNumber(),
        dividaNome: divida.nome,
        categoria: divida.categoria
      })));
    }, [] as any[]);

    // Distribuição por categoria
    const dividasPorCategoria = dividas.reduce((acc, divida) => {
      const categoriaNome = divida.categoria?.nome || 'Sem categoria';
      if (!acc[categoriaNome]) {
        acc[categoriaNome] = {
          nome: categoriaNome,
          quantidade: 0,
          valorTotal: 0,
          valorRestante: 0,
        };
      }
      
      const parcelasPagas = divida.parcelas.filter(p => p.status === 'PAGA').length;
      const valorPago = parcelasPagas * divida.valorParcela.toNumber();
      const valorRestante = divida.valorTotal.toNumber() - valorPago;

      acc[categoriaNome].quantidade++;
      acc[categoriaNome].valorTotal += divida.valorTotal.toNumber();
      acc[categoriaNome].valorRestante += valorRestante;
      
      return acc;
    }, {} as any);

    // Média de valor por dívida
    const valorMedioPorDivida = totalDividas > 0 ? valorTotalDividas / totalDividas : 0;

    // Percentual de dívidas quitadas
    const percentualQuitadas = totalDividas > 0 ? (dividasQuitadas / totalDividas) * 100 : 0;

    return NextResponse.json({
      resumo: {
        totalDividas,
        dividasAtivas,
        dividasQuitadas,
        valorTotalDividas,
        valorTotalPago,
        valorTotalRestante,
        valorMedioPorDivida,
        percentualQuitadas: Math.round(percentualQuitadas),
        parcelasVencidas,
      },
      proximasParcelas: proximasParcelas
        .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
        .slice(0, 10), // Próximas 10 parcelas
      dividasPorCategoria: Object.values(dividasPorCategoria),
      insights: [
        ...(parcelasVencidas > 0 ? [{
          tipo: 'warning',
          titulo: 'Parcelas Vencidas',
          descricao: `Você tem ${parcelasVencidas} parcela(s) vencida(s)`,
          icone: '⚠️'
        }] : []),
        ...(proximasParcelas.length > 0 ? [{
          tipo: 'info',
          titulo: 'Próximas Parcelas',
          descricao: `${proximasParcelas.length} parcela(s) vencem nos próximos 30 dias`,
          icone: '📅'
        }] : []),
        ...(dividasQuitadas > 0 ? [{
          tipo: 'success',
          titulo: 'Progresso',
          descricao: `${dividasQuitadas} dívida(s) já quitada(s) - parabéns!`,
          icone: '🎉'
        }] : []),
        ...(valorTotalRestante === 0 ? [{
          tipo: 'success',
          titulo: 'Liberdade Financeira',
          descricao: 'Todas as suas dívidas foram quitadas!',
          icone: '🆓'
        }] : [])
      ]
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas das dívidas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
