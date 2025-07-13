"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo de volta, {session.user?.name || session.user?.email}! 👋
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Gerencie suas finanças de forma inteligente
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200"
              >
                📊 Ir para Dashboard
              </button>
              <button
                onClick={() => router.push('/transacoes')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200"
              >
                💳 Gerenciar Transações
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Call to Action */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Comece a organizar suas finanças hoje!
            </h2>
            <p className="text-gray-600 mb-8">
              Crie sua conta gratuita e tenha controle total sobre seu dinheiro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/cadastro")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-lg shadow-lg"
              >
                Criar Conta Gratuita
              </button>
              <button
                onClick={() => router.push("/login")}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-lg shadow-lg border border-gray-200"
              >
                Fazer Login
              </button>
            </div>
          </div>

          {/* Benefícios */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Seguro</h3>
              <p className="text-sm text-gray-600">
                Seus dados financeiros protegidos com criptografia
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Gratuito</h3>
              <p className="text-sm text-gray-600">
                100% gratuito, sem taxas ou mensalidades
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Rápido</h3>
              <p className="text-sm text-gray-600">
                Interface simples e intuitiva para uso diário
              </p>
            </div>
          </div>

          {/* Recursos */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-semibold mb-6">
              Recursos Principais
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Transações Completas</h4>
                  <p className="text-blue-100 text-sm">
                    Registre receitas e despesas com tags e anexos
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Categorias Personalizadas</h4>
                  <p className="text-blue-100 text-sm">
                    Organize suas finanças do seu jeito
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Filtros Avançados</h4>
                  <p className="text-blue-100 text-sm">
                    Encontre transações por data, tipo ou categoria
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Dados Seguros</h4>
                  <p className="text-blue-100 text-sm">
                    Informações protegidas e privadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}