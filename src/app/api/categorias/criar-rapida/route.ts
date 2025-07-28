import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Criar categoria rapidamente (inline)
export async function POST(req: NextRequest) {
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

    const { nome, tipo, cor, icone } = await req.json();

    // Validar campos obrigatórios
    if (!nome || !tipo) {
      return NextResponse.json(
        { error: "Nome e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!['receita', 'despesa', 'ambos'].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo deve ser 'receita', 'despesa' ou 'ambos'" },
        { status: 400 }
      );
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        userId: usuario.id,
        nome: nome.trim(),
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 409 }
      );
    }

    // Cores padrão baseadas no tipo
    const coresPadrao = {
      receita: ['#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0'],
      despesa: ['#EF4444', '#DC2626', '#F87171', '#FCA5A5', '#FEE2E2'],
      ambos: ['#6366F1', '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE']
    };

    // Ícones padrão baseados no tipo
    const iconesPadrao = {
      receita: ['💰', '💵', '📈', '💸', '🏦'],
      despesa: ['🛒', '🍕', '⛽', '🏠', '📱'],
      ambos: ['📊', '💼', '🎯', '📋', '⭐']
    };

    // Selecionar cor e ícone aleatórios se não fornecidos
    const corSelecionada = cor || coresPadrao[tipo as keyof typeof coresPadrao][
      Math.floor(Math.random() * coresPadrao[tipo as keyof typeof coresPadrao].length)
    ];

    const iconeSelecionado = icone || iconesPadrao[tipo as keyof typeof iconesPadrao][
      Math.floor(Math.random() * iconesPadrao[tipo as keyof typeof iconesPadrao].length)
    ];

    // Criar a categoria
    const novaCategoria = await prisma.categoria.create({
      data: {
        userId: usuario.id,
        nome: nome.trim(),
        tipo: tipo as 'receita' | 'despesa' | 'ambos',
        cor: corSelecionada,
        icone: iconeSelecionado,
      },
    });

    console.log(`✅ Categoria criada rapidamente: ${novaCategoria.nome} (${novaCategoria.tipo})`);

    return NextResponse.json({
      sucesso: true,
      categoria: {
        id: novaCategoria.id,
        nome: novaCategoria.nome,
        tipo: novaCategoria.tipo,
        cor: novaCategoria.cor,
        icone: novaCategoria.icone,
        criadoEm: novaCategoria.criadoEm.toISOString()
      },
      mensagem: "Categoria criada com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao criar categoria rapidamente:", error);
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}
