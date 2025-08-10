import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // Se não está logado, redirecionar para login
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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Permitir acesso a rotas livres
        if (rotasLivres.some(rota => pathname.startsWith(rota))) {
          return true;
        }
        
        // Para outras rotas, verificar se tem token
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
