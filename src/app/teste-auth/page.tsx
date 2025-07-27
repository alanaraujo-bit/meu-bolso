"use client";

import { useState } from 'react';

export default function TesteAuth() {
  const [email, setEmail] = useState('alanvitoraraujo1a@outlook.com');
  const [senha, setSenha] = useState('Sucesso@2025#');
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);

  const testarAuth = async () => {
    setLoading(true);
    setResultado('Testando...');
    
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: senha,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResultado(`✅ SUCESSO! Usuário: ${data.user.nome} | Admin: ${data.user.isAdmin ? 'SIM' : 'NÃO'}`);
      } else {
        setResultado(`❌ ERRO: ${response.status} - ${data.error}`);
      }
    } catch (error: any) {
      setResultado(`❌ ERRO: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">🔧 Teste de Autenticação Admin</h1>
        
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
            onClick={testarAuth}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Autenticação'}
          </button>
          
          {resultado && (
            <div className={`p-4 rounded-lg text-center ${
              resultado.includes('SUCESSO') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {resultado}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Credenciais Configuradas:</h3>
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> alanvitoraraujo1a@outlook.com<br/>
              <strong>Senha:</strong> Sucesso@2025#
            </p>
          </div>
          
          <div className="text-center">
            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Voltar para Login Normal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
