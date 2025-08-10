import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Recebendo request para salvar avatar...');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    console.log('✅ Usuário autenticado:', session.user.email);

    const { avatarUrl } = await request.json();
    console.log('📋 Dados recebidos:', { avatarUrl });

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      console.log('❌ URL do avatar inválida:', avatarUrl);
      return NextResponse.json(
        { error: 'URL do avatar é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar o usuário atual
    console.log('🔍 Buscando usuário no banco...');
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Usuário encontrado:', usuario.id);

    // Atualizar o usuario com o novo avatar
    console.log('💾 Atualizando avatar no banco...');
    const usuarioAtualizado = await prisma.usuario.update({
      where: { email: session.user.email },
      data: { avatarUrl }
    });

    console.log('✅ Avatar atualizado com sucesso:', usuarioAtualizado.avatarUrl);

    return NextResponse.json({
      success: true,
      message: 'Avatar salvo com sucesso',
      avatarUrl: usuarioAtualizado.avatarUrl
    });

  } catch (error) {
    console.error('❌ Erro ao salvar avatar:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Erro desconhecido');
    return NextResponse.json(
      { error: 'Erro interno do servidor ao salvar avatar' },
      { status: 500 }
    );
  }
}
