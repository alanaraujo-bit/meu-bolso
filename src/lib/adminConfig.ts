// Configuração centralizada de administradores
export const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com', // Alan Araújo - Admin principal
  'admin@meubolso.com',
  // Adicione outros emails de admin aqui
];

// Função para verificar se um email é de administrador
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Função para obter a rota inicial baseada no tipo de usuário
export function getInitialRoute(email: string | null | undefined): string {
  if (isAdminEmail(email)) {
    return '/admin';
  }
  return '/dashboard';
}

// Função para obter a rota inicial baseada nas configurações do usuário
export async function getInitialRouteWithConfig(email: string | null | undefined): Promise<string> {
  if (isAdminEmail(email)) {
    return '/admin';
  }
  
  try {
    // Buscar configurações do usuário
    const response = await fetch('/api/usuario/configuracoes');
    if (response.ok) {
      const data = await response.json();
      const paginaInicial = data.configuracoes?.paginaInicial || 'dashboard';
      
      // Mapear página inicial para rota
      const rotaMap: { [key: string]: string } = {
        'dashboard': '/dashboard',
        'transacoes': '/transacoes',
        'categorias': '/categorias', 
        'metas': '/metas',
        'relatorios': '/dashboard' // Relatórios ainda não implementados, vai para dashboard
      };
      
      return rotaMap[paginaInicial] || '/dashboard';
    }
  } catch (error) {
    console.error('Erro ao buscar configurações do usuário:', error);
  }
  
  // Fallback para dashboard se houver erro
  return '/dashboard';
}
