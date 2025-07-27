import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nome } = await request.json();

    console.log('🔧 Criando usuário:', { email, nome });

    // Verificar se já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return NextResponse.json({
        success: false,
        error: 'Usuário já existe'
      }, { status: 400 });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaHash,
        nome: nome || 'Alan Araújo'
      }
    });

    console.log('✅ Usuário criado:', novoUsuario.email);

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      usuario: {
        id: novoUsuario.id,
        email: novoUsuario.email,
        nome: novoUsuario.nome
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
