'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, Sparkles, Moon, Sun } from 'lucide-react';
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
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detectar preferência do sistema e carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    } relative overflow-hidden`}>
      
      {/* Toggle Dark Mode - Posição fixa no topo direito */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-40 p-2 sm:p-3 rounded-full transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-amber-400 hover:text-amber-300' 
            : 'bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900'
        } backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-110`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* Background decorativo - Adaptado para dark mode */}
      <div className="absolute inset-0">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-teal-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
          </>
        )}
      </div>

      <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Header com Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8 transform hover:scale-105 transition-transform duration-300">
              <div className={`rounded-2xl p-4 sm:p-6 shadow-2xl ring-4 transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-800/90 ring-emerald-500/20 backdrop-blur-sm' 
                  : 'bg-white ring-emerald-100'
              }`}>
                <Logo size="xl" animated showText={true} />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <h2 className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Bem-vindo de volta! 
              </h2>
              <p className={`font-medium text-base sm:text-lg transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Entre na sua conta e continue gerenciando suas finanças
              </p>
              <div className={`flex items-center justify-center gap-2 text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Sua jornada financeira continua aqui</span>
              </div>
            </div>
          </div>

          {/* Card do formulário - Adaptado para dark mode e responsividade */}
          <div className={`rounded-2xl shadow-xl border transition-all duration-300 p-6 sm:p-8 space-y-6 ${
            darkMode 
              ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
              : 'bg-white/80 backdrop-blur-sm border-white/20'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Campo Email - Totalmente responsivo */}
              <div className="space-y-1">
                <label htmlFor="email" className={`block text-sm font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focoEmail 
                      ? 'text-emerald-500' 
                      : darkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-400'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                      darkMode
                        ? focoEmail
                          ? 'bg-gray-700 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700'
                        : focoEmail 
                          ? 'border-emerald-300 bg-white text-gray-900 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 bg-white/70 text-gray-900'
                    }`}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocoEmail(true)}
                    onBlur={() => setFocoEmail(false)}
                  />
                </div>
              </div>

              {/* Campo Senha - Totalmente responsivo */}
              <div className="space-y-1">
                <label htmlFor="senha" className={`block text-sm font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Senha
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focoSenha 
                      ? 'text-emerald-500' 
                      : darkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={`block w-full pl-10 pr-12 py-3 border-2 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                      darkMode
                        ? focoSenha
                          ? 'bg-gray-700 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700'
                        : focoSenha 
                          ? 'border-emerald-300 bg-white text-gray-900 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 bg-white/70 text-gray-900'
                    }`}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onFocus={() => setFocoSenha(true)}
                    onBlur={() => setFocoSenha(false)}
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 ${
                      darkMode 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensagem de feedback - Adaptada para dark mode */}
              {mensagem && (
                <div className={`p-4 rounded-xl border-l-4 transition-all duration-300 animate-fade-in ${
                  tipoMensagem === 'success' 
                    ? darkMode
                      ? 'bg-emerald-900/30 border-emerald-400 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : tipoMensagem === 'error'
                    ? darkMode
                      ? 'bg-red-900/30 border-red-400 text-red-300'
                      : 'bg-red-50 border-red-400 text-red-700'
                    : darkMode
                      ? 'bg-blue-900/30 border-blue-400 text-blue-300'
                      : 'bg-blue-50 border-blue-400 text-blue-700'
                }`}>
                  <div className="flex items-center">
                    {tipoMensagem === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {tipoMensagem === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                    <span className="text-sm font-medium">{mensagem}</span>
                  </div>
                </div>
              )}

              {/* Botão de login - Adaptado para dark mode e responsividade */}
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center items-center gap-3 py-3 px-4 text-sm font-semibold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl ${
                  darkMode
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                }`}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="xs" color="white" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar na conta</span>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Links adicionais - Adaptados para dark mode */}
            <div className={`space-y-4 pt-4 border-t transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="text-center">
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Ainda não tem uma conta?{' '}
                  <Link 
                    href="/cadastro" 
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
                  >
                    Criar conta gratuita
                  </Link>
                </p>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/" 
                  className={`text-sm font-medium transition-colors duration-200 hover:underline ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ← Voltar para a página inicial
                </Link>
              </div>
            </div>
          </div>

          {/* Footer com benefícios - Adaptado para dark mode e responsividade */}
          <div className="text-center space-y-3">
            <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span>Dados Seguros</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Sem Anúncios</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
