import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const formato = searchParams.get('formato') || 'csv';
    const periodo = searchParams.get('periodo') || '30d';
    
    // Buscar dados das métricas
    const response = await fetch(`${request.url.split('/api')[0]}/api/admin/metrics-avancado?periodo=${periodo}`);
    const dados = await response.json();

    if (formato === 'csv') {
      // Gerar CSV
      const csvContent = gerarCSV(dados, periodo);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="relatorio-admin-${periodo}.csv"`,
        },
      });
    } else if (formato === 'pdf') {
      // Para PDF, retornar dados para o frontend gerar
      return NextResponse.json({
        message: 'Funcionalidade PDF será implementada no frontend',
        dados
      });
    }

    return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function gerarCSV(dados: any, periodo: string): string {
  const linhas = [];
  
  // Header
  linhas.push('RELATÓRIO ADMINISTRATIVO - MEU BOLSO');
  linhas.push(`Período: ${periodo}`);
  linhas.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
  linhas.push('');
  
  // KPIs
  linhas.push('=== KPIS PRINCIPAIS ===');
  linhas.push('Métrica,Valor');
  linhas.push(`Total de Usuários,${dados.kpis.totalUsuarios}`);
  linhas.push(`Usuários Ativos (7d),${dados.kpis.usuariosAtivos7d}`);
  linhas.push(`Novos Usuários (30d),${dados.kpis.novosUsuarios30d}`);
  linhas.push(`Total de Transações,${dados.kpis.totalTransacoes}`);
  linhas.push(`Volume Financeiro Total,R$ ${dados.kpis.volumeFinanceiroTotal.toLocaleString('pt-BR')}`);
  linhas.push(`Metas Ativas,${dados.kpis.metasAtivas}`);
  linhas.push(`Taxa de Retenção,${dados.kpis.taxaRetencao}%`);
  linhas.push(`Ticket Médio por Usuário,R$ ${dados.kpis.ticketMedio.toLocaleString('pt-BR')}`);
  linhas.push('');
  
  // Transações Diárias
  linhas.push('=== TRANSAÇÕES DIÁRIAS ===');
  linhas.push('Data,Total de Transações,Valor Total');
  dados.graficos.transacoesDiarias.forEach((dia: any) => {
    linhas.push(`${dia.data},${dia.total},R$ ${dia.valor.toLocaleString('pt-BR')}`);
  });
  linhas.push('');
  
  // Tipos de Transação
  linhas.push('=== TIPOS DE TRANSAÇÃO ===');
  linhas.push('Tipo,Quantidade,Valor Total');
  dados.graficos.tiposTransacao.forEach((tipo: any) => {
    linhas.push(`${tipo.tipo},${tipo.count},R$ ${tipo.valor.toLocaleString('pt-BR')}`);
  });
  linhas.push('');
  
  // Usuários Mais Ativos
  linhas.push('=== USUÁRIOS MAIS ATIVOS ===');
  linhas.push('Nome,Email,Transações,Valor Total');
  dados.rankings.usuariosMaisAtivos.forEach((usuario: any) => {
    linhas.push(`${usuario.nome},${usuario.email},${usuario.transacoes},R$ ${usuario.valorTotal.toLocaleString('pt-BR')}`);
  });
  linhas.push('');
  
  // Categorias Mais Usadas
  linhas.push('=== CATEGORIAS MAIS USADAS ===');
  linhas.push('Nome,Total de Transações,Valor Total');
  dados.rankings.categoriasMaisUsadas.forEach((categoria: any) => {
    linhas.push(`${categoria.nome},${categoria.totalTransacoes},R$ ${categoria.valorTotal.toLocaleString('pt-BR')}`);
  });
  linhas.push('');
  
  // Top Metas
  linhas.push('=== TOP METAS ===');
  linhas.push('Nome,Valor Alvo,Valor Atual,Status');
  dados.rankings.topMetas.forEach((meta: any) => {
    const status = meta.concluida ? 'Concluída' : 'Em andamento';
    linhas.push(`${meta.nome},R$ ${meta.valorAlvo.toLocaleString('pt-BR')},R$ ${meta.valorAtual.toLocaleString('pt-BR')},${status}`);
  });
  linhas.push('');
  
  // Resumo
  linhas.push('=== RESUMO GERAL ===');
  linhas.push('Item,Valor');
  linhas.push(`Metas Criadas,${dados.resumo.metasCriadas}`);
  linhas.push(`Metas Concluídas,${dados.resumo.metasConcluidas}`);
  linhas.push(`Total de Categorias,${dados.resumo.totalCategorias}`);
  linhas.push(`Valor Médio por Transação,R$ ${dados.resumo.valorMedio.toLocaleString('pt-BR')}`);
  
  return linhas.join('\n');
}
