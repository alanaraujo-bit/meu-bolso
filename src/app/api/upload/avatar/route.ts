import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Validar tamanho inicial (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ Arquivo muito grande:', file.size);
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 5MB',
        fileSize: file.size,
        maxSize
      }, { status: 400, headers });
    }

    console.log('📋 Passo 3: Processando e comprimindo imagem...');
    
    // Processar arquivo com compressão
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let processedBuffer: Buffer;
    let outputFormat = 'jpeg';
    
    try {
      // Tentar usar Sharp se disponível (não funciona na Vercel por limitações)
      const sharp = require('sharp');
      
      console.log('📋 Usando Sharp para compressão...');
      processedBuffer = await sharp(buffer)
        .resize(200, 200, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 70,
          progressive: true 
        })
        .toBuffer();
        
      outputFormat = 'jpeg';
      console.log('✅ Imagem processada com Sharp:', {
        tamanhoOriginal: buffer.length,
        tamanhoComprimido: processedBuffer.length,
        reducao: Math.round((1 - processedBuffer.length / buffer.length) * 100) + '%'
      });
      
    } catch (sharpError) {
      console.log('⚠️ Sharp não disponível, usando Canvas API...');
      
      // Fallback: usar canvas (funciona na Vercel)
      try {
        const canvas = require('canvas');
        const img = await canvas.loadImage(buffer);
        
        // Criar canvas redimensionado
        const targetSize = 200;
        const canvasElement = canvas.createCanvas(targetSize, targetSize);
        const ctx = canvasElement.getContext('2d');
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        
        // Converter para buffer JPEG
        processedBuffer = canvasElement.toBuffer('image/jpeg', { quality: 0.7 });
        outputFormat = 'jpeg';
        
        console.log('✅ Imagem processada com Canvas:', {
          tamanhoOriginal: buffer.length,
          tamanhoComprimido: processedBuffer.length,
          reducao: Math.round((1 - processedBuffer.length / buffer.length) * 100) + '%'
        });
        
      } catch (canvasError) {
        console.log('⚠️ Canvas não disponível, usando compressão básica...');
        
        // Fallback final: apenas reduzir qualidade do JPEG
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          // Para JPEG, usar o buffer original mas limitado
          if (buffer.length > 50000) { // Se maior que 50KB
            console.log('❌ Imagem muito grande e não foi possível comprimir');
            return NextResponse.json({ 
              error: 'Imagem muito grande. Use uma imagem menor (máximo 200KB) ou em formato JPEG',
              originalSize: Math.round(buffer.length / 1024) + 'KB',
              suggestion: 'Comprima a imagem antes de fazer upload'
            }, { status: 400, headers });
          }
        }
        
        processedBuffer = buffer;
        outputFormat = file.type.split('/')[1] || 'jpeg';
      }
    }
    
    // Verificar tamanho final
    if (processedBuffer.length > 100000) { // 100KB
      console.log('❌ Imagem ainda muito grande após compressão:', processedBuffer.length);
      return NextResponse.json({ 
        error: 'Imagem muito grande mesmo após compressão',
        finalSize: Math.round(processedBuffer.length / 1024) + 'KB',
        maxSize: '100KB',
        suggestion: 'Use uma imagem menor ou de menor resolução'
      }, { status: 400, headers });
    }

    // Converter para base64 para o banco de dados
    const base64 = processedBuffer.toString('base64');
    const dataUrl = `data:image/${outputFormat};base64,${base64}`;

    console.log('✅ Upload processado com sucesso:', {
      usuario: session.user.email,
      tamanhoFinal: processedBuffer.length,
      formato: outputFormat,
      base64Length: dataUrl.length
    });

    const response = {
      success: true,
      url: dataUrl,
      fileName: file.name,
      size: processedBuffer.length,
      type: `image/${outputFormat}`,
      originalSize: file.size,
      compressed: true,
      message: 'Foto processada e comprimida com sucesso!'
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
