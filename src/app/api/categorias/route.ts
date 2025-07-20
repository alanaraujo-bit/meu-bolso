import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { nome, tipo, cor, icone } = await req.json();

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Nome e tipo são obrigatórios" }, { status: 400 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se já existe uma categoria com o mesmo nome para este usuário
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nome,
        userId: usuario.id
      }
    });

    if (categoriaExistente) {
      return NextResponse.json({ error: "Já existe uma categoria com este nome" }, { status: 400 });
    }

    // Criar a categoria
    const categoria = await prisma.categoria.create({
      data: {
        nome,
        tipo,
        cor: cor || "#6B7280",
        icone: icone || "📊",
        userId: usuario.id,
      },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se o usuário já tem categorias
    const categoriasExistentes = await prisma.categoria.findMany({
      where: { userId: usuario.id }
    });

    // Se não tem categorias, criar as padrão
    if (categoriasExistentes.length === 0) {
      // Criar categorias padrão
      await prisma.categoria.create({
        data: { nome: "Salário", tipo: "receita", cor: "#10B981", icone: "💰", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Freelance", tipo: "receita", cor: "#3B82F6", icone: "💻", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Investimentos", tipo: "receita", cor: "#8B5CF6", icone: "📈", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Vendas", tipo: "receita", cor: "#06B6D4", icone: "🛒", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Outros Ganhos", tipo: "receita", cor: "#84CC16", icone: "💸", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Alimentação", tipo: "despesa", cor: "#EF4444", icone: "🍽️", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Transporte", tipo: "despesa", cor: "#F97316", icone: "🚗", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Moradia", tipo: "despesa", cor: "#8B5CF6", icone: "🏠", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Saúde", tipo: "despesa", cor: "#DC2626", icone: "🏥", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Educação", tipo: "despesa", cor: "#2563EB", icone: "📚", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Lazer", tipo: "despesa", cor: "#EA580C", icone: "🎮", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Compras", tipo: "despesa", cor: "#EC4899", icone: "🛍️", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Serviços", tipo: "despesa", cor: "#6B7280", icone: "🔧", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Outros Gastos", tipo: "despesa", cor: "#9CA3AF", icone: "💳", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Transferências", tipo: "ambos", cor: "#4F46E5", icone: "🔄", userId: usuario.id }
      });
      await prisma.categoria.create({
        data: { nome: "Emergência", tipo: "ambos", cor: "#B91C1C", icone: "🚨", userId: usuario.id }
      });
    }

    // Buscar todas as categorias do usuário
    const categorias = await prisma.categoria.findMany({
      where: { userId: usuario.id },
      include: {
        _count: {
          select: {
            transacoes: true
          }
        }
      },
      orderBy: { criadoEm: "desc" }
    });

    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}