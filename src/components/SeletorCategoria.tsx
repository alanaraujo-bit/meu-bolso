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
    <div className="space-y-2">
      {/* Seletor de categoria existente */}
      <select
        value={categoriaSelecionada}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
        disabled={mostrarFormulario}
        style={{ 
          color: '#1f2937',
          backgroundColor: '#ffffff'
        }}
      >
        <option value="" style={{ color: '#6b7280' }}>{placeholder}</option>
        {categoriasFiltradas.map((categoria) => (
          <option 
            key={categoria.id} 
            value={categoria.id}
            style={{ 
              color: '#1f2937',
              backgroundColor: '#ffffff',
              fontWeight: '500'
            }}
          >
            {categoria.icone} {categoria.nome}
          </option>
        ))}
      </select>

      {/* Botão para criar nova categoria */}
      {!mostrarFormulario && (
        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        >
          <span className="text-lg">➕</span>
          Criar nova categoria
        </button>
      )}

      {/* Formulário de criação rápida */}
      {mostrarFormulario && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Criar Nova Categoria</h4>
            <button
              type="button"
              onClick={cancelarCriacao}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Nome da categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da categoria
            </label>
            <input
              type="text"
              value={nomeCategoria}
              onChange={(e) => setNomeCategoria(e.target.value)}
              placeholder="Ex: Alimentação, Salário, etc."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium text-gray-900 placeholder-gray-600"
              maxLength={50}
            />
          </div>

          {/* Tipo da categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={tipoCategoria}
              onChange={(e) => setTipoCategoria(e.target.value as 'receita' | 'despesa' | 'ambos')}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium text-gray-900"
              style={{ 
                color: '#1f2937',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="receita" style={{ color: '#1f2937', fontWeight: '500' }}>Receita</option>
              <option value="despesa" style={{ color: '#1f2937', fontWeight: '500' }}>Despesa</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          {/* Seleção de cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor
            </label>
            <div className="flex flex-wrap gap-2">
              {coresSugeridas.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setCorCategoria(cor)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    corCategoria === cor ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          {/* Seleção de ícone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="flex flex-wrap gap-2">
              {iconesSugeridos.map((icone) => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setIconeCategoria(icone)}
                  className={`w-8 h-8 text-lg border-2 rounded ${
                    iconeCategoria === icone 
                      ? 'border-gray-900 bg-gray-100' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {icone}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-2 bg-white rounded border">
            <span style={{ color: corCategoria }}>{iconeCategoria}</span>
            <span className="text-sm">
              {nomeCategoria || 'Nome da categoria'} 
              <span className="text-gray-500 ml-1">({tipoCategoria})</span>
            </span>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={criarCategoria}
              disabled={!nomeCategoria.trim() || carregando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">✓</span>
              {carregando ? 'Criando...' : 'Criar Categoria'}
            </button>
            <button
              type="button"
              onClick={cancelarCriacao}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
