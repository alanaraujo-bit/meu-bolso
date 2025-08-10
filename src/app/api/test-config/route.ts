import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    console.log('🧪 API de teste - recebendo configurações');
    
    const body = await request.json();
    console.log('📦 Body recebido:', JSON.stringify(body, null, 2));
    
    return NextResponse.json({
      message: 'Teste realizado com sucesso',
      received: body,
      success: true
    });

  } catch (error) {
    console.error('❌ Erro na API de teste:', error);
    return NextResponse.json(
      { 
        error: 'Erro na API de teste',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API de teste funcionando' });
}
