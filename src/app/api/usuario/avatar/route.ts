import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 === SALVANDO AVATAR NO BANCO ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);

    const { avatarUrl } = await request.json();
    
    if (!avatarUrl) {
      console.log('❌ URL do avatar não fornecida');
      return NextResponse.json({ error: 'URL do avatar é obrigatória' }, { status: 400 });
    }
    
    console.log('📋 Salvando avatar para usuário:', session.user.email);
    console.log('📋 URL do avatar:', avatarUrl.substring(0, 50) + '...');

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, nome: true }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Atualizar avatar
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        avatarUrl,
        atualizadoEm: new Date()
      },
      select: {
        id: true,
        nome: true,
        email: true,
        avatarUrl: true,
        atualizadoEm: true
      }
    });

    console.log('✅ Avatar salvo com sucesso no banco');

    return NextResponse.json({
      success: true,
      message: 'Avatar salvo com sucesso',
      usuario: usuarioAtualizado
    });
    
  } catch (error) {
    console.error('💥 Erro ao salvar avatar:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
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

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        nome: true,
        email: true,
        avatarUrl: true
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      avatarUrl: usuario.avatarUrl
    });
    
  } catch (error) {
    console.error('Erro ao buscar avatar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}