"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, UserPlus } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Logo from "@/components/branding/Logo";
import Link from "next/link";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focoNome, setFocoNome] = useState(false);
  const [focoEmail, setFocoEmail] = useState(false);
  const [focoSenha, setFocoSenha] = useState(false);
  const router = useRouter();

  // Validação de senha em tempo real
  const validarSenha = (senha: string) => {
    const criterios = {
      tamanho: senha.length >= 6,
      temNumero: /\d/.test(senha),
      temLetra: /[a-zA-Z]/.test(senha)
    };
    return criterios;
  };

  const criteriosSenha = validarSenha(senha);
  const senhaValida = Object.values(criteriosSenha).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    // Validações no frontend
    if (!nome.trim()) {
      setMensagem("❌ Por favor, preencha seu nome");
      setTipoMensagem('error');
      setLoading(false);
      return;
    }

    if (!senhaValida) {
      setMensagem("❌ A senha deve atender aos critérios de segurança");
      setTipoMensagem('error');
      setLoading(false);
      return;
    }

    try {
      // Primeiro, cadastrar o usuário
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMensagem("🎉 Conta criada com sucesso! Fazendo login...");
        setTipoMensagem('success');
        
        // Fazer login automaticamente
        const loginResult = await signIn("credentials", {
          email,
          password: senha,
          redirect: false,
        });

        if (loginResult?.ok) {
          setMensagem("✅ Login realizado! Redirecionando para configuração inicial...");
          
          // Aguardar um pouco para a sessão ser estabelecida
          setTimeout(() => {
            // Forçar navegação direta para onboarding
            window.location.href = "/onboarding";
          }, 1000);
        } else {
          // Se o login automático falhar, redirecionar para login manual
          setMensagem("✅ Conta criada! Redirecionando para login...");
          setTimeout(() => {
            router.push("/login?email=" + encodeURIComponent(email));
          }, 2000);
        }
        
        // Limpar campos
        setNome("");
        setEmail("");
        setSenha("");
      } else {
        setMensagem(`❌ ${data.error || "Erro ao cadastrar usuário."}`);
        setTipoMensagem('error');
      }
    } catch (error) {
      setMensagem("❌ Erro de conexão. Tente novamente.");
      setTipoMensagem('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Header com Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
              <div className="bg-white rounded-full p-4 shadow-lg ring-4 ring-blue-100">
                <Logo size="xl" animated />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bem-vindo ao Meu Bolso!
              </h2>
              <p className="text-gray-600 font-medium">
                Crie sua conta gratuita e comece a organizar suas finanças
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>100% gratuito e sem complicações</span>
              </div>
            </div>
          </div>

          {/* Card do formulário */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Nome */}
              <div className="space-y-1">
                <label htmlFor="nome" className="block text-sm font-semibold text-gray-700">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focoNome ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 ${
                      focoNome ? 'border-blue-300 bg-white shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Como você gostaria de ser chamado?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onFocus={() => setFocoNome(true)}
                    onBlur={() => setFocoNome(false)}
                  />
                </div>
              </div>

              {/* Campo Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focoEmail ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 ${
                      focoEmail ? 'border-blue-300 bg-white shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocoEmail(true)}
                    onBlur={() => setFocoEmail(false)}
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-1">
                <label htmlFor="senha" className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focoSenha ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-12 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 ${
                      focoSenha ? 'border-blue-300 bg-white shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Crie uma senha segura"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onFocus={() => setFocoSenha(true)}
                    onBlur={() => setFocoSenha(false)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Critérios de senha */}
                {senha && (
                  <div className="mt-2 space-y-2">
                    <div className={`flex items-center text-xs ${criteriosSenha.tamanho ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`w-3 h-3 mr-1 ${criteriosSenha.tamanho ? 'text-green-500' : 'text-gray-300'}`} />
                      Pelo menos 6 caracteres
                    </div>
                    <div className={`flex items-center text-xs ${criteriosSenha.temLetra ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`w-3 h-3 mr-1 ${criteriosSenha.temLetra ? 'text-green-500' : 'text-gray-300'}`} />
                      Pelo menos uma letra
                    </div>
                    <div className={`flex items-center text-xs ${criteriosSenha.temNumero ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`w-3 h-3 mr-1 ${criteriosSenha.temNumero ? 'text-green-500' : 'text-gray-300'}`} />
                      Pelo menos um número
                    </div>
                  </div>
                )}
              </div>

              {/* Mensagem de feedback */}
              {mensagem && (
                <div className={`p-4 rounded-xl border-l-4 ${
                  tipoMensagem === 'success' 
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700' 
                    : tipoMensagem === 'error'
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : 'bg-blue-50 border-blue-400 text-blue-700'
                } transition-all duration-300 animate-fade-in`}>
                  <div className="flex items-center">
                    {tipoMensagem === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {tipoMensagem === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                    <span className="text-sm font-medium">{mensagem}</span>
                  </div>
                </div>
              )}

              {/* Botão de cadastro */}
              <button
                type="submit"
                disabled={loading || !senhaValida}
                className="group relative w-full flex justify-center items-center gap-3 py-3 px-4 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="xs" color="white" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Criar minha conta gratuita</span>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Links adicionais */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link 
                    href="/login" 
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/" 
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
                >
                  ← Voltar para a página inicial
                </Link>
              </div>
            </div>
          </div>

          {/* Footer com benefícios */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Sempre Gratuito</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>Privacidade Total</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Suporte 24/7</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
