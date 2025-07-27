"use client";

import { useState } from 'react';

export default function DebugUsers() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      // Como não temos uma API específica, vamos mostrar os usuários hardcoded
      const usuariosHardcoded = [
        {
          id: '1',
          email: 'teste@teste.com',
          nome: 'Usuário Teste',
          senha: '123456 (hash: $2b$10$g92IzJGsugx/Olm/4WqHJO3SHiJb9vqMiXSOVEfG4yD0Yy1znTN2q)',
          isAdmin: false
        },
        {
          id: '2', 
          email: 'alanvitoraraujo1a@outlook.com',
          nome: 'Alan Araújo - Admin',
          senha: 'Sucesso@2025# (hash: $2b$10$sqFIaTQ2ZSO2tvrhYJKMgepfk5NlYlHjQjk.mjwr3z/fYRe2wLM02)',
          isAdmin: true
        },
        {
          id: '3',
          email: 'admin@admin.com', 
          nome: 'Administrador',
          senha: '123456 (hash: $2b$10$g92IzJGsugx/Olm/4WqHJO3SHiJb9vqMiXSOVEfG4yD0Yy1znTN2q)',
          isAdmin: false
        }
      ];
      
      setUsuarios(usuariosHardcoded);
    } catch (error) {
      console.error('Erro:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6">🔍 Debug - Usuários do Sistema</h1>
          
          <div className="text-center mb-6">
            <button
              onClick={carregarUsuarios}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Mostrar Usuários Configurados'}
            </button>
          </div>
          
          {usuarios.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">👥 Usuários Configurados:</h2>
              
              {usuarios.map((usuario: any) => (
                <div 
                  key={usuario.id}
                  className={`p-4 rounded-lg border-2 ${
                    usuario.isAdmin 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {usuario.nome} {usuario.isAdmin && '🛡️'}
                      </h3>
                      <p className="text-gray-600">
                        <strong>Email:</strong> {usuario.email}
                      </p>
                      <p className="text-gray-600">
                        <strong>Senha:</strong> {usuario.senha}
                      </p>
                      <p className="text-sm">
                        <strong>Tipo:</strong> {usuario.isAdmin ? 'Administrador' : 'Usuário Normal'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        usuario.isAdmin 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.isAdmin ? 'ADMIN' : 'USER'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Instruções para Login Admin:</h3>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>Use o email: <code className="bg-yellow-200 px-1 rounded">alanvitoraraujo1a@outlook.com</code></li>
                  <li>Use a senha: <code className="bg-yellow-200 px-1 rounded">Sucesso@2025#</code></li>
                  <li>Após o login, você será redirecionado automaticamente para o painel admin</li>
                </ol>
              </div>
              
              <div className="text-center mt-6 space-x-4">
                <a 
                  href="/login" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
                >
                  Ir para Login
                </a>
                <a 
                  href="/teste-auth" 
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 inline-block"
                >
                  Teste de Auth
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
