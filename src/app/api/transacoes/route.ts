import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { valor, tipo, categoriaId, data, descricao, tags } = await req.json();

    // Validações básicas
    if (!valor || !tipo || !data) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se a categoria pertence ao usuário
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: categoriaId,
        userId: usuario.id
      }
    });

    if (!categoria) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    // Verificar se o tipo da transação é compatível com a categoria
    if (categoria.tipo !== "ambos" && categoria.tipo !== tipo) {
      return NextResponse.json({ 
        error: `Esta categoria só aceita transações do tipo: ${categoria.tipo}` 
      }, { status: 400 });
    }

    // Criar a transação
    const transacao = await prisma.transacao.create({
      data: {
        userId: usuario.id,
        categoriaId: categoriaId || null,
        tipo: tipo as 'receita' | 'despesa',
        valor: parseFloat(valor),
        data: new Date(data + 'T00:00:00'),
        descricao: descricao || null,
        tags: Array.isArray(tags) ? tags : [],
        anexos: [],
        isRecorrente: false,
      },
      include: {
        categoria: true
      }
    });

    return NextResponse.json({
      ...transacao,
      valor: transacao.valor.toNumber()
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Iniciando busca de transações...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log('👤 Usuário autenticado:', session.user.email);

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', usuario.id);

    // Buscar categorias do usuário para verificar se existem
    const categorias = await prisma.categoria.findMany({
      where: { userId: usuario.id }
    });

    console.log('📂 Categorias encontradas:', categorias.length);

    // Parâmetros de filtro
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const categoriaId = searchParams.get("categoriaId");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const busca = searchParams.get("busca");
    const valorMin = searchParams.get("valorMin");
    const valorMax = searchParams.get("valorMax");

    // Parâmetros de paginação
    const pagina = parseInt(searchParams.get("pagina") || "1");
    const limite = parseInt(searchParams.get("limite") || "10");
    const skip = (pagina - 1) * limite;

    // Parâmetros de ordenação
    const ordenarPor = searchParams.get("ordenarPor") || "data";
    const direcao = searchParams.get("direcao") || "desc";

    console.log('🔧 Parâmetros:', { tipo, categoriaId, dataInicio, dataFim, busca, valorMin, valorMax, pagina, limite, ordenarPor, direcao });

    // Construir filtros
    const where: any = {
      userId: usuario.id
    };

    if (tipo && (tipo === "receita" || tipo === "despesa")) {
      where.tipo = tipo;
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (dataInicio) {
      where.data = {
        ...where.data,
        gte: new Date(dataInicio)
      };
    }

    if (dataFim) {
      where.data = {
        ...where.data,
        lte: new Date(dataFim)
      };
    }

    if (busca) {
      // Removido mode: 'insensitive' para compatibilidade com MySQL
      where.descricao = {
        contains: busca
      };
    }

    if (valorMin) {
      where.valor = {
        ...where.valor,
        gte: parseFloat(valorMin)
      };
    }

    if (valorMax) {
      where.valor = {
        ...where.valor,
        lte: parseFloat(valorMax)
      };
    }

    console.log('🔍 Filtros construídos:', JSON.stringify(where, null, 2));

    // Construir ordenação
    const orderBy: any = {};
    if (ordenarPor === "categoria") {
      orderBy.categoria = { nome: direcao };
    } else {
      orderBy[ordenarPor] = direcao;
    }

    console.log('📊 Ordenação:', orderBy);

    // Contar total de transações (para paginação)
    console.log('🔢 Contando transações...');
    const totalTransacoes = await prisma.transacao.count({ where });
    const totalPaginas = Math.ceil(totalTransacoes / limite);

    console.log('📊 Total de transações:', totalTransacoes);

    // Buscar transações com paginação
    console.log('📋 Buscando transações...');
    const transacoes = await prisma.transacao.findMany({
      where,
      include: {
        categoria: true
      },
      orderBy,
      skip,
      take: limite
    });

    console.log('✅ Transações encontradas:', transacoes.length);

    // Calcular totais (baseado em todas as transações, não apenas a página atual)
    console.log('💰 Calculando totais...');
    const todasTransacoes = await prisma.transacao.findMany({
      where,
      select: {
        tipo: true,
        valor: true
      }
    });

    const totalReceitas = todasTransacoes
      .filter(t => t.tipo === "receita")
      .reduce((sum, t) => sum + t.valor.toNumber(), 0);

    const totalDespesas = todasTransacoes
      .filter(t => t.tipo === "despesa")
      .reduce((sum, t) => sum + t.valor.toNumber(), 0);

    const saldo = totalReceitas - totalDespesas;

    console.log('💰 Resumo financeiro:', { totalReceitas, totalDespesas, saldo });

    const resultado = {
      transacoes: transacoes.map(t => ({
        ...t,
        valor: t.valor.toNumber()
      })),
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo,
        totalTransacoes: todasTransacoes.length
      },
      categorias,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        total: totalTransacoes,
        limite
      },
      // Para compatibilidade com o frontend
      totalPaginas,
      total: totalTransacoes
    };

    console.log('✅ Retornando resultado com', resultado.transacoes.length, 'transações');

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('❌ Erro ao buscar transações:', error);
    return NextResponse.json({ 
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}