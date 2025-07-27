import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com',
  'admin@meubolso.com',
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    
    // Se o usuário está logado e é admin, mas não está no painel admin
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
        if (pathname === '/' || pathname === '/login' || pathname === '/cadastro') {
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
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
