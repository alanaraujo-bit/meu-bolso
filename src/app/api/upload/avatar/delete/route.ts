import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ Remoção de foto solicitada:', {
      usuario: session.user.email
    });

    // Como estamos usando base64/dataURL temporariamente, 
    // apenas confirmar a remoção
    return NextResponse.json({
      success: true,
      message: 'Foto removida com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao remover foto:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
