"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Logo from '@/components/branding/Logo';

export default function LoginSimples() {
  const [email, setEmail] = useState('alanvitoraraujo1a@outlook.com');
  const [senha, setSenha] = useState('Sucesso@2025#');
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fazerLogin = async () => {
    setLoading(true);
    setResultado('Fazendo login...');
    
    try {
      console.log('🔍 Iniciando login:', { email, senha });
      
      const result = await signIn('credentials', {
        email,
        password: senha,
        redirect: false
      });
      
      console.log('🔄 Resultado do signIn:', result);
      
      if (result?.error) {
        setResultado(`❌ ERRO: ${result.error}`);
      } else if (result?.ok) {
        setResultado('✅ LOGIN REALIZADO COM SUCESSO! Redirecionando...');
        
        // Aguardar um pouco para a sessão ser estabelecida
        setTimeout(() => {
          if (email === 'alanvitoraraujo1a@outlook.com') {
            console.log('🛡️ Redirecionando admin para /admin');
            router.push('/admin');
          } else {
            console.log('👤 Redirecionando usuário para /dashboard');
            router.push('/dashboard');
          }
        }, 1000);
      } else {
        setResultado('❌ ERRO: Resposta inesperada do servidor');
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      setResultado(`❌ ERRO: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} animated />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ Login Admin Direto</h1>
          <p className="text-gray-600">Teste de login administrativo</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha:
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={fazerLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" color="white" />}
            {loading ? 'Fazendo Login...' : '🚀 FAZER LOGIN ADMIN'}
          </button>
          
          {resultado && (
            <div className={`p-4 rounded-lg text-center text-sm ${
              resultado.includes('SUCESSO') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {resultado}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔑 Credenciais Admin:</h3>
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> alanvitoraraujo1a@outlook.com<br/>
              <strong>Senha:</strong> Sucesso@2025#
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <a 
              href="/teste-auth" 
              className="text-blue-600 hover:text-blue-800 underline block"
            >
              🧪 Teste de API
            </a>
            <a 
              href="/login" 
              className="text-gray-600 hover:text-gray-800 underline block"
            >
              ← Login Normal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
