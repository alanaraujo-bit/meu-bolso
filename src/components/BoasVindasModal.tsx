'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Target, PiggyBank, TrendingUp } from 'lucide-react';

interface BoasVindasModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomeUsuario?: string;
  perfilFinanceiro?: any;
}

export default function BoasVindasModal({ 
  isOpen, 
  onClose, 
  nomeUsuario,
  perfilFinanceiro 
}: BoasVindasModalProps) {
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEtapa(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const proximaEtapa = () => {
    if (etapa < 2) {
      setEtapa(etapa + 1);
    } else {
      onClose();
    }
  };

  const getObjetivoTexto = () => {
    if (!perfilFinanceiro?.objetivoPrincipal) return 'seus objetivos financeiros';
    
    const objetivos: Record<string, string> = {
      'quitar_dividas': 'quitar suas dívidas',
      'reserva_emergencia': 'criar sua reserva de emergência',
      'comprar_bem': 'comprar seu sonhado bem',
      'investir': 'aumentar seus investimentos',
      'viagem': 'realizar sua viagem dos sonhos',
      'outro': 'alcançar seus objetivos'
    };
    
    return objetivos[perfilFinanceiro.objetivoPrincipal] || 'seus objetivos financeiros';
  };

  const etapas = [
    {
      icone: Sparkles,
      titulo: `Bem-vindo ao Meu Bolso, ${nomeUsuario?.split(' ')[0]}!`,
      conteudo: (
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">
            Parabéns por dar o primeiro passo rumo ao controle financeiro! 🎉
          </p>
          <p className="text-gray-600">
            Suas informações foram salvas e agora conseguimos personalizar 
            sua experiência para te ajudar a alcançar seus objetivos.
          </p>
        </div>
      )
    },
    {
      icone: Target,
      titulo: 'Seu plano personalizado',
      conteudo: (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 Seu objetivo principal:</h4>
            <p className="text-blue-700 capitalize">
              {getObjetivoTexto()}
            </p>
          </div>
          
          {perfilFinanceiro?.prazoObjetivo && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">⏰ Prazo definido:</h4>
              <p className="text-green-700">
                {perfilFinanceiro.prazoObjetivo === 'ate_6_meses' && 'Até 6 meses'}
                {perfilFinanceiro.prazoObjetivo === '6_a_12_meses' && '6 a 12 meses'}
                {perfilFinanceiro.prazoObjetivo === '1_a_2_anos' && '1 a 2 anos'}
                {perfilFinanceiro.prazoObjetivo === 'mais_2_anos' && 'Mais de 2 anos'}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      icone: TrendingUp,
      titulo: 'Vamos começar!',
      conteudo: (
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            Agora você tem acesso a insights personalizados e recomendações 
            específicas para seu perfil.
          </p>
          
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <PiggyBank className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Controle de gastos</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">Metas personalizadas</p>
            </div>
          </div>
          
          <p className="text-gray-600">
            Comece registrando sua primeira transação!
          </p>
        </div>
      )
    }
  ];

  const etapaAtual = etapas[etapa];
  const IconeEtapa = etapaAtual.icone;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <IconeEtapa className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{etapaAtual.titulo}</h2>
              <p className="text-blue-100 text-sm">Etapa {etapa + 1} de 3</p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {etapaAtual.conteudo}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="flex space-x-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i <= etapa ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={proximaEtapa}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {etapa < 2 ? 'Continuar' : 'Começar agora!'}
          </button>
        </div>
      </div>
    </div>
  );
}
