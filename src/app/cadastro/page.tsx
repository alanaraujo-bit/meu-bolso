"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import Logo from "@/components/branding/Logo";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMensagem("Usuário cadastrado com sucesso! Redirecionando para login...");
        setNome("");
        setEmail("");
        setSenha("");
        // Redireciona para login após 2 segundos
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMensagem(data.error || "Erro ao cadastrar usuário.");
      }
    } catch (error) {
      setMensagem("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={false} animated />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Meu Bolso
            </h1>
            <p className="text-gray-600 text-lg">
              Crie sua conta gratuita
            </p>
          </div>

          {/* Card de Cadastro */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Criar Conta
              </h2>
              <p className="text-gray-600">
                Preencha os dados abaixo para começar
              </p>
            </div>

            {/* Mensagem de Feedback */}
            {mensagem && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                mensagem.includes("sucesso") 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {mensagem}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg flex items-center justify-center gap-2"
              >
                {loading && <LoadingSpinner size="sm" color="white" />}
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>

            {/* Links Adicionais */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Já tem uma conta?
                </p>
                <button 
                  onClick={() => router.push("/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  Fazer login
                </button>
              </div>
            </div>

            {/* Termos */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Ao criar uma conta, você concorda com nossos{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>

          {/* Link para Voltar */}
          <div className="text-center mt-6">
            <button 
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-700 text-sm underline"
            >
              ← Voltar ao início
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-sm text-gray-700 font-medium">Seguro</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm text-gray-700 font-medium">Gratuito</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm text-gray-700 font-medium">Rápido</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
