'use client';

import { AlertTriangle, CheckCircle, PiggyBank, Target, Lightbulb, TrendingUp } from 'lucide-react';

interface Recomendacao {
  tipo: 'urgente' | 'planejamento' | 'habito' | 'poupanca' | 'dica';
  titulo: string;
  descricao: string;
}

interface RecomendacoesPersonalizadasProps {
  recomendacoes: Recomendacao[];
  className?: string;
}

export default function RecomendacoesPersonalizadas({ 
  recomendacoes, 
  className = '' 
}: RecomendacoesPersonalizadasProps) {
  if (!recomendacoes || recomendacoes.length === 0) {
    return null;
  }

  const getIconeETema = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return {
          icone: AlertTriangle,
          cor: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'planejamento':
        return {
          icone: Target,
          cor: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'habito':
        return {
          icone: CheckCircle,
          cor: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'poupanca':
        return {
          icone: PiggyBank,
          cor: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        };
      default:
        return {
          icone: Lightbulb,
          cor: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Recomendações para você
        </h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {recomendacoes.map((recomendacao, index) => {
          const { icone: Icone, cor, bg, border } = getIconeETema(recomendacao.tipo);
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${bg} ${border} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${cor}`}>
                  <Icone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {recomendacao.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {recomendacao.descricao}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
