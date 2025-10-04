import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { authOptions } from '@/lib/auth';

// POST - Atualizar status de atividade do usuário
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { acao, dispositivo, ip } = await req.json();
    
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const agora = new Date();
    
    let dadosUpdate: any = {
      atualizadoEm: agora, // usar atualizadoEm enquanto ultimaAtividade não está disponível
    };

    switch (acao) {
      case 'login':
        dadosUpdate = {
          ...dadosUpdate,
        };
        break;
        
      case 'activity':
        dadosUpdate = {
          ...dadosUpdate,
        };
        break;
        
      case 'away':
        dadosUpdate = {
          ...dadosUpdate,
        };
        break;
        
      case 'logout':
        dadosUpdate = {
          ...dadosUpdate,
        };
        break;
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: dadosUpdate,
    });

    return NextResponse.json({
      success: true,
      ultimaAtividade: usuarioAtualizado.atualizadoEm,
    });

  } catch (error) {
    console.error("Erro ao atualizar atividade:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// GET - Obter status de atividade atual do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nome: true,
        atualizadoEm: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);

  } catch (error) {
    console.error("Erro ao obter status de atividade:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
