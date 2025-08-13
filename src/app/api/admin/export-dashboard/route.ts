import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = ['alanvitoraraujo1a@outlook.com', 'admin@meubolso.com'];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';

    // Calcular datas baseadas no período
    const agora = new Date();
    let dataInicio = new Date();
    
    switch (periodo) {
      case 'hoje':
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        dataInicio.setDate(agora.getDate() - 7);
        break;
      case 'mes':
        dataInicio.setMonth(agora.getMonth() - 1);
        break;
      case 'trimestre':
        dataInicio.setMonth(agora.getMonth() - 3);
        break;
      case 'ano':
        dataInicio.setFullYear(agora.getFullYear() - 1);
        break;
    }

    // Buscar dados para exportação
    const usuarios = await prisma.usuario.findMany({
      where: {
        criadoEm: { gte: dataInicio }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
        atualizadoEm: true
      }
    });

    const transacoes = await prisma.transacao.findMany({
      where: {
        data: { gte: dataInicio }
      },
      include: {
        categoria: {
          select: { nome: true }
        },
        user: {
          select: { nome: true, email: true }
        }
      }
    });

    const metas = await prisma.meta.findMany({
      where: {
        criadoEm: { gte: dataInicio }
      },
      include: {
        user: {
          select: { nome: true, email: true }
        }
      }
    });

    // Criar dados em formato CSV/JSON para exportação
    const dadosExportacao = {
      relatorio: {
        periodo,
        dataInicio: dataInicio.toISOString(),
        dataFim: agora.toISOString(),
        geradoEm: agora.toISOString()
      },
      resumo: {
        totalUsuarios: usuarios.length,
        totalTransacoes: transacoes.length,
        totalMetas: metas.length,
        volumeFinanceiro: transacoes.reduce((sum, t) => sum + Number(t.valor), 0)
      },
      usuarios,
      transacoes: transacoes.map(t => ({
        id: t.id,
        descricao: t.descricao,
        valor: Number(t.valor),
        data: t.data.toISOString(),
        categoria: t.categoria?.nome || 'Sem categoria',
        usuario: t.user.nome || 'Usuário sem nome',
        emailUsuario: t.user.email
      })),
      metas: metas.map(m => ({
        id: m.id,
        titulo: m.nome, // Campo correto é 'nome' na tabela meta
        valorAlvo: Number(m.valorAlvo),
        valorAtual: Number(m.currentAmount), // Campo correto é 'currentAmount'
        dataAlvo: m.dataAlvo.toISOString(),
        isCompleted: m.isCompleted,
        categoria: 'Geral', // Meta não tem categoria direta
        usuario: m.user.nome || 'Usuário sem nome'
      }))
    };

    // Retornar como JSON para download
    const response = new NextResponse(JSON.stringify(dadosExportacao, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dashboard-export-${periodo}-${agora.toISOString().split('T')[0]}.json"`
      }
    });

    return response;

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
