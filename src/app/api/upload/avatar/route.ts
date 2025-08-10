import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 === INÍCIO DEBUG UPLOAD AVATAR ===');
    
    // Adicionar headers CORS para produção
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    console.log('📋 Passo 1: Verificando autenticação...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401, headers });
    }
    
    console.log('✅ Usuário autenticado:', session.user.email);

    console.log('📋 Passo 2: Lendo dados do formulário...');
    
    // Verificar se o request tem dados
    const contentType = request.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    if (!contentType?.includes('multipart/form-data')) {
      console.log('❌ Content-Type inválido:', contentType);
      return NextResponse.json({ 
        error: 'Content-Type deve ser multipart/form-data' 
      }, { status: 400, headers });
    }

    let data;
    try {
      data = await request.formData();
    } catch (formError) {
      console.log('❌ Erro ao ler FormData:', formError);
      return NextResponse.json({ 
        error: 'Erro ao processar dados do formulário',
        details: formError instanceof Error ? formError.message : 'Erro desconhecido'
      }, { status: 400, headers });
    }
    
    const file = data.get('file') as File;

    if (!file) {
      console.log('❌ Nenhum arquivo fornecido');
      console.log('📋 Campos disponíveis:', Array.from(data.keys()));
      return NextResponse.json({ 
        error: 'Nenhum arquivo fornecido',
        availableFields: Array.from(data.keys())
      }, { status: 400, headers });
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
        error: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP',
        receivedType: file.type,
        allowedTypes
      }, { status: 400, headers });
    }

    // Validar tamanho (2MB max para produção)
    const maxSize = 2 * 1024 * 1024; // 2MB (reduzido para produção)
    if (file.size > maxSize) {
      console.log('❌ Arquivo muito grande:', file.size);
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 2MB',
        fileSize: file.size,
        maxSize
      }, { status: 400, headers });
    }

    console.log('📋 Passo 3: Convertendo para base64...');
    
    let bytes, base64, dataUrl;
    try {
      bytes = await file.arrayBuffer();
      base64 = Buffer.from(bytes).toString('base64');
      dataUrl = `data:${file.type};base64,${base64}`;
    } catch (conversionError) {
      console.log('❌ Erro na conversão:', conversionError);
      return NextResponse.json({ 
        error: 'Erro ao processar arquivo',
        details: conversionError instanceof Error ? conversionError.message : 'Erro na conversão'
      }, { status: 500, headers });
    }

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
    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('💥 === ERRO NO UPLOAD ===');
    console.error('❌ Erro no upload:', error);
    console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'Erro desconhecido');
    console.error('📋 Tipo do erro:', typeof error);
    
    // Headers para erro também
    const errorHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: errorHeaders }
    );
  }
}

// Adicionar handler para OPTIONS (preflight CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
