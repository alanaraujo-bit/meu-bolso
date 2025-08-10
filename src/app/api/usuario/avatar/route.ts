import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { avatarUrl } = await request.json();

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL do avatar é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar o usuário atual
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o usuario com o novo avatar
    const usuarioAtualizado = await prisma.usuario.update({
      where: { email: session.user.email },
      data: { avatarUrl }
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar salvo com sucesso',
      avatarUrl: usuarioAtualizado.avatarUrl
    });

  } catch (error) {
    console.error('❌ Erro ao salvar avatar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar avatar' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
