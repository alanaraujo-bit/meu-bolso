import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Iniciando processo de cadastro...');
    
    const { nome, email, senha } = await req.json();
    console.log('📋 Dados recebidos:', { nome, email, senhaLength: senha?.length });

    // Validações
    if (!nome || !email || !senha) {
      console.log('❌ Validação falhou: campos obrigatórios');
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (senha.length < 6) {
      console.log('❌ Validação falhou: senha muito curta');
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Verificar se o usuário já existe
    console.log('🔍 Verificando se usuário já existe...');
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      console.log('❌ Usuário já existe:', email);
      return NextResponse.json({ error: 'Usuário já existe com este email' }, { status: 400 });
    }

    // Criptografar a senha
    console.log('🔐 Criptografando senha...');
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar o usuário
    console.log('👤 Criando usuário no banco...');
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash
      }
    });

    console.log('✅ Usuário criado com sucesso:', usuario.email);

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro detalhado ao criar usuário:', error);
    
    // Tratamento específico para erros do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      switch (prismaError.code) {
        case 'P2002':
          console.log('❌ Erro P2002: Violação de constraint única');
          return NextResponse.json({ 
            error: 'Este email já está em uso' 
          }, { status: 400 });
          
        case 'P2025':
          console.log('❌ Erro P2025: Registro não encontrado');
          return NextResponse.json({ 
            error: 'Erro de dados não encontrados' 
          }, { status: 400 });
          
        case 'P1001':
          console.log('❌ Erro P1001: Não foi possível conectar ao banco');
          return NextResponse.json({ 
            error: 'Erro de conexão com o banco de dados' 
          }, { status: 500 });
          
        default:
          console.log('❌ Erro Prisma desconhecido:', prismaError.code);
          return NextResponse.json({ 
            error: `Erro do banco de dados: ${prismaError.message}` 
          }, { status: 500 });
      }
    }
    
    // Erro genérico
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.log('❌ Erro genérico:', errorMessage);
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}