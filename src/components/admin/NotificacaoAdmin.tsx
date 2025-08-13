"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Bell, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface Notificacao {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensagem: string;
  timestamp: Date;
  lida: boolean;
  acao?: {
    texto: string;
    url: string;
  };
}

export default function NotificacaoAdmin() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [abertas, setAbertas] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const { theme } = useTheme();

  const buscarNotificacoes = async () => {
    try {
      const response = await fetch('/api/admin/notificacoes');
      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data.notificacoes);
        setNaoLidas(data.naoLidas);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await fetch(`/api/admin/notificacoes/${id}/lida`, {
        method: 'POST',
      });
      
      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
      
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const removerNotificacao = async (id: string) => {
    try {
      await fetch(`/api/admin/notificacoes/${id}`, {
        method: 'DELETE',
      });
      
      setNotificacoes(prev => prev.filter(n => n.id !== id));
      
      const notificacao = notificacoes.find(n => n.id === id);
      if (notificacao && !notificacao.lida) {
        setNaoLidas(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  useEffect(() => {
    buscarNotificacoes();
    
    // Polling a cada 30 segundos para novas notificações
    const interval = setInterval(buscarNotificacoes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCorFundo = (tipo: string, lida: boolean) => {
    const base = lida ? 'opacity-60' : '';
    switch (tipo) {
      case 'info': return `bg-blue-50 border-blue-200 ${base}`;
      case 'warning': return `bg-yellow-50 border-yellow-200 ${base}`;
      case 'error': return `bg-red-50 border-red-200 ${base}`;
      case 'success': return `bg-green-50 border-green-200 ${base}`;
      default: return `bg-gray-50 border-gray-200 ${base}`;
    }
  };

  const formatarTempo = (timestamp: Date) => {
    const agora = new Date();
    const diferenca = agora.getTime() - timestamp.getTime();
    const minutos = Math.floor(diferenca / (1000 * 60));
    
    if (minutos < 1) return 'agora mesmo';
    if (minutos < 60) return `${minutos}min atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setAbertas(!abertas)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {abertas && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações
              </h3>
              <button
                onClick={() => setAbertas(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {naoLidas > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`p-4 border-l-4 ${getCorFundo(notificacao.tipo, notificacao.lida)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getIcone(notificacao.tipo)}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${notificacao.lida ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notificacao.titulo}
                          </h4>
                          <p className={`text-sm mt-1 ${notificacao.lida ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notificacao.mensagem}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatarTempo(notificacao.timestamp)}
                            </span>
                            {notificacao.acao && (
                              <a
                                href={notificacao.acao.url}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                onClick={() => marcarComoLida(notificacao.id)}
                              >
                                {notificacao.acao.texto}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {!notificacao.lida && (
                          <button
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                            title="Marcar como lida"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => removerNotificacao(notificacao.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Remover"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notificacoes.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Marcar todas como lidas
                  notificacoes.forEach(n => {
                    if (!n.lida) marcarComoLida(n.id);
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
