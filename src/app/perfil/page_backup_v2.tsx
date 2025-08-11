"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, Settings, Shield, Trash2, Download, Calendar, 
  BarChart3, Target, CreditCard, TrendingUp, Clock,
  AlertTriangle, CheckCircle, Save, Loader, Camera,
  Upload, X, Edit3, Sun, Moon
} from 'lucide-react';
import { PerfilUsuario, ConfiguracoesUsuario, OpcoesLimpeza, CONFIGURACOES_PADRAO } from '@/types/perfil';
import { formatDataBrasileiraExibicao, formatDataHoraBrasileiraExibicao } from '@/lib/dateUtils';
import HelpButton from '@/components/HelpButton';

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
  const [darkMode, setDarkMode] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error' | 'info'>('info');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [opcoes, setOpcoes] = useState<OpcoesLimpeza>({
    transacoes: false,
    categorias: false,
    metas: false,
    dividas: false,
    todosOsDados: false
  });

  // Detectar tema do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Observer para mudanças de tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
        setConfiguracoes(dados.configuracoes || CONFIGURACOES_PADRAO);
      } else {
        console.error('❌ Erro ao carregar perfil:', response.statusText);
        setMensagem('Erro ao carregar dados do perfil');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      setMensagem('Erro ao carregar dados do perfil');
      setTipoMensagem('error');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setSalvando(true);
    try {
      const response = await fetch('/api/usuario/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracoes)
      });

      if (response.ok) {
        setMensagem('Configurações salvas com sucesso!');
        setTipoMensagem('success');
      } else {
        setMensagem('Erro ao salvar configurações');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMensagem('Erro ao salvar configurações');
      setTipoMensagem('error');
    } finally {
      setSalvando(false);
    }
  };

  const limparDados = async () => {
    if (!confirm('Tem certeza que deseja limpar os dados selecionados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch('/api/usuario/limpar-dados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opcoes)
      });

      if (response.ok) {
        setMensagem('Dados limpos com sucesso!');
        setTipoMensagem('success');
        setMostrarLimpeza(false);
        setOpcoes({
          transacoes: false,
          categorias: false,
          metas: false,
          dividas: false,
          todosOsDados: false
        });
      } else {
        setMensagem('Erro ao limpar dados');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      setMensagem('Erro ao limpar dados');
      setTipoMensagem('error');
    }
  };

  const excluirConta = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá excluir permanentemente sua conta e todos os seus dados. Esta ação NÃO PODE ser desfeita. Tem certeza absoluta?')) {
      return;
    }

    try {
      const response = await fetch('/api/usuario/excluir-conta', {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/login?mensagem=Conta excluída com sucesso');
      } else {
        setMensagem('Erro ao excluir conta');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setMensagem('Erro ao excluir conta');
      setTipoMensagem('error');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      setMensagem('Por favor, selecione apenas arquivos de imagem');
      setTipoMensagem('error');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMensagem('A imagem deve ter no máximo 5MB');
      setTipoMensagem('error');
      return;
    }

    setUploadingFoto(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (perfil) {
          setPerfil({ ...perfil, avatarUrl: result.avatarUrl });
        }
        setMensagem('Foto atualizada com sucesso!');
        setTipoMensagem('success');
        setMostrarEditarFoto(false);
      } else {
        setMensagem('Erro ao fazer upload da foto');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setMensagem('Erro ao fazer upload da foto');
      setTipoMensagem('error');
    } finally {
      setUploadingFoto(false);
    }
  };

  const removerFoto = async () => {
    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'DELETE'
      });

      if (response.ok) {
        if (perfil) {
          setPerfil({ ...perfil, avatarUrl: undefined });
        }
        setMensagem('Foto removida com sucesso!');
        setTipoMensagem('success');
        setMostrarEditarFoto(false);
      } else {
        setMensagem('Erro ao remover foto');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      setMensagem('Erro ao remover foto');
      setTipoMensagem('error');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
          : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    } relative overflow-hidden`}>
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          darkMode ? 'bg-emerald-500' : 'bg-emerald-300'
        }`}></div>
        <div className={`absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          darkMode ? 'bg-cyan-500' : 'bg-cyan-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 ${
          darkMode ? 'bg-teal-500' : 'bg-teal-300'
        }`}></div>
      </div>

      {/* Botão Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-3 rounded-full transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 hover:bg-gray-700/80 text-amber-400 hover:text-amber-300' 
            : 'bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900'
        } backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-110`}
        aria-label="Toggle dark mode"
      >
        <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
      </button>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <HelpButton 
          title="Perfil do Usuário"
          steps={[
            {
              title: "👤 Perfil",
              content: "Gerencie suas informações pessoais, configurações e dados da conta."
            },
            {
              title: "⚙️ Como usar",
              content: "• Atualize sua foto de perfil\n• Configure preferências\n• Gerencie dados da conta\n• Faça limpeza seletiva de dados"
            }
          ]}
        />
      </div>

      {/* Container principal */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header com glassmorphism */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border mb-8 overflow-hidden ${
          darkMode 
            ? 'bg-gray-800/40 border-gray-700/50' 
            : 'bg-white/40 border-white/50'
        }`}>
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 relative overflow-hidden">
            {/* Decorações de fundo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-16 -translate-x-16"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-3xl">👤</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    🛠️ Meu Perfil
                  </h1>
                  <p className="text-white/90 text-lg font-medium">
                    Gerencie suas informações e configurações
                  </p>
                </div>
              </div>
              
              {/* Informações do usuário */}
              {perfil && (
                <div className="text-right">
                  <div className="text-white/90 text-sm font-medium">
                    Membro desde: {formatDataBrasileiraExibicao(perfil.criadoEm)}
                  </div>
                  <div className="text-white/80 text-xs">
                    Última atualização: {formatDataHoraBrasileiraExibicao(perfil.atualizadoEm)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${
            tipoMensagem === 'error'
              ? darkMode
                ? 'bg-red-900/20 border-red-500/30 text-red-400'
                : 'bg-red-50 border-red-200 text-red-700'
              : tipoMensagem === 'success'
                ? darkMode
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
                : darkMode
                  ? 'bg-blue-900/20 border-blue-500/30 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{mensagem}</span>
              <button 
                onClick={() => setMensagem('')}
                className="text-lg hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Cards do perfil */}
        <div className="grid gap-8">
          
          {/* Card de Informações Pessoais */}
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border p-6 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}>
                <User className={`w-6 h-6 ${
                  darkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Informações Pessoais
              </h2>
            </div>

            {perfil && (
              <div className="space-y-6">
                {/* Foto do perfil */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      {perfil.avatarUrl ? (
                        <img 
                          src={perfil.avatarUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <button
                      onClick={() => setMostrarEditarFoto(true)}
                      className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className={`block text-sm font-semibold mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Nome
                      </label>
                      <div className={`p-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white' 
                          : 'bg-white/60 border-gray-200 text-gray-900'
                      }`}>
                        {perfil.nome || 'Não informado'}
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-semibold mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Email
                      </label>
                      <div className={`p-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white' 
                          : 'bg-white/60 border-gray-200 text-gray-900'
                      }`}>
                        {perfil.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card de Configurações */}
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border p-6 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Settings className={`w-6 h-6 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Configurações
              </h2>
            </div>

            <div className="space-y-6">
              {/* Configuração de tema */}
              <div className="space-y-4">
                <h3 className={`font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  🎨 Tema e Aparência
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={configuracoes.mostrarTooltips}
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes,
                        mostrarTooltips: e.target.checked
                      })}
                      className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Mostrar dicas de ajuda
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={configuracoes.confirmarExclusoes}
                      onChange={(e) => setConfiguracoes({
                        ...configuracoes,
                        confirmarExclusoes: e.target.checked
                      })}
                      className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Confirmar antes de excluir itens
                    </span>
                  </label>
                </div>
              </div>

              {/* Configuração de página inicial */}
              <div className="space-y-4">
                <h3 className={`font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  🏠 Página Inicial
                </h3>
                
                <select
                  value={configuracoes.paginaInicial}
                  onChange={(e) => setConfiguracoes({
                    ...configuracoes,
                    paginaInicial: e.target.value as any
                  })}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all font-medium ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-emerald-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
                  } focus:ring-4 focus:ring-emerald-500/20`}
                >
                  <option value="dashboard">📊 Dashboard</option>
                  <option value="transacoes">💳 Transações</option>
                  <option value="relatorios">📈 Relatórios</option>
                  <option value="metas">🎯 Metas</option>
                </select>
              </div>

              {/* Botão salvar */}
              <button
                onClick={salvarConfiguracoes}
                disabled={salvando}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {salvando ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card de Gerenciamento de Dados */}
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border p-6 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${
                darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <Shield className={`w-6 h-6 ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Gerenciamento de Dados
              </h2>
            </div>

            <div className="space-y-6">
              {/* Estatísticas da conta */}
              {perfil && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl border text-center ${
                    darkMode 
                      ? 'bg-gray-700/30 border-gray-600/30' 
                      : 'bg-white/60 border-white/60'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      {perfil.estatisticas?.totalTransacoes || 0}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Transações
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border text-center ${
                    darkMode 
                      ? 'bg-gray-700/30 border-gray-600/30' 
                      : 'bg-white/60 border-white/60'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {perfil.estatisticas?.totalCategorias || 0}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Categorias
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border text-center ${
                    darkMode 
                      ? 'bg-gray-700/30 border-gray-600/30' 
                      : 'bg-white/60 border-white/60'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {perfil.estatisticas?.totalMetas || 0}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Metas
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border text-center ${
                    darkMode 
                      ? 'bg-gray-700/30 border-gray-600/30' 
                      : 'bg-white/60 border-white/60'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      {perfil.estatisticas?.totalDividas || 0}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Dívidas
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setMostrarLimpeza(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                    darkMode 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                  Limpar Dados
                </button>
                
                <button
                  onClick={() => setMostrarExclusao(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                    darkMode 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Editar Foto */}
        {mostrarEditarFoto && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Editar Foto do Perfil
                  </h3>
                  <button
                    onClick={() => setMostrarEditarFoto(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className={`w-5 h-5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFoto}
                    className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-emerald-600" />
                    <div className="text-left">
                      <div className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {uploadingFoto ? 'Enviando...' : 'Carregar nova foto'}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        PNG, JPG até 5MB
                      </div>
                    </div>
                  </button>

                  {perfil?.avatarUrl && (
                    <button
                      onClick={removerFoto}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold transition-all duration-200 ${
                        darkMode 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                      Remover foto atual
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de Limpeza de Dados */}
        {mostrarLimpeza && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Limpar Dados
                  </h3>
                </div>

                <div className="space-y-4 mb-6">
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Selecione quais dados deseja limpar:
                  </p>

                  <div className="space-y-3">
                    {[
                      { key: 'transacoes', label: 'Transações', icon: '💳' },
                      { key: 'categorias', label: 'Categorias', icon: '🏷️' },
                      { key: 'metas', label: 'Metas', icon: '🎯' },
                      { key: 'dividas', label: 'Dívidas', icon: '💸' },
                      { key: 'todosOsDados', label: 'Todos os dados', icon: '🗑️' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={opcoes[item.key as keyof OpcoesLimpeza]}
                          onChange={(e) => setOpcoes({
                            ...opcoes,
                            [item.key]: e.target.checked
                          })}
                          className="w-5 h-5 text-yellow-600 border-2 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className={`flex items-center gap-2 text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <span>{item.icon}</span>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarLimpeza(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={limparDados}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exclusão de Conta */}
        {mostrarExclusao && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-2xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${
                    darkMode ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Excluir Conta
                  </h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div className={`p-4 rounded-xl border-2 ${
                    darkMode 
                      ? 'bg-red-900/20 border-red-500/30' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      darkMode ? 'text-red-400' : 'text-red-700'
                    }`}>
                      ⚠️ ATENÇÃO: Esta ação é irreversível!
                    </p>
                    <p className={`text-sm mt-2 ${
                      darkMode ? 'text-red-300' : 'text-red-600'
                    }`}>
                      Todos os seus dados serão permanentemente excluídos:
                    </p>
                    <ul className={`text-sm mt-2 space-y-1 ${
                      darkMode ? 'text-red-300' : 'text-red-600'
                    }`}>
                      <li>• Transações e histórico financeiro</li>
                      <li>• Metas e objetivos</li>
                      <li>• Categorias personalizadas</li>
                      <li>• Configurações e preferências</li>
                      <li>• Dados da conta</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarExclusao(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={excluirConta}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Excluir Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
