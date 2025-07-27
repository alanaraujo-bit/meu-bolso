"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Users, DollarSign } from 'lucide-react';

interface Alert {
  id: string;
  tipo: 'warning' | 'error' | 'info';
  titulo: string;
  descricao: string;
  acao?: string;
  timestamp: Date;
}

interface AlertasProps {
  dados: any;
}

export default function AlertasAdmin({ dados }: AlertasProps) {
  const [alertas, setAlertas] = useState<Alert[]>([]);

  useEffect(() => {
    if (dados) {
      const novosAlertas = analisarDados(dados);
      setAlertas(novosAlertas);
    }
  }, [dados]);

  const analisarDados = (dados: any): Alert[] => {
    const alertas: Alert[] = [];

    // Verificar queda de atividade
    if (dados.kpis.taxaRetencao < 80) {
      alertas.push({
        id: 'retencao-baixa',
        tipo: 'warning',
        titulo: 'Taxa de Retenção Baixa',
        descricao: `Taxa atual: ${dados.kpis.taxaRetencao}%. Considere melhorar a experiência do usuário.`,
        acao: 'Analisar feedback dos usuários',
        timestamp: new Date(),
      });
    }

    // Verificar usuários ativos vs total
    const percentualAtivos = (dados.kpis.usuariosAtivos7d / dados.kpis.totalUsuarios) * 100;
    if (percentualAtivos < 50) {
      alertas.push({
        id: 'usuarios-inativos',
        tipo: 'error',
        titulo: 'Muitos Usuários Inativos',
        descricao: `Apenas ${percentualAtivos.toFixed(1)}% dos usuários estão ativos nos últimos 7 dias.`,
        acao: 'Campanhas de reativação',
        timestamp: new Date(),
      });
    }

    // Verificar crescimento de novos usuários
    if (dados.kpis.novosUsuarios30d < 100) {
      alertas.push({
        id: 'crescimento-lento',
        tipo: 'warning',
        titulo: 'Crescimento Abaixo do Esperado',
        descricao: `Apenas ${dados.kpis.novosUsuarios30d} novos usuários nos últimos 30 dias.`,
        acao: 'Revisar estratégias de marketing',
        timestamp: new Date(),
      });
    }

    // Verificar transações por usuário
    const transacoesPorUsuario = dados.kpis.totalTransacoes / dados.kpis.totalUsuarios;
    if (transacoesPorUsuario < 5) {
      alertas.push({
        id: 'baixo-engajamento',
        tipo: 'info',
        titulo: 'Baixo Engajamento de Transações',
        descricao: `Média de ${transacoesPorUsuario.toFixed(1)} transações por usuário.`,
        acao: 'Melhorar onboarding',
        timestamp: new Date(),
      });
    }

    // Verificar ticket médio
    if (dados.kpis.ticketMedio < 50) {
      alertas.push({
        id: 'ticket-baixo',
        tipo: 'warning',
        titulo: 'Ticket Médio Baixo',
        descricao: `Ticket médio de R$ ${dados.kpis.ticketMedio.toFixed(2)} pode indicar uso limitado da plataforma.`,
        acao: 'Incentivar uso de categorias premium',
        timestamp: new Date(),
      });
    }

    return alertas;
  };

  const getIconeAlerta = (tipo: string) => {
    switch (tipo) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <TrendingDown className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Users className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCorAlerta = (tipo: string) => {
    switch (tipo) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const dismissAlerta = (id: string) => {
    setAlertas(alertas.filter(a => a.id !== id));
  };

  if (alertas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-green-500" />
          🔔 Alertas do Sistema
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-600">✅ Tudo funcionando normalmente!</p>
          <p className="text-sm text-gray-500 mt-2">Nenhum alerta crítico detectado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
        🔔 Alertas do Sistema ({alertas.length})
      </h3>
      
      <div className="space-y-4">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className={`border rounded-lg p-4 ${getCorAlerta(alerta.tipo)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getIconeAlerta(alerta.tipo)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                  {alerta.acao && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 <strong>Ação sugerida:</strong> {alerta.acao}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {alerta.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissAlerta(alerta.id)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {alertas.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Ver todos os alertas ({alertas.length})
          </button>
        </div>
      )}
    </div>
  );
}
