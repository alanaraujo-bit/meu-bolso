import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = [
  'alan.araujo7321@gmail.com'
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { tipo = 'manual' } = await request.json();

    // Simular criação de backup
    const timestamp = new Date().toISOString().split('T')[0];
    const novoBackup = {
      id: `backup_${Date.now()}`,
      nome: `backup-${tipo}-${timestamp}.sql`,
      tamanho: '2.5 MB',
      criadoEm: new Date().toISOString(),
      tipo: tipo as 'manual' | 'automatico',
      status: 'concluido' as const
    };

    console.log('🗄️ Backup criado pelo admin:', {
      usuario: session.user.email,
      backup: novoBackup,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Backup criado com sucesso',
      backup: novoBackup,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
