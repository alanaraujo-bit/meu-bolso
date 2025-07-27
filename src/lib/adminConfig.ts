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
