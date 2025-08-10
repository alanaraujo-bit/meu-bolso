import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: 'Nome do arquivo não fornecido' }, { status: 400 });
    }

    // Validar que o arquivo está no diretório correto
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json({ error: 'Nome de arquivo inválido' }, { status: 400 });
    }

    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', fileName);
      await unlink(filePath);
      
      console.log('✅ Arquivo removido:', {
        usuario: session.user.email,
        arquivo: fileName
      });

      return NextResponse.json({
        success: true,
        message: 'Arquivo removido com sucesso'
      });

    } catch (error) {
      // Arquivo pode não existir
      console.log('⚠️ Arquivo não encontrado:', fileName);
      return NextResponse.json({
        success: true,
        message: 'Arquivo não encontrado ou já removido'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao remover arquivo:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
