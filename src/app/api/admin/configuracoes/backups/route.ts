import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = [
  'alan.araujo7321@gmail.com'
];

// Backups simulados
const backups = [
  {
    id: 'backup_001',
    nome: 'backup-automatico-2025-01-28.sql',
    tamanho: '2.4 MB',
    criadoEm: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    tipo: 'automatico' as const,
    status: 'concluido' as const
  },
  {
    id: 'backup_002',
    nome: 'backup-manual-2025-01-27.sql',
    tamanho: '2.3 MB',
    criadoEm: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    tipo: 'manual' as const,
    status: 'concluido' as const
  },
  {
    id: 'backup_003',
    nome: 'backup-automatico-2025-01-26.sql',
    tamanho: '2.2 MB',
    criadoEm: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
    tipo: 'automatico' as const,
    status: 'concluido' as const
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      backups: backups,
      total: backups.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar backups:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
