import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const adminEmail = 'alanvitoraraujo1a@outlook.com';
    const adminPassword = 'Sucesso@2025#';
    
    console.log('🔧 Criando usuário admin automaticamente...');

    // Verificar se o admin já existe
    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail }
    });

    if (adminExistente) {
      return NextResponse.json({
        success: true,
        message: 'Admin já existe',
        admin: {
          email: adminExistente.email,
          nome: adminExistente.nome
        }
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(adminPassword, 10);

    // Criar usuário admin
    const adminUser = await prisma.usuario.create({
      data: {
        email: adminEmail,
        senha: senhaHash,
        nome: 'Alan Araújo - Admin'
      }
    });

    console.log('✅ Admin criado:', adminUser.email);

    return NextResponse.json({
      success: true,
      message: 'Admin criado com sucesso',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        nome: adminUser.nome
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar admin:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
