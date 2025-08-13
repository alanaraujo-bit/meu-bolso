import React, { useState, useEffect } from 'react';
import { 
  Brain,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  Lightbulb,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Sparkles,
  Gift,
  BookOpen,
  Settings,
  Star,
  Trophy,
  Handshake,
  MessageCircle
} from 'lucide-react';

interface InsightInteligenteProps {
  insight: {
    tipo: string;
    categoria?: string;
    titulo: string;
    descricao: string;
    recomendacao?: string;
    metricas?: string;
    icone: string;
    prioridade?: string;
  };
}

// Mapear tipos para componentes visuais mais amigáveis
const getInsightStyle = (tipo: string, prioridade?: string) => {
  const baseStyles = "backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:scale-[1.02] border";
  
  switch (tipo) {
    case 'sucesso':
    case 'celebracao':
    case 'conquista':
      return `${baseStyles} bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-300 dark:border-emerald-600 hover:border-emerald-400`;
    
    case 'motivacao':
    case 'apoio':
      return `${baseStyles} bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-600 hover:border-blue-400`;
    
    case 'alerta':
    case 'erro':
      return `${baseStyles} bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-600 hover:border-red-400`;
    
    case 'dica':
    case 'educacao':
    case 'oportunidade':
      return `${baseStyles} bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-600 hover:border-amber-400`;
    
    case 'planejamento':
    case 'preparacao':
      return `${baseStyles} bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-300 dark:border-purple-600 hover:border-purple-400`;
    
    case 'info':
    default:
      return `${baseStyles} bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-300 dark:border-slate-600 hover:border-slate-400`;
  }
};

const getInsightIcon = (tipo: string) => {
  switch (tipo) {
    case 'sucesso':
      return <CheckCircle className="w-8 h-8 text-emerald-600" />;
    case 'celebracao':
      return <Trophy className="w-8 h-8 text-amber-600" />;
    case 'conquista':
      return <Award className="w-8 h-8 text-emerald-600" />;
    case 'motivacao':
      return <Star className="w-8 h-8 text-blue-600" />;
    case 'apoio':
      return <Handshake className="w-8 h-8 text-blue-600" />;
    case 'alerta':
      return <AlertTriangle className="w-8 h-8 text-orange-600" />;
    case 'erro':
      return <AlertTriangle className="w-8 h-8 text-red-600" />;
    case 'dica':
      return <Lightbulb className="w-8 h-8 text-amber-600" />;
    case 'educacao':
      return <BookOpen className="w-8 h-8 text-amber-600" />;
    case 'oportunidade':
      return <Target className="w-8 h-8 text-amber-600" />;
    case 'planejamento':
      return <Settings className="w-8 h-8 text-purple-600" />;
    case 'preparacao':
      return <Shield className="w-8 h-8 text-purple-600" />;
    case 'info':
    default:
      return <Info className="w-8 h-8 text-slate-600" />;
  }
};

const getTipoDisplayName = (tipo: string) => {
  switch (tipo) {
    case 'sucesso': return 'Parabéns! 🎉';
    case 'celebracao': return 'Conquista! 🏆';
    case 'motivacao': return 'Motivação 💪';
    case 'apoio': return 'Estou aqui por você 🤝';
    case 'alerta': return 'Atenção 👀';
    case 'erro': return 'Precisa de ação 🚨';
    case 'dica': return 'Dica amiga 💡';
    case 'educacao': return 'Aprendizado 📚';
    case 'oportunidade': return 'Oportunidade 🎯';
    case 'planejamento': return 'Planejamento 📋';
    case 'preparacao': return 'Preparação 🛡️';
    case 'info': return 'Informação 📊';
    default: return 'Insight 🧠';
  }
};

const getPrioridadeStyle = (prioridade?: string) => {
  switch (prioridade) {
    case 'critica':
      return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
    case 'alta':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'media':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'baixa':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  }
};

export default function InsightInteligente({ insight }: InsightInteligenteProps) {
  const [expandido, setExpandido] = useState(false);
  const [lido, setLido] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Auto-expandir insights críticos
  useEffect(() => {
    if (insight.prioridade === 'critica') {
      setExpandido(true);
    }
  }, [insight.prioridade]);

  const marcarComoLido = () => {
    setLido(true);
    localStorage.setItem(`insight-lido-${insight.titulo}`, 'true');
  };

  const temConteudoExtra = insight.recomendacao || insight.metricas;

  return (
    <div className={`${getInsightStyle(insight.tipo, insight.prioridade)} ${lido ? 'opacity-75' : ''}`}>
      {/* Barra de prioridade no topo */}
      {insight.prioridade && (
        <div className={`h-1 w-full ${
          insight.prioridade === 'critica' ? 'bg-red-500' :
          insight.prioridade === 'alta' ? 'bg-orange-500' :
          insight.prioridade === 'media' ? 'bg-blue-500' : 'bg-gray-400'
        }`} />
      )}

      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Ícone principal */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/50 dark:border-gray-700/50">
              {getInsightIcon(insight.tipo)}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {getTipoDisplayName(insight.tipo)}
              </span>
              
              {insight.categoria && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-white/40 dark:border-gray-600/40">
                  🏷️ {insight.categoria}
                </span>
              )}
              
              {insight.prioridade && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getPrioridadeStyle(insight.prioridade)}`}>
                  {insight.prioridade === 'critica' ? '🚨 Urgente' :
                   insight.prioridade === 'alta' ? '⚡ Importante' :
                   insight.prioridade === 'media' ? '📌 Médio' : '💭 Leve'}
                </span>
              )}
            </div>

            {/* Título */}
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white leading-tight">
              {insight.titulo}
            </h3>

            {/* Descrição */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {insight.descricao}
              </p>
            </div>

            {/* Conteúdo expandível */}
            {expandido && temConteudoExtra && (
              <div className="space-y-4 mt-6 animate-in slide-in-from-top-2 duration-300">
                {insight.recomendacao && (
                  <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-white/60 dark:border-gray-700/60">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          💬 Minha recomendação para você:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {insight.recomendacao}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {insight.metricas && (
                  <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-white/60 dark:border-gray-700/60">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">
                          📊 Dados que me levaram a essa conclusão:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border">
                          {insight.metricas}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/30 dark:border-gray-700/30">
              {temConteudoExtra && (
                <button
                  onClick={() => setExpandido(!expandido)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-white/40 dark:border-gray-600/40 hover:shadow-md"
                >
                  {expandido ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-500 rounded border-t-transparent animate-spin" style={{ display: 'none' }} />
                      ⬆️ Mostrar menos
                    </>
                  ) : (
                    <>
                      ⬇️ Ver mais detalhes
                    </>
                  )}
                </button>
              )}
              
              {!lido && (
                <button
                  onClick={marcarComoLido}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-gray-400 transition-all duration-200 border border-gray-500/30"
                >
                  ✓ Entendi
                </button>
              )}
              
              {insight.tipo === 'apoio' && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  💙 Estou sempre aqui para te ajudar!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
