import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Função para calcular próxima data baseada na frequência
function calcularProximaData(ultimaData: Date, frequencia: string): Date {
  const novaData = new Date(ultimaData);
  
  switch (frequencia) {
    case 'diaria':
      novaData.setDate(novaData.getDate() + 1);
      break;
    case 'semanal':
      novaData.setDate(novaData.getDate() + 7);
      break;
    case 'quinzenal':
      novaData.setDate(novaData.getDate() + 15);
      break;
    case 'mensal':
      novaData.setMonth(novaData.getMonth() + 1);
      break;
    case 'trimestral':
      novaData.setMonth(novaData.getMonth() + 3);
      break;
    case 'semestral':
      novaData.setMonth(novaData.getMonth() + 6);
      break;
    case 'anual':
      novaData.setFullYear(novaData.getFullYear() + 1);
      break;
    default:
      break;
  }
  
  return novaData;
}

// GET - Buscar totais de transações recorrentes por mês
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const mesesParam = searchParams.get('meses') || '12'; // Padrão 12 meses
    const meses = parseInt(mesesParam);

    // Buscar transações recorrentes ativas
    const recorrentes = await prisma.transacaoRecorrente.findMany({
      where: {
        userId: usuario.id,
        isActive: true
      },
      include: {
        categoria: true
      }
    });

    // Gerar dados para os próximos X meses
    const hoje = new Date();
    const dadosMensais = [];
    
    for (let i = 0; i < meses; i++) {
      const anoMes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const inicioMes = new Date(anoMes.getFullYear(), anoMes.getMonth(), 1);
      const fimMes = new Date(anoMes.getFullYear(), anoMes.getMonth() + 1, 0, 23, 59, 59);
      
      let totalReceitas = 0;
      let totalDespesas = 0;
      let contadorReceitas = 0;
      let contadorDespesas = 0;
      
      const detalhesCategoria = new Map();

      // Para cada transação recorrente ativa
      for (const recorrente of recorrentes) {
        // Verificar se a recorrente está ativa neste período
        if (recorrente.dataInicio > fimMes) continue;
        if (recorrente.dataFim && recorrente.dataFim < inicioMes) continue;

        let dataProjecao = new Date(recorrente.dataInicio);
        
        // Avançar até o mês atual se necessário
        while (dataProjecao < inicioMes) {
          dataProjecao = calcularProximaData(dataProjecao, recorrente.frequencia);
        }
        
        // Contar ocorrências no mês
        while (dataProjecao <= fimMes) {
          // Verificar se está dentro do período de validade
          if (recorrente.dataFim && dataProjecao > recorrente.dataFim) {
            break;
          }

          // Adicionar aos totais
          const valor = Number(recorrente.valor);
          if (recorrente.tipo === 'receita') {
            totalReceitas += valor;
            contadorReceitas++;
          } else {
            totalDespesas += valor;
            contadorDespesas++;
          }

          // Adicionar aos detalhes por categoria
          const categoriaNome = recorrente.categoria?.nome || 'Sem categoria';
          if (!detalhesCategoria.has(categoriaNome)) {
            detalhesCategoria.set(categoriaNome, {
              nome: categoriaNome,
              cor: recorrente.categoria?.cor || '#6366F1',
              icone: recorrente.categoria?.icone || '📊',
              receitas: 0,
              despesas: 0,
              contadorReceitas: 0,
              contadorDespesas: 0
            });
          }

          const detalhe = detalhesCategoria.get(categoriaNome);
          if (recorrente.tipo === 'receita') {
            detalhe.receitas += valor;
            detalhe.contadorReceitas++;
          } else {
            detalhe.despesas += valor;
            detalhe.contadorDespesas++;
          }

          dataProjecao = calcularProximaData(dataProjecao, recorrente.frequencia);
        }
      }

      dadosMensais.push({
        mes: anoMes.getMonth() + 1,
        ano: anoMes.getFullYear(),
        mesNome: anoMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        mesAbbr: anoMes.toLocaleDateString('pt-BR', { month: 'short' }),
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        contadorReceitas,
        contadorDespesas,
        totalTransacoes: contadorReceitas + contadorDespesas,
        categorias: Array.from(detalhesCategoria.values()).sort((a, b) => 
          (b.receitas + b.despesas) - (a.receitas + a.despesas)
        )
      });
    }

    // Calcular estatísticas gerais
    const estatisticas = {
      mediaReceitasMensal: dadosMensais.reduce((sum, mes) => sum + mes.totalReceitas, 0) / dadosMensais.length,
      mediaDespesasMensal: dadosMensais.reduce((sum, mes) => sum + mes.totalDespesas, 0) / dadosMensais.length,
      mediaSaldoMensal: dadosMensais.reduce((sum, mes) => sum + mes.saldo, 0) / dadosMensais.length,
      mediaTransacoesMensal: dadosMensais.reduce((sum, mes) => sum + mes.totalTransacoes, 0) / dadosMensais.length,
      
      totalReceitasAno: dadosMensais.reduce((sum, mes) => sum + mes.totalReceitas, 0),
      totalDespesasAno: dadosMensais.reduce((sum, mes) => sum + mes.totalDespesas, 0),
      totalTransacoesAno: dadosMensais.reduce((sum, mes) => sum + mes.totalTransacoes, 0),
      
      melhorMes: dadosMensais.reduce((melhor, mes) => mes.saldo > melhor.saldo ? mes : melhor, dadosMensais[0]),
      piorMes: dadosMensais.reduce((pior, mes) => mes.saldo < pior.saldo ? mes : pior, dadosMensais[0]),
      
      recorrentesAtivas: recorrentes.length,
      recorrentesReceitas: recorrentes.filter(r => r.tipo === 'receita').length,
      recorrentesDespesas: recorrentes.filter(r => r.tipo === 'despesa').length
    };

    // Análise por frequência
    const analiseFrequencia = recorrentes.reduce((acc, r) => {
      if (!acc[r.frequencia]) {
        acc[r.frequencia] = { count: 0, receitas: 0, despesas: 0 };
      }
      acc[r.frequencia].count++;
      if (r.tipo === 'receita') {
        acc[r.frequencia].receitas += Number(r.valor);
      } else {
        acc[r.frequencia].despesas += Number(r.valor);
      }
      return acc;
    }, {} as Record<string, { count: number; receitas: number; despesas: number }>);

    console.log(`📊 Calculados totais recorrentes para ${meses} meses - ${recorrentes.length} recorrentes ativas`);

    return NextResponse.json({
      success: true,
      periodo: {
        meses,
        dataInicio: dadosMensais[0]?.mesNome,
        dataFim: dadosMensais[dadosMensais.length - 1]?.mesNome
      },
      dadosMensais,
      estatisticas,
      analiseFrequencia,
      recorrentesAtivas: recorrentes.map(r => ({
        id: r.id,
        descricao: r.descricao,
        tipo: r.tipo,
        valor: Number(r.valor),
        frequencia: r.frequencia,
        categoria: r.categoria?.nome || 'Sem categoria',
        proximaExecucao: r.dataInicio // Simplificado, pode ser melhorado
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar totais recorrentes:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}
