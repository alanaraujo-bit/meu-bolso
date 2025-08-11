'use client';

import { useState, useEffect } from 'react';

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  cor?: string;
  icone?: string;
}

interface SeletorCategoriaProps {
  categorias: Categoria[];
  categoriaSelecionada: string;
  onChange: (categoriaId: string) => void;
  tipo?: 'receita' | 'despesa' | 'ambos';
  placeholder?: string;
  onCategoriasCriadas?: (novasCategorias: Categoria[]) => void;
}

export default function SeletorCategoria({ 
  categorias, 
  categoriaSelecionada, 
  onChange, 
  tipo = 'ambos',
  placeholder = "Selecione uma categoria",
  onCategoriasCriadas 
}: SeletorCategoriaProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [tipoCategoria, setTipoCategoria] = useState<'receita' | 'despesa' | 'ambos'>(tipo);
  const [corCategoria, setCorCategoria] = useState('#6366F1');
  const [iconeCategoria, setIconeCategoria] = useState('📊');
  const [carregando, setCarregando] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Detectar tema do sistema
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Observer para mudanças de tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Filtrar categorias baseado no tipo
  const categoriasFiltradas = categorias.filter(cat => {
    if (tipo === 'ambos') return true;
    return cat.tipo === tipo || cat.tipo === 'ambos';
  });

  // Atualizar categoria selecionada quando o tipo muda
  useEffect(() => {
    if (categoriaSelecionada && categoriasFiltradas.length > 0) {
      const categoriaAtualValida = categoriasFiltradas.find(cat => cat.id === categoriaSelecionada);
      if (!categoriaAtualValida) {
        // Se a categoria atual não é válida para o novo tipo, limpar seleção
        onChange('');
      }
    }
  }, [tipo, categoriasFiltradas, categoriaSelecionada, onChange]);

  // Atualizar tipo da nova categoria quando o tipo do formulário muda
  useEffect(() => {
    if (tipo !== 'ambos') {
      setTipoCategoria(tipo);
    }
  }, [tipo]);

  // Cores sugeridas
  const coresSugeridas = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E'
  ];

  // Ícones sugeridos
  const iconesSugeridos = [
    '💰', '💵', '📈', '💸', '🏦', // Receitas
    '🛒', '🍕', '⛽', '🏠', '📱', // Despesas
    '📊', '💼', '🎯', '📋', '⭐', // Gerais
    '🎮', '🚗', '✈️', '🎬', '📚'  // Diversos
  ];

  const criarCategoria = async () => {
    if (!nomeCategoria.trim()) return;

    setCarregando(true);
    
    try {
      const response = await fetch('/api/categorias/criar-rapida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nomeCategoria.trim(),
          tipo: tipoCategoria,
          cor: corCategoria,
          icone: iconeCategoria
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Categoria criada com sucesso
        const novaCategoria = data.categoria;
        
        // Atualizar lista de categorias via callback
        if (onCategoriasCriadas) {
          onCategoriasCriadas([...categorias, novaCategoria]);
        }
        
        // Selecionar a nova categoria automaticamente
        onChange(novaCategoria.id);
        
        // Resetar formulário
        setNomeCategoria('');
        setTipoCategoria(tipo !== 'ambos' ? tipo : 'receita'); // Usar o tipo do contexto ou receita como padrão
        setCorCategoria('#6366F1');
        setIconeCategoria('📊');
        setMostrarFormulario(false);
        
        // Mostrar feedback de sucesso (opcional)
        console.log('✅ Categoria criada:', novaCategoria.nome);
      } else {
        console.error('❌ Erro ao criar categoria:', data.error);
        alert(data.error || 'Erro ao criar categoria');
      }
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      alert('Erro ao criar categoria. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const cancelarCriacao = () => {
    setNomeCategoria('');
    setTipoCategoria(tipo !== 'ambos' ? tipo : 'receita'); // Usar o tipo do contexto ou receita como padrão
    setCorCategoria('#6366F1');
    setIconeCategoria('📊');
    setMostrarFormulario(false);
  };

  return (
    <div className="space-y-3">
      {/* Seletor de categoria existente */}
      <select
        value={categoriaSelecionada}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 font-medium ${
          darkMode 
            ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 hover:bg-gray-700' 
            : 'bg-white/70 border-gray-300 text-gray-900 hover:border-gray-400'
        } ${mostrarFormulario ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={mostrarFormulario}
      >
        <option value="">{placeholder}</option>
        {categoriasFiltradas.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.icone} {categoria.nome}
          </option>
        ))}
      </select>

      {/* Botão para criar nova categoria */}
      {!mostrarFormulario && (
        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            darkMode 
              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30' 
              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <span className="text-lg">➕</span>
          Criar nova categoria
        </button>
      )}

      {/* Formulário de criação rápida */}
      {mostrarFormulario && (
        <div className={`p-6 rounded-2xl border space-y-4 transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700/50' 
            : 'bg-white/90 backdrop-blur-sm border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-lg font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ➕ Criar Nova Categoria
            </h4>
            <button
              type="button"
              onClick={cancelarCriacao}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Nome da categoria */}
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              💼 Nome da categoria
            </label>
            <input
              type="text"
              value={nomeCategoria}
              onChange={(e) => setNomeCategoria(e.target.value)}
              placeholder="Ex: Alimentação, Salário, etc."
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:scale-[1.02] ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                  : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
              maxLength={50}
            />
          </div>

          {/* Tipo da categoria */}
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              🏷️ Tipo
            </label>
            <select
              value={tipoCategoria}
              onChange={(e) => setTipoCategoria(e.target.value as 'receita' | 'despesa' | 'ambos')}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:scale-[1.02] ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                  : 'bg-white/80 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            >
              <option value="receita">💰 Receita</option>
              <option value="despesa">💸 Despesa</option>
              <option value="ambos">🔄 Ambos</option>
            </select>
          </div>

          {/* Seleção de cor */}
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              🎨 Cor
            </label>
            <div className="flex flex-wrap gap-3">
              {coresSugeridas.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setCorCategoria(cor)}
                  className={`w-10 h-10 rounded-xl border-3 transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none ${
                    corCategoria === cor 
                      ? 'border-white shadow-lg ring-2 ring-emerald-400' 
                      : darkMode 
                        ? 'border-gray-600 hover:border-gray-400' 
                        : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          {/* Seleção de ícone */}
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              😀 Ícone
            </label>
            <div className="flex flex-wrap gap-2">
              {iconesSugeridos.map((icone) => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setIconeCategoria(icone)}
                  className={`w-10 h-10 text-lg border-2 rounded-xl transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none ${
                    iconeCategoria === icone 
                      ? darkMode 
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400' 
                        : 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : darkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700/50' 
                        : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {icone}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-700/30 border-gray-600' 
              : 'bg-gray-50/50 border-gray-300'
          }`}>
            <span className="text-2xl" style={{ color: corCategoria }}>{iconeCategoria}</span>
            <div className="flex-1">
              <span className={`text-sm font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {nomeCategoria || 'Nome da categoria'}
              </span>
              <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
                tipoCategoria === 'receita' 
                  ? darkMode 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-green-100 text-green-700'
                  : tipoCategoria === 'despesa'
                    ? darkMode 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-red-100 text-red-700'
                    : darkMode 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-blue-100 text-blue-700'
              }`}>
                {tipoCategoria === 'receita' ? '💰' : tipoCategoria === 'despesa' ? '💸' : '🔄'} {tipoCategoria}
              </span>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={criarCategoria}
              disabled={!nomeCategoria.trim() || carregando}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none disabled:scale-100 disabled:cursor-not-allowed ${
                !nomeCategoria.trim() || carregando
                  ? darkMode 
                    ? 'bg-gray-700 text-gray-500 border border-gray-600' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700'
              }`}
            >
              <span className="text-lg">✨</span>
              {carregando ? 'Criando...' : 'Criar Categoria'}
            </button>
            <button
              type="button"
              onClick={cancelarCriacao}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none ${
                darkMode 
                  ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
