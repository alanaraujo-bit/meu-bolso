import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = [
  'alan.araujo7321@gmail.com'
];

// Configurações mockadas do sistema
const configuracoesSistema = [
  // Configurações Gerais
  {
    id: 'cfg_001',
    chave: 'nome_sistema',
    valor: 'Meu Bolso',
    tipo: 'text' as const,
    categoria: 'geral',
    descricao: 'Nome do sistema exibido na interface'
  },
  {
    id: 'cfg_002',
    chave: 'versao_sistema',
    valor: '2.0.0',
    tipo: 'text' as const,
    categoria: 'geral',
    descricao: 'Versão atual do sistema'
  },
  {
    id: 'cfg_003',
    chave: 'manutencao_ativa',
    valor: 'false',
    tipo: 'boolean' as const,
    categoria: 'geral',
    descricao: 'Ativar modo de manutenção'
  },
  {
    id: 'cfg_004',
    chave: 'max_usuarios',
    valor: '1000',
    tipo: 'number' as const,
    categoria: 'geral',
    descricao: 'Número máximo de usuários permitidos'
  },

  // Configurações de Segurança
  {
    id: 'cfg_101',
    chave: 'sessao_expira_minutos',
    valor: '720',
    tipo: 'number' as const,
    categoria: 'seguranca',
    descricao: 'Tempo de expiração da sessão em minutos'
  },
  {
    id: 'cfg_102',
    chave: 'senha_min_caracteres',
    valor: '8',
    tipo: 'number' as const,
    categoria: 'seguranca',
    descricao: 'Número mínimo de caracteres para senhas'
  },
  {
    id: 'cfg_103',
    chave: 'login_max_tentativas',
    valor: '5',
    tipo: 'number' as const,
    categoria: 'seguranca',
    descricao: 'Máximo de tentativas de login antes de bloquear'
  },

  // Configurações de E-mail
  {
    id: 'cfg_201',
    chave: 'email_smtp_host',
    valor: 'smtp.gmail.com',
    tipo: 'text' as const,
    categoria: 'email',
    descricao: 'Servidor SMTP para envio de e-mails'
  },
  {
    id: 'cfg_202',
    chave: 'email_smtp_porta',
    valor: '587',
    tipo: 'number' as const,
    categoria: 'email',
    descricao: 'Porta do servidor SMTP'
  },
  {
    id: 'cfg_203',
    chave: 'email_remetente',
    valor: 'noreply@meubolso.com',
    tipo: 'text' as const,
    categoria: 'email',
    descricao: 'E-mail remetente do sistema'
  },

  // Configurações de Notificações
  {
    id: 'cfg_301',
    chave: 'notif_transacoes_ativas',
    valor: 'true',
    tipo: 'boolean' as const,
    categoria: 'notificacoes',
    descricao: 'Enviar notificações de novas transações'
  },
  {
    id: 'cfg_302',
    chave: 'notif_metas_ativas',
    valor: 'true',
    tipo: 'boolean' as const,
    categoria: 'notificacoes',
    descricao: 'Enviar notificações sobre metas'
  },

  // Configurações de Aparência
  {
    id: 'cfg_401',
    chave: 'tema_padrao',
    valor: 'claro',
    tipo: 'select' as const,
    categoria: 'aparencia',
    descricao: 'Tema padrão do sistema',
    opcoes: ['claro', 'escuro', 'automatico']
  },
  {
    id: 'cfg_402',
    chave: 'cor_primaria',
    valor: '#3b82f6',
    tipo: 'text' as const,
    categoria: 'aparencia',
    descricao: 'Cor primária da interface'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    let configuracoesRetorno = configuracoesSistema;
    
    if (categoria && categoria !== 'all') {
      configuracoesRetorno = configuracoesSistema.filter(cfg => cfg.categoria === categoria);
    }

    return NextResponse.json({
      success: true,
      configuracoes: configuracoesRetorno,
      total: configuracoesRetorno.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { configuracoes } = await request.json();

    if (!Array.isArray(configuracoes)) {
      return NextResponse.json(
        { error: 'Configurações devem ser um array' },
        { status: 400 }
      );
    }

    // Simular salvamento das configurações
    console.log('📋 Configurações atualizadas pelo admin:', {
      usuario: session.user.email,
      timestamp: new Date().toISOString(),
      configuracoes: configuracoes.map(cfg => ({
        chave: cfg.chave,
        valor: cfg.valor
      }))
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      configuracoes_atualizadas: configuracoes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
