"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, Settings, Shield, Trash2, Download, Calendar, 
  BarChart3, Target, CreditCard, TrendingUp, Clock,
  AlertTriangle, CheckCircle, Save, Loader, Camera,
  Upload, X, Edit3
} from 'lucide-react';
import { PerfilUsuario, ConfiguracoesUsuario, OpcoesLimpeza, CONFIGURACOES_PADRAO } from '@/types/perfil';
import { formatDataBrasileiraExibicao, formatDataHoraBrasileiraExibicao } from '@/lib/dateUtils';

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesUsuario>(CONFIGURACOES_PADRAO);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarLimpeza, setMostrarLimpeza] = useState(false);
  const [mostrarExclusao, setMostrarExclusao] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [mostrarEditarFoto, setMostrarEditarFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [opcoes, setOpcoes] = useState<OpcoesLimpeza>({
    transacoes: false,
    categorias: false,
    metas: false,
    dividas: false,
    todosOsDados: false
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    carregarPerfil();
  }, [session, router]);

  const carregarPerfil = async () => {
    try {
      console.log('🔄 Carregando perfil do usuário...');
      const response = await fetch('/api/usuario/perfil');
      
      if (response.ok) {
        const dados = await response.json();
        console.log('✅ Perfil carregado:', dados);
        setPerfil(dados.perfil);
        setConfiguracoes({ ...CONFIGURACOES_PADRAO, ...dados.perfil.configuracoes });
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao carregar perfil:', errorData);
        alert('Erro ao carregar perfil: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      alert('Erro de conexão ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setSalvando(true);
    try {
      console.log('🔄 Salvando configurações:', configuracoes);
      
      // Primeiro testar a API simples
      console.log('🧪 Testando API simples primeiro...');
      const testResponse = await fetch('/api/test-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracoes)
      });
      
      console.log('🧪 Teste - Status:', testResponse.status);
      const testData = await testResponse.text();
      console.log('🧪 Teste - Resposta:', testData);
      
      // Agora tentar a API real
      console.log('🔄 Tentando API real...');
      const response = await fetch('/api/usuario/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracoes)
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', response.headers);

      let data;
      const responseText = await response.text();
      console.log('📦 Resposta bruta:', responseText);

      try {
        data = JSON.parse(responseText);
        console.log('📦 Resposta parseada:', data);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta:', parseError);
        console.error('❌ Resposta recebida:', responseText);
        alert('❌ Erro: Resposta inválida do servidor');
        return;
      }

      if (response.ok) {
        console.log('✅ Configurações salvas com sucesso!');
        alert('✅ Configurações salvas com sucesso!');
        carregarPerfil(); // Recarrega os dados
      } else {
        console.error('❌ Erro do servidor:', data);
        alert('❌ Erro ao salvar configurações: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert('❌ Erro de conexão ao salvar configurações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSalvando(false);
    }
  };

  const executarLimpeza = async () => {
    if (!Object.values(opcoes).some(Boolean)) {
      alert('⚠️ Selecione pelo menos uma opção para limpar');
      return;
    }

    const confirmacao = prompt(
      '⚠️ ATENÇÃO: Esta ação NÃO PODE ser desfeita!\n\nDigite "CONFIRMAR" para prosseguir:'
    );

    if (confirmacao !== 'CONFIRMAR') {
      alert('❌ Operação cancelada');
      return;
    }

    try {
      const response = await fetch('/api/usuario/limpar-dados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opcoes)
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Dados limpos com sucesso!\n\n' + data.resultados.join('\n'));
        setMostrarLimpeza(false);
        setOpcoes({
          transacoes: false,
          categorias: false,
          metas: false,
          dividas: false,
          todosOsDados: false
        });
        carregarPerfil(); // Recarrega estatísticas
      } else {
        console.error('Erro do servidor:', data);
        alert('❌ Erro ao limpar dados: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      alert('❌ Erro de conexão ao limpar dados');
    }
  };

  const excluirConta = async () => {
    const confirmacao1 = prompt(
      '🚨 ATENÇÃO MÁXIMA! 🚨\n\nEsta ação irá EXCLUIR PERMANENTEMENTE sua conta e TODOS os dados.\n\n❌ NÃO HÁ COMO DESFAZER!\n\nDigite "EXCLUIR CONTA" para confirmar:'
    );

    if (confirmacao1 !== 'EXCLUIR CONTA') {
      alert('❌ Operação cancelada');
      return;
    }

    const confirmacao2 = prompt(
      '🔐 Última confirmação de segurança.\n\nDigite seu email EXATO para confirmar a exclusão:'
    );

    if (confirmacao2 !== session?.user?.email) {
      alert('❌ Email incorreto. Operação cancelada por segurança.');
      return;
    }

    try {
      const response = await fetch('/api/usuario/excluir-conta', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Conta excluída com sucesso.\n\n👋 Você será redirecionado para a página inicial.');
        // Limpar sessão e redirecionar
        window.location.href = '/';
      } else {
        console.error('Erro do servidor:', data);
        alert('❌ Erro ao excluir conta: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('❌ Erro de conexão ao excluir conta');
    }
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: configuracoes.formatoMoeda,
    }).format(valor);
  };

  const handleFotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
      return;
    }

    // Validar tamanho (máximo 2MB para produção)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert(`❌ A imagem deve ter no máximo 2MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setUploadingFoto(true);
    
    console.log('🔄 Iniciando upload...', {
      nome: file.name,
      tipo: file.type,
      tamanho: file.size
    });
    
    try {
      // 1. Fazer upload da imagem
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Enviando para /api/upload/avatar...');
      
      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        // Não definir Content-Type para FormData - deixar o browser fazer
      });

      console.log('📥 Resposta recebida:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        ok: uploadResponse.ok
      });

      let uploadData;
      try {
        const responseText = await uploadResponse.text();
        console.log('📋 Resposta bruta:', responseText);
        uploadData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta:', parseError);
        alert('❌ Erro: Resposta inválida do servidor');
        return;
      }

      if (!uploadResponse.ok) {
        console.error('❌ Erro do servidor no upload:', uploadData);
        alert(`❌ Erro ao fazer upload da foto: ${uploadData.error || 'Erro desconhecido'}\n${uploadData.details ? `Detalhes: ${uploadData.details}` : ''}`);
        return;
      }

      console.log('✅ Upload bem-sucedido:', uploadData);

      // Validar se recebemos uma URL ou base64 válidos
      if (!uploadData.url) {
        console.error('❌ Nenhuma URL recebida:', uploadData);
        alert('❌ Erro: Servidor não retornou imagem válida');
        return;
      }

      // 2. Salvar o avatar automaticamente no banco de dados
      console.log('💾 Salvando no banco de dados...');
      console.log('📋 Tipo de dados:', uploadData.url.startsWith('data:') ? 'base64' : 'URL');
      console.log('📋 Tamanho:', uploadData.url.startsWith('data:') ? 
        Math.round(uploadData.url.length / 1024) + 'KB' : 
        uploadData.url.length + ' chars');
      
      const saveResponse = await fetch('/api/usuario/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl: uploadData.url })
      });

      let saveData;
      try {
        saveData = await saveResponse.json();
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta de salvamento:', parseError);
        alert('❌ Foto foi enviada mas não foi possível salvar');
        return;
      }

      if (saveResponse.ok) {
        alert('✅ Foto atualizada e salva automaticamente!');
        // Atualizar o perfil com a nova foto
        if (perfil) {
          setPerfil({ ...perfil, avatarUrl: uploadData.url });
        }
        
        // Remover do localStorage já que foi salvo no banco
        localStorage.removeItem(`avatar_${session?.user?.email}`);
        
        setMostrarEditarFoto(false);
      } else {
        console.error('❌ Erro ao salvar avatar no banco:', saveData);
        alert(`❌ Foto foi enviada mas não foi salva automaticamente: ${saveData.error || 'Erro desconhecido'}`);
        
        // Como fallback, manter no localStorage
        if (perfil) {
          setPerfil({ ...perfil, avatarUrl: uploadData.url });
        }
      }
    } catch (error) {
      console.error('💥 Erro ao fazer upload:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('❌ Erro de conexão: Verifique sua internet e tente novamente');
      } else {
        alert(`❌ Erro inesperado ao fazer upload da foto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } finally {
      setUploadingFoto(false);
    }
  };

  const removerFoto = async () => {
    if (!confirm('🗑️ Tem certeza que deseja remover sua foto do perfil?')) {
      return;
    }

    setUploadingFoto(true);
    try {
      const response = await fetch(`/api/upload/avatar/delete`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Foto removida com sucesso!');
        // Remover a foto do perfil
        if (perfil) {
          setPerfil({ ...perfil, avatarUrl: undefined });
        }
        setMostrarEditarFoto(false);
      } else {
        console.error('Erro do servidor:', data);
        alert('❌ Erro ao remover foto: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      alert('❌ Erro de conexão ao remover foto');
    } finally {
      setUploadingFoto(false);
    }
  };

  const atualizarNome = async (novoNome: string) => {
    try {
      const response = await fetch('/api/usuario/atualizar-nome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Nome atualizado com sucesso!');
        // Atualizar o perfil com o novo nome
        if (perfil) {
          setPerfil({ ...perfil, nome: novoNome });
        }
      } else {
        console.error('Erro do servidor:', data);
        alert('❌ Erro ao atualizar nome: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      alert('❌ Erro de conexão ao atualizar nome');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Erro ao carregar perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header do Perfil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            {/* Avatar com funcionalidade de edição */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-4 border-blue-100 bg-gray-100">
                {perfil.avatarUrl ? (
                  <img 
                    src={perfil.avatarUrl} 
                    alt="Foto do perfil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Se a imagem falhar ao carregar, mostrar fallback
                      console.error('Erro ao carregar avatar:', perfil.avatarUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {perfil.nome?.charAt(0).toUpperCase() || '👤'}
                  </div>
                )}
              </div>
              
              {/* Overlay de edição */}
              <button
                onClick={() => setMostrarEditarFoto(true)}
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              
              {/* Indicador de edição */}
              <button
                onClick={() => setMostrarEditarFoto(true)}
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{perfil.nome || 'Usuário'}</h1>
                <button
                  onClick={() => {
                    const novoNome = prompt('✏️ Digite seu novo nome:', perfil.nome || '');
                    if (novoNome && novoNome.trim() && novoNome !== perfil.nome) {
                      atualizarNome(novoNome.trim());
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="Editar nome"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600">{perfil.email}</p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Membro desde {formatDataBrasileiraExibicao(new Date(perfil.criadoEm))}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Último acesso: {formatDataHoraBrasileiraExibicao(new Date(perfil.ultimaAtividade))}
              </p>
            </div>
          </div>
        </div>

        {/* Modal de Edição de Foto */}
        {mostrarEditarFoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">📸 Editar Foto do Perfil</h3>
                <button
                  onClick={() => setMostrarEditarFoto(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Preview da foto atual */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                    {perfil.avatarUrl ? (
                      <img 
                        src={perfil.avatarUrl} 
                        alt="Foto atual" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {perfil.nome?.charAt(0).toUpperCase() || '👤'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFoto}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploadingFoto ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {uploadingFoto ? 'Fazendo Upload...' : '📁 Escolher Nova Foto'}
                  </button>
                  
                  {perfil.avatarUrl && (
                    <button
                      onClick={removerFoto}
                      disabled={uploadingFoto}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      🗑️ Remover Foto
                    </button>
                  )}
                  
                  <button
                    onClick={() => setMostrarEditarFoto(false)}
                    className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
                
                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="hidden"
                />
                
                {/* Informações sobre upload */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <p className="font-medium mb-1">ℹ️ Informações sobre a foto:</p>
                  <ul className="space-y-1">
                    <li>• Formatos aceitos: JPG, PNG, GIF, WebP</li>
                    <li>• Tamanho máximo: 5MB</li>
                    <li>• Recomendado: imagem quadrada (1:1)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Transações</p>
                <p className="text-2xl font-bold text-gray-900">{perfil.estatisticas.totalTransacoes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-green-600">
                  {formatarMoeda(perfil.estatisticas.valorTotalMovimentado)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Metas</p>
                <p className="text-2xl font-bold text-gray-900">{perfil.estatisticas.totalMetas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{perfil.estatisticas.totalCategorias}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Configurações
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configurações de Exibição */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Exibição</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <select 
                    value={configuracoes.tema}
                    onChange={(e) => setConfiguracoes({...configuracoes, tema: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="claro">🌞 Claro</option>
                    <option value="escuro">🌙 Escuro</option>
                    <option value="automatico">🔄 Automático</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda Padrão
                  </label>
                  <select 
                    value={configuracoes.formatoMoeda}
                    onChange={(e) => setConfiguracoes({...configuracoes, formatoMoeda: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="BRL">🇧🇷 Real (R$)</option>
                    <option value="USD">🇺🇸 Dólar ($)</option>
                    <option value="EUR">🇪🇺 Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Página Inicial
                  </label>
                  <select 
                    value={configuracoes.paginaInicial}
                    onChange={(e) => setConfiguracoes({...configuracoes, paginaInicial: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="dashboard">📊 Dashboard</option>
                    <option value="transacoes">💳 Transações</option>
                    <option value="categorias">🏷️ Categorias</option>
                    <option value="metas">🎯 Metas</option>
                    <option value="relatorios">📈 Relatórios</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configurações de Segurança */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Segurança</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Confirmar Exclusões
                    </label>
                    <p className="text-xs text-gray-500">
                      Exibir confirmação ao excluir dados
                    </p>
                  </div>
                  <button
                    onClick={() => setConfiguracoes({...configuracoes, confirmarExclusoes: !configuracoes.confirmarExclusoes})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      configuracoes.confirmarExclusoes ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        configuracoes.confirmarExclusoes ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Mostrar Tooltips
                    </label>
                    <p className="text-xs text-gray-500">
                      Exibir dicas de ajuda na interface
                    </p>
                  </div>
                  <button
                    onClick={() => setConfiguracoes({...configuracoes, mostrarTooltips: !configuracoes.mostrarTooltips})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      configuracoes.mostrarTooltips ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        configuracoes.mostrarTooltips ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout de Sessão (minutos)
                  </label>
                  <select 
                    value={configuracoes.timeoutSessao}
                    onChange={(e) => setConfiguracoes({...configuracoes, timeoutSessao: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value={0}>🔓 Nunca</option>
                    <option value={15}>⏱️ 15 minutos</option>
                    <option value={30}>⏱️ 30 minutos</option>
                    <option value={60}>⏰ 1 hora</option>
                    <option value={120}>⏰ 2 horas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={salvarConfiguracoes}
              disabled={salvando}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {salvando ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </button>
            
            <button
              onClick={carregarPerfil}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              🔄 Recarregar
            </button>
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Zona de Perigo
          </h2>
          
          <div className="space-y-6">
            {/* Limpeza de Dados */}
            <div>
              <h3 className="text-lg font-medium text-red-700 mb-2">Limpar Dados</h3>
              <p className="text-sm text-red-600 mb-4">
                Remova dados específicos do seu histórico. Esta ação não pode ser desfeita.
              </p>
              
              {mostrarLimpeza ? (
                <div className="bg-white p-4 rounded border border-red-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(opcoes).map(([key, value]) => {
                      const labels = {
                        transacoes: '💳 Todas as Transações',
                        categorias: '🏷️ Todas as Categorias', 
                        metas: '🎯 Todas as Metas',
                        dividas: '👛 Todas as Dívidas',
                        todosOsDados: '⚠️ TODOS OS DADOS'
                      };
                      
                      return (
                        <label key={key} className="flex items-center space-x-2 p-2 hover:bg-red-50 rounded">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setOpcoes({...opcoes, [key]: e.target.checked})}
                            className="rounded border-red-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {labels[key as keyof typeof labels]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  
                  <div className="flex space-x-2 pt-3 border-t border-red-200">
                    <button
                      onClick={executarLimpeza}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!Object.values(opcoes).some(Boolean)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      ⚠️ Confirmar Limpeza
                    </button>
                    <button
                      onClick={() => setMostrarLimpeza(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setMostrarLimpeza(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  🗑️ Selecionar Dados para Limpar
                </button>
              )}
            </div>
            
            {/* Excluir Conta */}
            <div>
              <h3 className="text-lg font-medium text-red-700 mb-2">Excluir Conta</h3>
              <p className="text-sm text-red-600 mb-4">
                Remove permanentemente sua conta e todos os dados associados.
              </p>
              <button
                onClick={excluirConta}
                className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 flex items-center"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Excluir Conta Permanentemente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
