import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🔍 Criando usuário de teste...');
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: 'teste@teste.com' }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Usuário de teste já existe',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          nome: existingUser.nome,
          password: '123456' // Para referência
        }
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Criar usuário de teste
    const user = await prisma.usuario.create({
      data: {
        nome: 'Usuário Teste',
        email: 'teste@teste.com',
        senha: hashedPassword
      }
    });

    console.log('✅ Usuário de teste criado com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Usuário de teste criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        password: '123456' // Para referência
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}