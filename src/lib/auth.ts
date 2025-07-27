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

// Usuários temporários para teste (remover quando o banco estiver funcionando)
const TEMP_USERS = [
  {
    id: '1',
    email: 'teste@teste.com',
    nome: 'Usuário Teste',
    senha: '$2b$10$g92IzJGsugx/Olm/4WqHJO3SHiJb9vqMiXSOVEfG4yD0Yy1znTN2q' // password: 123456
  },
  {
    id: '2',
    email: 'alanvitoraraujo1a@outlook.com',
    nome: 'Alan Araújo - Admin',
    senha: '$2b$10$sqFIaTQ2ZSO2tvrhYJKMgepfk5NlYlHjQjk.mjwr3z/fYRe2wLM02' // password: Sucesso@2025#
  },
  {
    id: '3',
    email: 'admin@admin.com',
    nome: 'Administrador',
    senha: '$2b$10$g92IzJGsugx/Olm/4WqHJO3SHiJb9vqMiXSOVEfG4yD0Yy1znTN2q' // password: 123456
  }
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

        // Usar apenas usuários temporários por enquanto
        const tempUser = TEMP_USERS.find(user => user.email === credentials.email);
        
        if (tempUser) {
          console.log('👤 Usuário encontrado:', tempUser.nome);
          const isPasswordValid = await bcrypt.compare(credentials.password, tempUser.senha);
          console.log('🔐 Senha válida:', isPasswordValid);
          
          if (isPasswordValid) {
            console.log('✅ Login autorizado para:', tempUser.email);
            return {
              id: tempUser.id,
              email: tempUser.email,
              name: tempUser.nome,
            };
          } else {
            console.log('❌ Senha incorreta para:', tempUser.email);
          }
        } else {
          console.log('❌ Usuário não encontrado:', credentials.email);
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