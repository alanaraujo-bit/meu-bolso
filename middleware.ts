import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { timezoneMiddleware } from "@/lib/timezoneMiddleware";

// Configurar timezone logo no início
if (typeof process !== 'undefined' && process.env) {
  process.env.TZ = 'America/Sao_Paulo';
  process.env.TIMEZONE = 'America/Sao_Paulo';
}

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com',
  'admin@meubolso.com',
];

// Rotas que requerem onboarding completo
const rotasProtegidas = [
  '/dashboard',
  '/transacoes',
  '/categorias',
  '/metas',
  '/dividas',
  '/recorrentes',
  '/perfil'
];

// Rotas que não precisam de onboarding
const rotasLivres = [
  '/login',
  '/cadastro',
  '/onboarding',
  '/api'
];

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    
    // Se não está logado, redirecionar para login (exceto rotas livres)
    if (!token && !rotasLivres.some(rota => pathname.startsWith(rota))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Se está logado, verificar onboarding apenas para rotas protegidas
    if (token && rotasProtegidas.some(rota => pathname.startsWith(rota))) {
      try {
        // Verificar se o usuário já completou o onboarding
        const response = await fetch(new URL('/api/onboarding', req.url), {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Cookie': req.headers.get('cookie') || ''
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Se não completou o onboarding, redirecionar
          if (!data.onboardingCompleto && pathname !== '/onboarding') {
            return NextResponse.redirect(new URL('/onboarding', req.url));
          }
          
          // Se já completou e está tentando acessar onboarding, redirecionar para dashboard
          if (data.onboardingCompleto && pathname === '/onboarding') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        // Em caso de erro, permitir acesso (fail-safe)
      }
    }
    
    // Lógica de admin
    if (token?.email && ADMIN_EMAILS.includes(token.email)) {
      // Se está tentando acessar o dashboard normal, redirecionar para admin
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    
    // Para usuários normais, não permitir acesso ao admin
    if (pathname.startsWith('/admin') && token?.email && !ADMIN_EMAILS.includes(token.email)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Páginas públicas
        if (pathname === '/' || rotasLivres.some(rota => pathname.startsWith(rota))) {
          return true;
        }
        
        // Páginas protegidas requerem token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|uploads).*)',
  ],
};
