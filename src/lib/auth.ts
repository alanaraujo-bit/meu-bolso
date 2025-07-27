import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com', // Seu email de admin
  'admin@meubolso.com',
  // Adicione outros emails de admin aqui
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais incompletas');
          return null;
        }

        console.log('🔍 Tentativa de login:', credentials.email);

        try {
          // Buscar usuário no banco de dados real
          const user = await prisma.usuario.findUnique({
            where: { email: credentials.email }
          });
          
          if (user) {
            console.log('👤 Usuário encontrado:', user.nome);
            const isPasswordValid = await bcrypt.compare(credentials.password, user.senha);
            console.log('🔐 Senha válida:', isPasswordValid);
            
            if (isPasswordValid) {
              console.log('✅ Login autorizado para:', user.email);
              return {
                id: user.id,
                email: user.email,
                name: user.nome || 'Usuário',
              };
            } else {
              console.log('❌ Senha incorreta para:', user.email);
            }
          } else {
            console.log('❌ Usuário não encontrado:', credentials.email);
            
            // Se for o email do admin e não existir, criar automaticamente
            if (credentials.email === 'alanvitoraraujo1a@outlook.com' && credentials.password === 'Sucesso@2025#') {
              console.log('🔧 Criando admin automaticamente...');
              try {
                const senhaHash = await bcrypt.hash(credentials.password, 10);
                const adminUser = await prisma.usuario.create({
                  data: {
                    email: credentials.email,
                    senha: senhaHash,
                    nome: 'Alan Araújo - Admin'
                  }
                });
                
                console.log('✅ Admin criado automaticamente:', adminUser.email);
                return {
                  id: adminUser.id,
                  email: adminUser.email,
                  name: adminUser.nome || 'Admin',
                };
              } catch (createError) {
                console.error('❌ Erro ao criar admin:', createError);
              }
            }
          }
        } catch (error) {
          console.error('❌ Erro ao buscar usuário:', error);
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = ADMIN_EMAILS.includes(user.email || '');
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL já é uma URL completa e é do nosso domínio, usar ela
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Se é uma URL relativa, construir a URL completa
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Caso contrário, retornar a URL base
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
  },
};