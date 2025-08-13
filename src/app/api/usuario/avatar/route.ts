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
    
    // Validar tamanho se for base64
    if (avatarUrl.startsWith('data:')) {
      const base64Data = avatarUrl.split(',')[1];
      if (base64Data) {
        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSize = 200 * 1024; // 200KB em base64 (muito mais conservador)
        
        if (sizeInBytes > maxSize) {
          console.log('❌ Avatar base64 muito grande:', sizeInBytes);
          return NextResponse.json({ 
            error: 'Imagem muito grande para o banco de dados',
            currentSize: Math.round(sizeInBytes / 1024) + 'KB',
            maxSize: Math.round(maxSize / 1024) + 'KB',
            suggestion: 'A imagem foi comprimida mas ainda está muito grande. Use uma imagem menor.'
          }, { status: 400 });
        }
      }
      console.log('✅ Base64 aceito - tamanho:', Math.round((base64Data?.length || 0) * 3 / 4 / 1024) + 'KB');
    }
    // Validar que é uma URL válida se não for base64
    else if (!avatarUrl.startsWith('/uploads/') && !avatarUrl.startsWith('http')) {
      console.log('❌ URL inválida:', avatarUrl);
      return NextResponse.json({ 
        error: 'URL inválida. Deve começar com /uploads/, http ou ser base64',
        receivedUrl: avatarUrl.substring(0, 100)
      }, { status: 400 });
    }
    
    console.log('📋 Salvando avatar para usuário:', session.user.email);
    console.log('📋 Tipo do avatar:', avatarUrl.startsWith('data:') ? 'base64' : 'URL');

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

export async function DELETE() {
  try {
    console.log('🗑️ === REMOVENDO AVATAR ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, nome: true, avatarUrl: true }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Remover avatar (definir como null)
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        avatarUrl: null,
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

    console.log('✅ Avatar removido com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Avatar removido com sucesso',
      usuario: usuarioAtualizado
    });
    
  } catch (error) {
    console.error('💥 Erro ao remover avatar:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}