import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

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
          return null;
        }

        try {
          // Tentar conectar com o banco primeiro
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email }
          });

          if (usuario) {
            const isPasswordValid = await bcrypt.compare(credentials.password, usuario.senha);
            
            if (isPasswordValid) {
              return {
                id: usuario.id,
                email: usuario.email,
                name: usuario.nome || '',
              };
            }
          }
        } catch (error) {
          console.log('⚠️ Erro de conexão com banco, usando usuários temporários:', error);
          
          // Se falhar, usar usuários temporários
          const tempUser = TEMP_USERS.find(user => user.email === credentials.email);
          
          if (tempUser) {
            const isPasswordValid = await bcrypt.compare(credentials.password, tempUser.senha);
            
            if (isPasswordValid) {
              return {
                id: tempUser.id,
                email: tempUser.email,
                name: tempUser.nome,
              };
            }
          }
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};