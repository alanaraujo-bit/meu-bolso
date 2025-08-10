import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PerfilFinanceiro {
  id: string;
  userEmail: string;
  fonteRenda?: string;
  rendaMensal?: string;
  temDividas?: string;
  controlGastos?: string;
  guardaDinheiro?: string;
  objetivoPrincipal?: string;
  prazoObjetivo?: string;
  experienciaFinanceira?: string;
  categoriasPrioritarias?: string[];
  onboardingCompleto: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseOnboardingReturn {
  perfilFinanceiro: PerfilFinanceiro | null;
  onboardingCompleto: boolean;
  loading: boolean;
  error: string | null;
  verificarOnboarding: () => Promise<void>;
  redirecionarSeNecessario: () => void;
}

export function useOnboarding(): UseOnboardingReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [perfilFinanceiro, setPerfilFinanceiro] = useState<PerfilFinanceiro | null>(null);
  // Inicializar como false para novos usuários
  const [onboardingCompleto, setOnboardingCompleto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Função para forçar atualização do estado
  const atualizarEstado = () => {
    const onboardingLocal = localStorage.getItem('onboarding-completo');
    const novoEstado = onboardingLocal === 'true';
    
    console.log('🔄 useOnboarding: Verificando localStorage...', {
      localStorage: onboardingLocal,
      novoEstado,
      estadoAtual: onboardingCompleto
    });
    
    setOnboardingCompleto(novoEstado);
    
    if (novoEstado) {
      // Carregar perfil do localStorage
      const perfilLocal = localStorage.getItem('perfil-financeiro');
      if (perfilLocal) {
        try {
          const perfil = JSON.parse(perfilLocal);
          setPerfilFinanceiro(perfil);
        } catch (e) {
          console.warn('Erro ao ler perfil do localStorage:', e);
        }
      }
    }
  };

  const verificarOnboarding = async () => {
    if (status !== 'authenticated' || !session?.user?.email) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Para usuários novos, sempre começar assumindo que não completaram o onboarding
      setOnboardingCompleto(false);

      // Primeiro verificar localStorage
      const onboardingLocal = localStorage.getItem('onboarding-completo');
      
      if (onboardingLocal === 'true') {
        // Se está marcado como completo localmente, usar essa informação
        setOnboardingCompleto(true);
        
        // Tentar obter dados do perfil do localStorage
        const perfilLocal = localStorage.getItem('perfil-financeiro');
        if (perfilLocal) {
          try {
            const perfil = JSON.parse(perfilLocal);
            setPerfilFinanceiro(perfil);
          } catch (e) {
            console.warn('Erro ao ler perfil do localStorage:', e);
          }
        }
        
        setLoading(false);
        return;
      }

      // Se não está no localStorage, buscar da API (que sempre retorna false por enquanto)
      const response = await fetch('/api/onboarding');
      
      if (!response.ok) {
        throw new Error('Erro ao verificar onboarding');
      }

      const data = await response.json();
      
      // Como a API sempre retorna false, priorizamos o localStorage
      setPerfilFinanceiro(data.perfil);
      setOnboardingCompleto(false); // Forçar false para usuários novos

    } catch (err) {
      console.error('Erro ao verificar onboarding:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Para usuários novos ou com erro, assumir que não completaram
      setOnboardingCompleto(false);
    } finally {
      setLoading(false);
    }
  };

  const redirecionarSeNecessario = () => {
    // Esta função agora é gerenciada pelo OnboardingGuard para evitar conflitos
    console.log('Redirecionamento gerenciado pelo OnboardingGuard');
  };

  // Carregar estado inicial do localStorage rapidamente
  useEffect(() => {
    if (!initialCheckDone) {
      console.log('🎯 useOnboarding: Verificação inicial...');
      atualizarEstado();
      setInitialCheckDone(true);
      
      // Se não há nada no localStorage, garantir que está como false
      const onboardingLocal = localStorage.getItem('onboarding-completo');
      if (onboardingLocal !== 'true') {
        setOnboardingCompleto(false);
      }
      
      setLoading(false);
    }
  }, [initialCheckDone]);

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      atualizarEstado();
    };

    const handleOnboardingCompleted = () => {
      console.log('Evento de onboarding completado recebido');
      atualizarEstado();
    };

    // Adicionar listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('onboardingCompleted', handleOnboardingCompleted);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onboardingCompleted', handleOnboardingCompleted);
    };
  }, []);

  // Verificar onboarding quando a sessão carrega
  useEffect(() => {
    if (status === 'authenticated' && initialCheckDone) {
      // Só fazer chamada da API se realmente precisar
      // Por enquanto, vamos confiar apenas no localStorage
      setLoading(false);
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session?.user?.email, initialCheckDone]);

  return {
    perfilFinanceiro,
    onboardingCompleto,
    loading,
    error,
    verificarOnboarding,
    redirecionarSeNecessario
  };
}

// Hook para usar dados do perfil financeiro
export function usePerfilFinanceiro() {
  const { perfilFinanceiro, loading, error } = useOnboarding();
  
  const getRecomendacoes = () => {
    if (!perfilFinanceiro) return [];

    const recomendacoes = [];

    // Recomendações baseadas na fonte de renda
    if (perfilFinanceiro.fonteRenda === 'autonomo' || perfilFinanceiro.fonteRenda === 'freelancer') {
      recomendacoes.push({
        tipo: 'planejamento',
        titulo: 'Reserve para impostos',
        descricao: 'Como autônomo, é importante separar um valor para pagamento de impostos.'
      });
    }

    // Recomendações baseadas em dívidas
    if (perfilFinanceiro.temDividas === 'muitas') {
      recomendacoes.push({
        tipo: 'urgente',
        titulo: 'Organize suas dívidas',
        descricao: 'Considere fazer um planejamento para quitação das dívidas.'
      });
    }

    // Recomendações baseadas no controle de gastos
    if (perfilFinanceiro.controlGastos === 'raramente') {
      recomendacoes.push({
        tipo: 'habito',
        titulo: 'Crie o hábito de controlar gastos',
        descricao: 'Comece registrando pelo menos uma transação por dia.'
      });
    }

    // Recomendações baseadas na poupança
    if (perfilFinanceiro.guardaDinheiro === 'nunca') {
      recomendacoes.push({
        tipo: 'poupanca',
        titulo: 'Comece a poupar',
        descricao: 'Mesmo R$ 10 por semana já é um bom começo!'
      });
    }

    return recomendacoes;
  };

  const getCategoriasSugeridas = () => {
    if (!perfilFinanceiro) return [];

    const categorias = ['Alimentação', 'Transporte', 'Moradia'];

    // Sugestões baseadas na fonte de renda
    if (perfilFinanceiro.fonteRenda === 'autonomo' || perfilFinanceiro.fonteRenda === 'freelancer') {
      categorias.push('Impostos', 'Equipamentos');
    }

    // Sugestões baseadas no objetivo
    if (perfilFinanceiro.objetivoPrincipal === 'comprar_bem') {
      categorias.push('Poupança Casa');
    } else if (perfilFinanceiro.objetivoPrincipal === 'viagem') {
      categorias.push('Poupança Viagem');
    } else if (perfilFinanceiro.objetivoPrincipal === 'investir') {
      categorias.push('Investimentos');
    }

    return categorias;
  };

  return {
    perfilFinanceiro,
    loading,
    error,
    getRecomendacoes,
    getCategoriasSugeridas
  };
}
