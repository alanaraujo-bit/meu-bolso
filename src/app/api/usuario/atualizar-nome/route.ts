import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { nome } = await request.json();

    // Validar nome
    if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 });
    }

    if (nome.length > 100) {
      return NextResponse.json({ error: 'Nome deve ter no máximo 100 caracteres' }, { status: 400 });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Atualizar nome do usuário
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        nome: nome.trim(),
        atualizadoEm: new Date()
      }
    });

    console.log('✅ Nome atualizado:', session.user.email, nome.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Nome atualizado com sucesso',
      nome: nome.trim()
    });
  } catch (error) {
    console.error('Erro ao atualizar nome:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
