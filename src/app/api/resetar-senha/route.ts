import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, novaSenha } = await request.json();

    console.log('🔧 Resetando senha para:', email);

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado'
      }, { status: 404 });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar a senha
    await prisma.usuario.update({
      where: { email },
      data: {
        senha: senhaHash
      }
    });

    console.log('✅ Senha atualizada para:', email);

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso',
      usuario: {
        email: usuario.email,
        nome: usuario.nome
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao resetar senha:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
