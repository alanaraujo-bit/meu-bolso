import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testando conexão com banco...');
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        criadoEm: true
      },
      take: 5
    });

    console.log(`✅ Conexão bem-sucedida! Encontrados ${usuarios.length} usuários.`);

    // Se não há usuários, vamos criar um usuário de teste
    if (usuarios.length === 0) {
      console.log('📝 Criando usuário de teste...');
      
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome: 'Usuário Teste',
          email: 'teste@exemplo.com',
          senha: '$2a$10$example.hash.for.testing.purposes.only'
        }
      });

      console.log('✅ Usuário de teste criado:', novoUsuario.email);
      
      return NextResponse.json({
        success: true,
        message: 'Conexão estabelecida e usuário de teste criado!',
        usuarios: [novoUsuario],
        databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão com banco estabelecida com sucesso!',
      usuarios: usuarios,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
    });

  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error);
    
    // Criando um objeto de erro tipado corretamente
    interface ErrorDetails {
      message: string;
      name: string;
      stack?: string;
      code?: string;
      clientVersion?: string;
      meta?: any;
    }
    
    let errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    // Se for erro do Prisma, vamos extrair mais informações
    if (error && typeof error === 'object' && 'code' in error) {
      errorDetails = {
        ...errorDetails,
        code: (error as any).code,
        clientVersion: (error as any).clientVersion,
        meta: (error as any).meta
      };
    }
    
    return NextResponse.json({
      success: false,
      error: errorDetails,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
    }, { status: 500 });
  }
}