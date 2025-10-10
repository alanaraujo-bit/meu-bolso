import { NextRequest, NextResponse } from "next/server";

// GET - Teste simples da API
export async function GET() {
  console.log('🧪 Teste de rota - API funcionando!');
  return NextResponse.json({ 
    message: "API de teste funcionando!",
    timestamp: new Date().toISOString()
  });
}

// PUT - Teste do endpoint de edição
export async function PUT(request: NextRequest) {
  console.log('🧪 Teste PUT - Recebendo requisição');
  
  try {
    const body = await request.json();
    console.log('🧪 Body recebido:', body);
    
    return NextResponse.json({
      message: "Teste PUT funcionando!",
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json(
      { error: "Erro no teste", details: error },
      { status: 500 }
    );
  }
}