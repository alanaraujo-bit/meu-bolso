import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, avatarUrl: true }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se o usuário tem uma foto, tentar removê-la do servidor
    if (usuario.avatarUrl) {
      try {
        // Extrair nome do arquivo da URL
        const fileName = usuario.avatarUrl.split('/').pop();
        if (fileName) {
          const filePath = join(process.cwd(), 'public', 'uploads', 'avatars', fileName);
          
          // Verificar se o arquivo existe e removê-lo
          if (existsSync(filePath)) {
            await unlink(filePath);
            console.log('🗑️ Arquivo de foto removido:', filePath);
          }
        }
      } catch (error) {
        console.error('Erro ao remover arquivo de foto:', error);
        // Continuar mesmo se não conseguir remover o arquivo
      }
    }

    // Atualizar usuário no banco (remover avatarUrl)
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { 
        avatarUrl: null,
        atualizadoEm: new Date()
      }
    });

    console.log('✅ Foto de perfil removida:', session.user.email);

    return NextResponse.json({ 
      success: true, 
      message: 'Foto removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
