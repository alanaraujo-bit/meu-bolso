'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Logo from '@/components/branding/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focoEmail, setFocoEmail] = useState(false);
  const [focoSenha, setFocoSenha] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pré-preencher email se vier da URL (vindo do cadastro)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setMensagem('🎉 Conta criada com sucesso! Faça login para continuar.');
      setTipoMensagem('success');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const result = await signIn('credentials', {
        email,
        password: senha,
        redirect: false,
      });

      if (result?.error) {
        setMensagem('❌ Email ou senha inválidos');
        setTipoMensagem('error');
      } else {
        setMensagem('✅ Login realizado com sucesso!');
        setTipoMensagem('success');
        
        // Aguardar um pouco para a sessão ser estabelecida
        setTimeout(() => {
          // O OnboardingGuard vai cuidar do redirecionamento apropriado
          router.push('/dashboard');
        }, 500);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setMensagem('❌ Erro ao fazer login. Tente novamente.');
      setTipoMensagem('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" animated />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link href="/cadastro" className="font-medium text-indigo-600 hover:text-indigo-500">
              crie uma conta gratuita
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-600 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-600 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {mensagem && (
            <div className={`text-center text-sm ${
              mensagem.includes('sucesso') ? 'text-green-600' : 'text-red-600'
            }`}>
              {mensagem}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading && <LoadingSpinner size="xs" color="white" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              Voltar para a página inicial
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
