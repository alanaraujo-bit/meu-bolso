"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: senha,
      });

      if (res?.ok) {
        setMensagem("Login realizado com sucesso!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setMensagem("Email ou senha incorretos");
      }
    } catch (error) {
      setMensagem("Erro ao fazer login. Tente novamente.");
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
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl">💰</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Meu Bolso
            </h1>
            <p className="text-gray-600">
              Entre na sua conta para gerenciar suas finanças
            </p>
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Entrar
            </h2>

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
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            {/* Link para Cadastro */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Não tem uma conta?{" "}
                <a
                  href="/cadastro"
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Criar conta
                </a>
              </p>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-gray-600 hover:text-gray-700 underline"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}