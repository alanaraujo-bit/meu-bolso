import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const dados = await request.json();

    // Validar dados obrigatórios
    const camposObrigatorios = [
      'fonteRenda',
      'temDividas', 
      'controlGastos',
      'guardaDinheiro',
      'objetivoPrincipal',
      'prazoObjetivo',
      'experienciaFinanceira'
    ];

    for (const campo of camposObrigatorios) {
      if (!dados[campo]) {
        return NextResponse.json(
          { error: `Campo obrigatório não preenchido: ${campo}` }, 
          { status: 400 }
        );
      }
    }

    // Por enquanto, vamos simular o salvamento usando localStorage do lado do cliente
    // Quando a migração do banco funcionar, descomentaremos o código do prisma

    /*
    // Salvar ou atualizar perfil financeiro no banco de dados
    const perfilFinanceiro = await prisma.perfilFinanceiro.upsert({
      where: { userEmail: session.user.email },
      update: {
        fonteRenda: dados.fonteRenda,
        rendaMensal: dados.rendaMensal || null,
        temDividas: dados.temDividas,
        controlGastos: dados.controlGastos,
        guardaDinheiro: dados.guardaDinheiro,
        objetivoPrincipal: dados.objetivoPrincipal,
        prazoObjetivo: dados.prazoObjetivo,
        experienciaFinanceira: dados.experienciaFinanceira,
        categoriasPrioritarias: dados.categoriasPrioritarias || [],
        onboardingCompleto: true,
        updatedAt: new Date(),
      },
      create: {
        userEmail: session.user.email,
        fonteRenda: dados.fonteRenda,
        rendaMensal: dados.rendaMensal || null,
        temDividas: dados.temDividas,
        controlGastos: dados.controlGastos,
        guardaDinheiro: dados.guardaDinheiro,
        objetivoPrincipal: dados.objetivoPrincipal,
        prazoObjetivo: dados.prazoObjetivo,
        experienciaFinanceira: dados.experienciaFinanceira,
        categoriasPrioritarias: dados.categoriasPrioritarias || [],
        onboardingCompleto: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    */

    // Simulação temporária
    const perfilFinanceiro = {
      id: 'temp-id',
      userEmail: session.user.email,
      ...dados,
      categoriasPrioritarias: dados.categoriasPrioritarias || [],
      onboardingCompleto: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Log da ação para auditoria
    console.log(`Onboarding concluído para usuário: ${session.user.email}`, {
      fonteRenda: dados.fonteRenda,
      temDividas: dados.temDividas,
      objetivoPrincipal: dados.objetivoPrincipal,
      experienciaFinanceira: dados.experienciaFinanceira
    });

    return NextResponse.json({ 
      success: true, 
      perfil: perfilFinanceiro,
      message: 'Onboarding concluído com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao salvar onboarding:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Por enquanto, retornar dados fictícios para testar
    // Buscar perfil financeiro do usuário
    /*
    const perfilFinanceiro = await prisma.perfilFinanceiro.findUnique({
      where: { userEmail: session.user.email },
    });
    */

    // Simulação temporária - verificar se existe no localStorage será feito no cliente
    const perfilFinanceiro = null; // Será substituído pela busca real no banco

    return NextResponse.json({ 
      perfil: perfilFinanceiro,
      onboardingCompleto: false // Será substituído pela busca real no banco
    });

  } catch (error) {
    console.error('Erro ao buscar dados do onboarding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
