import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('� === INÍCIO DEBUG API AVATAR ===');
    
    // Passo 1: Verificar se consegue pegar a sessão
    let session;
    try {
      console.log('📋 Passo 1: Obtendo sessão...');
      session = await getServerSession(authOptions);
      console.log('✅ Sessão obtida:', session ? 'SIM' : 'NÃO');
      console.log('📧 Email da sessão:', session?.user?.email);
    } catch (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return NextResponse.json(
        { error: 'Erro ao verificar autenticação' },
        { status: 500 }
      );
    }
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Passo 2: Verificar se consegue ler os dados do request
    let requestData;
    try {
      console.log('📋 Passo 2: Lendo dados do request...');
      requestData = await request.json();
      console.log('✅ Dados recebidos:', requestData);
    } catch (requestError) {
      console.error('❌ Erro ao ler request:', requestError);
      return NextResponse.json(
        { error: 'Erro ao ler dados da requisição' },
        { status: 400 }
      );
    }

    const { avatarUrl } = requestData;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      console.log('❌ URL do avatar inválida:', avatarUrl);
      return NextResponse.json(
        { error: 'URL do avatar é obrigatória' },
        { status: 400 }
      );
    }

    // Passo 3: Verificar conexão com banco
    try {
      console.log('📋 Passo 3: Testando conexão com banco...');
      await prisma.$connect();
      console.log('✅ Conexão com banco OK');
    } catch (dbError) {
      console.error('❌ Erro de conexão com banco:', dbError);
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 500 }
      );
    }

    // Passo 4: Buscar usuário
    let usuario;
    try {
      console.log('� Passo 4: Buscando usuário...');
      usuario = await prisma.usuario.findUnique({
        where: { email: session.user.email }
      });
      console.log('✅ Usuário encontrado:', usuario ? 'SIM' : 'NÃO');
      console.log('🆔 ID do usuário:', usuario?.id);
    } catch (findError) {
      console.error('❌ Erro ao buscar usuário:', findError);
      return NextResponse.json(
        { error: 'Erro ao buscar usuário no banco' },
        { status: 500 }
      );
    }

    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Passo 5: Atualizar avatar
    let usuarioAtualizado;
    try {
      console.log('� Passo 5: Atualizando avatar...');
      usuarioAtualizado = await prisma.usuario.update({
        where: { email: session.user.email },
        data: { avatarUrl }
      });
      console.log('✅ Avatar atualizado com sucesso');
      console.log('🖼️ Nova URL do avatar:', usuarioAtualizado.avatarUrl);
    } catch (updateError) {
      console.error('❌ Erro ao atualizar avatar:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar avatar no banco' },
        { status: 500 }
      );
    }

    console.log('🎉 === SUCESSO COMPLETO ===');

    return NextResponse.json({
      success: true,
      message: 'Avatar salvo com sucesso',
      avatarUrl: usuarioAtualizado.avatarUrl
    });

  } catch (error) {
    console.error('💥 === ERRO GERAL ===');
    console.error('❌ Erro ao salvar avatar:', error);
    console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'Erro desconhecido');
    console.error('📋 Tipo do erro:', typeof error);
    console.error('🏷️ Nome do erro:', error instanceof Error ? error.name : 'Desconhecido');
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao salvar avatar',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
