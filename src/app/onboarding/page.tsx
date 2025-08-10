'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, User, DollarSign, Target, TrendingUp, Check, Sparkles } from 'lucide-react';

interface OnboardingData {
  fonteRenda: string;
  rendaMensal?: string;
  temDividas: string;
  controlGastos: string;
  guardaDinheiro: string;
  objetivoPrincipal: string;
  prazoObjetivo: string;
  experienciaFinanceira: string;
  categoriasPrioritarias: string[];
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [protegido, setProtegido] = useState(false); // Proteção contra redirecionamentos
  const [dados, setDados] = useState<OnboardingData>({
    fonteRenda: '',
    rendaMensal: '',
    temDividas: '',
    controlGastos: '',
    guardaDinheiro: '',
    objetivoPrincipal: '',
    prazoObjetivo: '',
    experienciaFinanceira: '',
    categoriasPrioritarias: []
  });

  // Marcar como protegido após carregar
  useEffect(() => {
    if (status === 'authenticated') {
      setProtegido(true);
      console.log('🛡️ Onboarding: Página protegida contra redirecionamentos');
    }
  }, [status]);

  // Verificar autenticação
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Verificar se já fez onboarding (DESABILITADO para permitir recompletar)
  // useEffect(() => {
  //   if (protegido) {
  //     const timer = setTimeout(() => {
  //       const onboardingCompleto = localStorage.getItem('onboarding-completo');
  //       console.log('🔍 Onboarding: Verificando estado...', {
  //         onboardingCompleto,
  //         status,
  //         protegido
  //       });
        
  //       if (onboardingCompleto === 'true' && status === 'authenticated') {
  //         console.log('⚠️ Onboarding: Usuário já completou, redirecionando...');
  //         router.push('/dashboard');
  //       }
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [status, router, protegido]);

  const etapas = [
    {
      titulo: "Vamos nos conhecer! 👋",
      subtitulo: "Conte-nos sobre sua situação financeira atual",
      pergunta: "Qual é sua principal fonte de renda?",
      campo: 'fonteRenda',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'salario_fixo', label: '💼 Salário fixo (CLT)', descricao: 'Trabalho com carteira assinada' },
        { valor: 'autonomo', label: '🏃‍♂️ Autônomo', descricao: 'Trabalho por conta própria' },
        { valor: 'freelancer', label: '💻 Freelancer', descricao: 'Projetos e trabalhos pontuais' },
        { valor: 'aposentadoria', label: '🏡 Aposentadoria', descricao: 'Benefício previdenciário' },
        { valor: 'investimentos', label: '📈 Investimentos', descricao: 'Renda de aplicações' },
        { valor: 'outro', label: '🔄 Outro', descricao: 'Outra fonte de renda' }
      ]
    },
    {
      titulo: "Situação atual 💰",
      subtitulo: "Isso nos ajuda a personalizar suas recomendações",
      pergunta: "Você tem dívidas atualmente?",
      campo: 'temDividas',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'nenhuma', label: '✅ Não tenho dívidas', descricao: 'Situação financeira equilibrada' },
        { valor: 'poucas', label: '⚠️ Tenho algumas dívidas', descricao: 'Consigo pagar em dia' },
        { valor: 'muitas', label: '🚨 Tenho muitas dívidas', descricao: 'Preciso de ajuda para organizar' }
      ]
    },
    {
      titulo: "Hábitos financeiros 📊",
      subtitulo: "Queremos entender como você lida com o dinheiro",
      pergunta: "Com que frequência você controla seus gastos?",
      campo: 'controlGastos',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'diariamente', label: '📅 Diariamente', descricao: 'Acompanho tudo de perto' },
        { valor: 'semanalmente', label: '📋 Semanalmente', descricao: 'Faço revisões regulares' },
        { valor: 'mensalmente', label: '📆 Mensalmente', descricao: 'Controlo no final do mês' },
        { valor: 'raramente', label: '❓ Quase nunca', descricao: 'Preciso melhorar nisso' }
      ]
    },
    {
      titulo: "Planejamento 🎯",
      subtitulo: "Vamos descobrir seus objetivos",
      pergunta: "Você costuma guardar parte da sua renda?",
      campo: 'guardaDinheiro',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'sempre', label: '💪 Sim, regularmente', descricao: 'Tenho disciplina para poupar' },
        { valor: 'as_vezes', label: '🔄 Às vezes', descricao: 'Quando sobra dinheiro' },
        { valor: 'dificuldade', label: '😅 Tenho dificuldade', descricao: 'O dinheiro sempre acaba' },
        { valor: 'nunca', label: '❌ Nunca consigo', descricao: 'Preciso de ajuda com isso' }
      ]
    },
    {
      titulo: "Seus objetivos 🚀",
      subtitulo: "Para onde você quer chegar?",
      pergunta: "Qual é seu principal objetivo financeiro?",
      campo: 'objetivoPrincipal',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'quitar_dividas', label: '🆓 Quitar dívidas', descricao: 'Ficar livre de pendências' },
        { valor: 'reserva_emergencia', label: '🛡️ Criar reserva de emergência', descricao: 'Ter segurança financeira' },
        { valor: 'comprar_bem', label: '🏠 Comprar um bem', descricao: 'Casa, carro, etc.' },
        { valor: 'investir', label: '📈 Aumentar investimentos', descricao: 'Fazer o dinheiro trabalhar' },
        { valor: 'viagem', label: '✈️ Realizar uma viagem', descricao: 'Conhecer novos lugares' },
        { valor: 'outro', label: '🎯 Outro objetivo', descricao: 'Tenho outros planos' }
      ]
    },
    {
      titulo: "Prazo 📅",
      subtitulo: "Tempo é fundamental no planejamento",
      pergunta: "Em quanto tempo pretende atingir esse objetivo?",
      campo: 'prazoObjetivo',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'ate_6_meses', label: '⚡ Até 6 meses', descricao: 'Objetivo de curto prazo' },
        { valor: '6_a_12_meses', label: '🎯 6 a 12 meses', descricao: 'Prazo intermediário' },
        { valor: '1_a_2_anos', label: '📅 1 a 2 anos', descricao: 'Planejamento de médio prazo' },
        { valor: 'mais_2_anos', label: '🏔️ Mais de 2 anos', descricao: 'Objetivo de longo prazo' }
      ]
    },
    {
      titulo: "Experiência 🧠",
      subtitulo: "Última pergunta!",
      pergunta: "Como você se considera em relação a finanças?",
      campo: 'experienciaFinanceira',
      tipo: 'opcoes',
      opcoes: [
        { valor: 'iniciante', label: '🌱 Iniciante', descricao: 'Estou começando a aprender' },
        { valor: 'intermediario', label: '📚 Intermediário', descricao: 'Sei o básico, quero melhorar' },
        { valor: 'avancado', label: '🎓 Avançado', descricao: 'Tenho bom conhecimento' },
        { valor: 'expert', label: '🏆 Expert', descricao: 'Domino bem o assunto' }
      ]
    }
  ];

  const etapaAtualData = etapas[etapaAtual];
  const totalEtapas = etapas.length;
  const progresso = ((etapaAtual + 1) / totalEtapas) * 100;

  const selecionarOpcao = (valor: string) => {
    console.log('🎯 Onboarding: Opção selecionada:', valor, 'para campo:', etapaAtualData.campo);
    setDados(prev => ({
      ...prev,
      [etapaAtualData.campo]: valor
    }));
    console.log('📝 Onboarding: Dados atualizados');
  };

  const proximaEtapa = () => {
    if (etapaAtual < totalEtapas - 1) {
      setEtapaAtual(etapaAtual + 1);
    } else {
      finalizarOnboarding();
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const finalizarOnboarding = async () => {
    setCarregando(true);
    try {
      console.log('Iniciando salvamento do onboarding...', dados);
      
      // Tentar salvar via API primeiro
      try {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dados),
        });

        if (response.ok) {
          console.log('Dados salvos na API com sucesso');
        } else {
          console.warn('Erro na API, salvando localmente:', response.status);
        }
      } catch (apiError) {
        console.warn('API indisponível, salvando localmente:', apiError);
      }
      
      // Sempre salvar no localStorage como backup
      localStorage.setItem('onboarding-completo', 'true');
      localStorage.setItem('perfil-financeiro', JSON.stringify({
        ...dados,
        dataCompleto: new Date().toISOString()
      }));
      
      // Disparar evento customizado para notificar mudança
      window.dispatchEvent(new Event('onboardingCompleted'));
      
      console.log('Dados salvos no localStorage');
      
      // Delay mais longo para garantir que o localStorage foi atualizado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usar replace em vez de push para evitar conflitos com o OnboardingGuard
      console.log('Redirecionando para dashboard...');
      window.location.replace('/dashboard?welcome=true');
      
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      
      // Ainda assim salvar localmente e continuar
      localStorage.setItem('onboarding-completo', 'true');
      localStorage.setItem('perfil-financeiro', JSON.stringify(dados));
      
      // Mostrar mensagem mais amigável
      alert('Suas informações foram salvas! Redirecionando para o dashboard...');
      
      // Redirecionar mesmo com erro
      setTimeout(() => {
        window.location.replace('/dashboard?welcome=true');
      }, 1000);
      
    } finally {
      setCarregando(false);
    }
  };

  const opcaoSelecionada = dados[etapaAtualData.campo as keyof OnboardingData];
  const podeAvancar = opcaoSelecionada !== '';

  // Loading inicial
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar loading enquanto redireciona
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Loading durante salvamento
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Salvando suas informações...
          </h3>
          <p className="text-gray-600">
            Estamos configurando sua experiência personalizada
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header com progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Meu Bolso</h1>
                <p className="text-gray-600">Configuração inicial</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Etapa {etapaAtual + 1} de {totalEtapas}</p>
              <p className="text-xs text-gray-400">Olá, {session?.user?.name}!</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Título da etapa */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {etapaAtualData.titulo}
              </h2>
              <p className="text-gray-600 text-lg">
                {etapaAtualData.subtitulo}
              </p>
            </div>

            {/* Pergunta */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-8">
                {etapaAtualData.pergunta}
              </h3>

              {/* Opções */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {etapaAtualData.opcoes?.map((opcao, index) => (
                  <button
                    key={opcao.valor}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ Onboarding: Botão clicado:', opcao.valor);
                      selecionarOpcao(opcao.valor);
                    }}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      opcaoSelecionada === opcao.valor
                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                        opcaoSelecionada === opcao.valor
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {opcaoSelecionada === opcao.valor && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {opcao.label}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {opcao.descricao}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer com navegação */}
          <div className="bg-gray-50 px-8 py-6 sm:px-12">
            <div className="flex justify-between items-center">
              <button
                onClick={etapaAnterior}
                disabled={etapaAtual === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  etapaAtual === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>

              <div className="flex space-x-2">
                {Array.from({ length: totalEtapas }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i <= etapaAtual ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={proximaEtapa}
                disabled={!podeAvancar || carregando}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  podeAvancar && !carregando
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <span>{etapaAtual === totalEtapas - 1 ? 'Finalizar' : 'Próximo'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Informação adicional */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            ✨ Suas informações são seguras e nos ajudam a personalizar sua experiência
          </p>
        </div>
      </div>
    </div>
  );
}
