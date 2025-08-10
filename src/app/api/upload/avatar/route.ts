import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 === INÍCIO DEBUG UPLOAD AVATAR ===');
    
    console.log('📋 Passo 1: Verificando autenticação...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);

    console.log('📋 Passo 2: Lendo dados do formulário...');
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file) {
      console.log('❌ Nenhum arquivo fornecido');
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    console.log('✅ Arquivo recebido:', {
      nome: file.name,
      tipo: file.type,
      tamanho: file.size
    });

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Tipo de arquivo inválido:', file.type);
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP' 
      }, { status: 400 });
    }

    // Validar tamanho (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ Arquivo muito grande:', file.size);
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 5MB' 
      }, { status: 400 });
    }

    console.log('📋 Passo 3: Convertendo para base64...');
    // Converter para base64 e armazenar no localStorage (temporário)
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('✅ Upload processado com sucesso:', {
      usuario: session.user.email,
      tamanho: file.size,
      tipo: file.type,
      urlLength: dataUrl.length
    });

    // Por enquanto, retornar o data URL para uso direto
    const response = {
      success: true,
      url: dataUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
      message: 'Foto processada com sucesso!'
    };
    
    console.log('🎉 === UPLOAD COMPLETO ===');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 === ERRO NO UPLOAD ===');
    console.error('❌ Erro no upload:', error);
    console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'Erro desconhecido');
    console.error('📋 Tipo do erro:', typeof error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
