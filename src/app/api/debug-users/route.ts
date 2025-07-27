import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        criadoEm: true
      }
    });

    return NextResponse.json({
      success: true,
      total: usuarios.length,
      usuarios: usuarios
    });

  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
