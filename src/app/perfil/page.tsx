"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, Settings, Shield, Trash2, Download, Calendar, 
  BarChart3, Target, CreditCard, TrendingUp, Clock,
  AlertTriangle, CheckCircle, Save, Loader, Camera,
  Upload, X, Edit3, Sun, Moon, Eye, EyeOff, 
  Palette, Bell, Lock, Globe, Smartphone
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
      setLoading(true);
      const response = await fetch('/api/usuario/perfil');
      
      if (response.ok) {
        const dados = await response.json();
        setPerfil(dados.perfil);
        setConfiguracoes(dados.configuracoes || CONFIGURACOES_PADRAO);
      } else {
        setMensagem('Erro ao carregar dados do perfil');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setMensagem('Erro ao carregar perfil');
      setTipoMensagem('error');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      setSalvando(true);
      const response = await fetch('/api/usuario/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracoes)
      });

      if (response.ok) {
        setMensagem('Configurações salvas com sucesso!');
        setTipoMensagem('success');
        setTimeout(() => setMensagem(''), 3000);
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

  // Função auxiliar para comprimir imagem
  const comprimirImagem = (file: File, qualidade: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Redimensionar se necessário (máximo 300x300)
        const maxSize = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar e comprimir
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', qualidade);
        resolve(base64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMensagem('Arquivo muito grande. Máximo 5MB.');
      setTipoMensagem('error');
      return;
    }

    try {
      setUploadingFoto(true);
      
      // Comprimir a imagem para base64
      const avatarUrl = await comprimirImagem(file, 0.7);

      const response = await fetch('/api/usuario/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setPerfil(prev => prev ? { ...prev, avatarUrl } : null);
        setMensagem('Foto atualizada com sucesso!');
        setTipoMensagem('success');
        setMostrarEditarFoto(false);
        setTimeout(() => setMensagem(''), 3000);
      } else {
        const error = await response.json();
        setMensagem(error.error || 'Erro ao fazer upload da foto');
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
      setUploadingFoto(true);
      const response = await fetch('/api/usuario/avatar', {
        method: 'DELETE'
      });

      if (response.ok) {
        setPerfil(prev => prev ? { ...prev, avatarUrl: undefined } : null);
        setMensagem('Foto removida com sucesso!');
        setTipoMensagem('success');
        setMostrarEditarFoto(false);
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao remover foto');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      setMensagem('Erro ao remover foto');
      setTipoMensagem('error');
    } finally {
      setUploadingFoto(false);
    }
  };

  const exportarDados = async () => {
    try {
      const response = await fetch('/api/usuario/exportar');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meu-bolso-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setMensagem('Dados exportados com sucesso!');
        setTipoMensagem('success');
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao exportar dados');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      setMensagem('Erro ao exportar dados');
      setTipoMensagem('error');
    }
  };

  const excluirConta = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch('/api/usuario/excluir-conta', {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/login');
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

  const limparDados = async () => {
    if (!confirm('Tem certeza que deseja limpar os dados selecionados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setSalvando(true);
      const response = await fetch('/api/usuario/limpar-dados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opcoes)
      });

      if (response.ok) {
        const result = await response.json();
        setMensagem(`Dados limpos com sucesso! ${result.resultados?.join(', ') || ''}`);
        setTipoMensagem('success');
        setMostrarLimpeza(false);
        // Recarregar o perfil para atualizar as estatísticas
        await carregarPerfil();
        setTimeout(() => setMensagem(''), 5000);
      } else {
        const error = await response.json();
        setMensagem(error.message || 'Erro ao limpar dados');
        setTipoMensagem('error');
      }
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      setMensagem('Erro ao limpar dados');
      setTipoMensagem('error');
    } finally {
      setSalvando(false);
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
          title="Perfil"
          steps={[
            {
              title: "👤 Perfil",
              content: "Gerencie suas informações pessoais, configurações e dados da conta."
            },
            {
              title: "⚙️ Como usar",
              content: "• Altere foto do perfil\n• Configure preferências\n• Exporte seus dados\n• Gerencie segurança da conta"
            }
          ]}
        />
      </div>

      {/* Container principal */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header do Perfil */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl border mb-8 overflow-hidden ${
          darkMode 
            ? 'bg-gray-800/40 border-gray-700/50' 
            : 'bg-white/40 border-white/50'
        }`}>
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 relative overflow-hidden">
            {/* Decorações de fundo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white/20 border-4 border-white/30 backdrop-blur-sm">
                  {perfil?.avatarUrl ? (
                    <img 
                      src={perfil.avatarUrl} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setMostrarEditarFoto(true)}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Informações do usuário */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                  {perfil?.nome || session?.user?.name || 'Usuário'}
                </h1>
                <p className="text-white/90 text-lg font-medium mb-1">
                  {session?.user?.email}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Membro desde {perfil?.criadoEm ? formatDataBrasileiraExibicao(perfil.criadoEm) : 'hoje'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Último acesso: {perfil?.ultimaAtividade ? formatDataHoraBrasileiraExibicao(perfil.ultimaAtividade) : 'agora'}
                  </span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">{perfil?.estatisticas?.totalTransacoes || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Transações</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">{perfil?.estatisticas?.totalCategorias || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Categorias</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">{perfil?.estatisticas?.totalMetas || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Metas</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white">{perfil?.estatisticas?.totalDividas || 0}</div>
                  <div className="text-white/90 text-sm font-medium">Dívidas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de feedback */}
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

        {/* Grid de Configurações */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Seção Configurações */}
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border p-6 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Settings className="text-emerald-500" />
              ⚙️ Configurações
            </h2>

            <div className="space-y-6">
              {/* Exibição */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  🎨 Exibição
                </h3>
                
                <div className="space-y-4">
                  {/* Tema */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Tema
                      </label>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Escolha entre claro/escuro ou automático
                      </p>
                    </div>
                    <select
                      value={configuracoes.tema}
                      onChange={(e) => setConfiguracoes(prev => ({ ...prev, tema: e.target.value as any }))}
                      className={`px-3 py-2 border rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      <option value="automatico">🔄 Automático</option>
                      <option value="claro">☀️ Claro</option>
                      <option value="escuro">🌙 Escuro</option>
                    </select>
                  </div>

                  {/* Moeda */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Moeda Padrão
                      </label>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Formato de exibição dos valores
                      </p>
                    </div>
                    <select
                      value={configuracoes.formatoMoeda || 'BRL'}
                      onChange={(e) => setConfiguracoes(prev => ({ ...prev, formatoMoeda: e.target.value as any }))}
                      className={`px-3 py-2 border rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      <option value="BRL">💰 Real (R$)</option>
                      <option value="USD">💵 Dólar ($)</option>
                      <option value="EUR">💶 Euro (€)</option>
                    </select>
                  </div>

                  {/* Página Inicial */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Página Inicial
                      </label>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Para onde ir após o login
                      </p>
                    </div>
                    <select
                      value={configuracoes.paginaInicial}
                      onChange={(e) => setConfiguracoes(prev => ({ ...prev, paginaInicial: e.target.value as any }))}
                      className={`px-3 py-2 border rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      <option value="dashboard">🏠 Dashboard</option>
                      <option value="transacoes">💰 Transações</option>
                      <option value="relatorios">📊 Relatórios</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  🔒 Segurança
                </h3>
                
                <div className="space-y-4">
                  {/* Confirmar Exclusões */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Confirmar Exclusões
                      </label>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Pedir confirmação ao excluir dados
                      </p>
                    </div>
                    <button
                      onClick={() => setConfiguracoes(prev => ({ 
                        ...prev, 
                        confirmarExclusoes: !prev.confirmarExclusoes 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        configuracoes.confirmarExclusoes 
                          ? 'bg-emerald-600' 
                          : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          configuracoes.confirmarExclusoes ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Mostrar Tooltips */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Mostrar Tooltips
                      </label>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Exibir dicas de ajuda na interface
                      </p>
                    </div>
                    <button
                      onClick={() => setConfiguracoes(prev => ({ 
                        ...prev, 
                        mostrarTooltips: !prev.mostrarTooltips 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        configuracoes.mostrarTooltips 
                          ? 'bg-emerald-600' 
                          : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          configuracoes.mostrarTooltips ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Timeout de Sessão */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Timeout de Sessão
                      </label>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Tempo para logout automático
                      </p>
                    </div>
                    <select
                      value={configuracoes.timeoutSessao}
                      onChange={(e) => setConfiguracoes(prev => ({ ...prev, timeoutSessao: parseInt(e.target.value) }))}
                      className={`px-3 py-2 border rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      <option value={30}>⏰ 30 minutos</option>
                      <option value={60}>🕐 1 hora</option>
                      <option value={120}>🕑 2 horas</option>
                      <option value={240}>🕓 4 horas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="pt-4">
                <button
                  onClick={salvarConfiguracoes}
                  disabled={salvando}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {salvando ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      💾 Salvar Configurações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Seção Zona de Perigo */}
          <div className={`backdrop-blur-xl rounded-2xl shadow-xl border p-6 ${
            darkMode 
              ? 'bg-gray-800/40 border-gray-700/50' 
              : 'bg-white/40 border-white/50'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Shield className="text-red-500" />
              ⚠️ Zona de Perigo
            </h2>

            <div className="space-y-6">
              {/* Exportar Dados */}
              <div className={`p-4 rounded-lg border ${
                darkMode 
                  ? 'bg-blue-900/20 border-blue-500/30' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  darkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  📦 Exportar Dados
                </h3>
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Baixe um backup completo de todos os seus dados
                </p>
                <button
                  onClick={exportarDados}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } flex items-center justify-center gap-2`}
                >
                  <Download size={16} />
                  Exportar Dados
                </button>
              </div>

              {/* Limpar Dados */}
              <div className={`p-4 rounded-lg border ${
                darkMode 
                  ? 'bg-orange-900/20 border-orange-500/30' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  darkMode ? 'text-orange-300' : 'text-orange-800'
                }`}>
                  🗑️ Limpar Dados
                </h3>
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  Remove dados específicos do seu histórico. Esta ação não pode ser desfeita.
                </p>
                <button
                  onClick={() => setMostrarLimpeza(true)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  } flex items-center justify-center gap-2`}
                >
                  <Trash2 size={16} />
                  Selecionar Dados para Limpar
                </button>
              </div>

              {/* Excluir Conta */}
              <div className={`p-4 rounded-lg border ${
                darkMode 
                  ? 'bg-red-900/20 border-red-500/30' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  darkMode ? 'text-red-300' : 'text-red-800'
                }`}>
                  🚨 Excluir Conta
                </h3>
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  Remove permanentemente sua conta e todos os dados associados
                </p>
                <button
                  onClick={() => setMostrarExclusao(true)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } flex items-center justify-center gap-2`}
                >
                  <AlertTriangle size={16} />
                  Excluir Conta Permanentemente
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
            <div className={`rounded-3xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    📸 Editar Foto do Perfil
                  </h3>
                  <button
                    onClick={() => setMostrarEditarFoto(false)}
                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFoto}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadingFoto ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Escolher Nova Foto
                      </>
                    )}
                  </button>

                  {perfil?.avatarUrl && (
                    <button
                      onClick={removerFoto}
                      disabled={uploadingFoto}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        darkMode 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <Trash2 size={20} />
                      Remover Foto
                    </button>
                  )}

                  <p className={`text-sm text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Formatos aceitos: JPG, PNG, GIF<br />
                    Tamanho máximo: 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {mostrarExclusao && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Excluir Conta Permanentemente
                  </h3>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={excluirConta}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={20} />
                    Sim, Excluir Permanentemente
                  </button>
                  
                  <button
                    onClick={() => setMostrarExclusao(false)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Limpeza de Dados */}
        {mostrarLimpeza && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    🗑️ Limpar Dados
                  </h3>
                  <button
                    onClick={() => setMostrarLimpeza(false)}
                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Selecione quais dados deseja remover permanentemente:
                  </p>

                  {/* Opções de limpeza */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.transacoes}
                        onChange={(e) => setOpcoes({...opcoes, transacoes: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as transações
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.categorias}
                        onChange={(e) => setOpcoes({...opcoes, categorias: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as categorias
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.metas}
                        onChange={(e) => setOpcoes({...opcoes, metas: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as metas
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.dividas}
                        onChange={(e) => setOpcoes({...opcoes, dividas: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as dívidas
                      </span>
                    </label>

                    <div className={`border-t pt-3 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opcoes.todosOsDados}
                          onChange={(e) => setOpcoes({...opcoes, todosOsDados: e.target.checked})}
                          className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <span className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Todos os dados (reset completo)
                        </span>
                      </label>
                    </div>
                  </div>

                  {(opcoes.transacoes || opcoes.categorias || opcoes.metas || opcoes.dividas || opcoes.todosOsDados) && (
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-orange-900/20 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <p className={`text-sm ${
                        darkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        ⚠️ Esta ação não pode ser desfeita! Considere fazer um backup antes.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={limparDados}
                    disabled={salvando || (!opcoes.transacoes && !opcoes.categorias && !opcoes.metas && !opcoes.dividas && !opcoes.todosOsDados)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {salvando ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Limpando...
                      </>
                    ) : (
                      <>
                        <Trash2 size={20} />
                        Limpar Dados Selecionados
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setMostrarLimpeza(false)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Limpeza de Dados */}
        {mostrarLimpeza && (
          <div className={`fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 ${
            darkMode ? 'bg-black/80' : 'bg-black/70'
          }`}>
            <div className={`rounded-3xl shadow-2xl max-w-md w-full transform transition-all ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    🗑️ Limpar Dados
                  </h3>
                  <button
                    onClick={() => setMostrarLimpeza(false)}
                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Selecione quais dados você deseja remover permanentemente:
                  </p>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.transacoes}
                        onChange={(e) => setOpcoes(prev => ({ ...prev, transacoes: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as transações
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.categorias}
                        onChange={(e) => setOpcoes(prev => ({ ...prev, categorias: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as categorias
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.metas}
                        onChange={(e) => setOpcoes(prev => ({ ...prev, metas: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as metas
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opcoes.dividas}
                        onChange={(e) => setOpcoes(prev => ({ ...prev, dividas: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Todas as dívidas
                      </span>
                    </label>

                    <div className="border-t pt-3 mt-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opcoes.todosOsDados}
                          onChange={(e) => setOpcoes(prev => ({ 
                            ...prev, 
                            todosOsDados: e.target.checked,
                            ...(e.target.checked ? {
                              transacoes: true,
                              categorias: true,
                              metas: true,
                              dividas: true
                            } : {})
                          }))}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Todos os dados (irreversível)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <button
                      onClick={limparDados}
                      disabled={salvando || (!opcoes.transacoes && !opcoes.categorias && !opcoes.metas && !opcoes.dividas && !opcoes.todosOsDados)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {salvando ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Limpando...
                        </>
                      ) : (
                        <>
                          <Trash2 size={20} />
                          Limpar Dados Selecionados
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setMostrarLimpeza(false)}
                      disabled={salvando}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
