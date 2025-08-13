'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, User, DollarSign, Target, TrendingUp, Check, Sparkles, Sun, Moon } from 'lucide-react';

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
  const [darkMode, setDarkMode] = useState(false);
  const [animandoTransicao, setAnimandoTransicao] = useState(false);
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

  // Hook para gerenciar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      // Ir para light mode
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      // Ir para dark mode
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

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
    
    // Atualizar dados imediatamente
    setDados(prev => ({
      ...prev,
      [etapaAtualData.campo]: valor
    }));
    
    console.log('📝 Onboarding: Dados atualizados');
    
    // Iniciar animação de transição mais suave
    setAnimandoTransicao(true);
    
    // Avançar automaticamente após um delay mais curto e suave
    setTimeout(() => {
      if (etapaAtual < totalEtapas - 1) {
        setEtapaAtual(etapaAtual + 1);
      } else {
        finalizarOnboarding();
      }
    }, 800); // Reduzido para 0.8s para ser mais responsivo
    
    // Reset da animação imediatamente após o avanço
    setTimeout(() => {
      setAnimandoTransicao(false);
    }, 900);
  };

  const proximaEtapa = () => {
    if (animandoTransicao) return; // Prevenir múltiplos cliques durante animação
    
    if (etapaAtual < totalEtapas - 1) {
      setEtapaAtual(etapaAtual + 1);
    } else {
      finalizarOnboarding();
    }
  };

  const etapaAnterior = () => {
    if (animandoTransicao) return; // Prevenir múltiplos cliques durante animação
    
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
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4 transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-700 border-t-emerald-400' 
              : 'border-blue-200 border-t-blue-600'
          }`}></div>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar loading enquanto redireciona
  if (status === 'unauthenticated') {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4 transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-700 border-t-emerald-400' 
              : 'border-blue-200 border-t-blue-600'
          }`}></div>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // Loading durante salvamento
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
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
    <div className={`min-h-screen relative overflow-hidden transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
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
        {darkMode ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse ${
          darkMode ? 'bg-emerald-900/30' : 'bg-emerald-200'
        }`}></div>
        <div className={`absolute top-0 right-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000 ${
          darkMode ? 'bg-teal-900/30' : 'bg-teal-200'
        }`}></div>
        <div className={`absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000 ${
          darkMode ? 'bg-cyan-900/30' : 'bg-cyan-200'
        }`}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header com progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                darkMode ? 'bg-emerald-600' : 'bg-emerald-600'
              }`}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Meu Bolso</h1>
                <p className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Configuração inicial</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Etapa {etapaAtual + 1} de {totalEtapas}</p>
              <p className={`text-xs transition-colors duration-300 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>Olá, {session?.user?.name}!</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
            darkMode ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-2 rounded-full transition-all duration-700 ease-out ${
                darkMode 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600'
              }`}
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className={`backdrop-blur-sm rounded-xl shadow-lg border overflow-hidden transition-all duration-700 ease-out ${
          darkMode 
            ? 'bg-slate-800/80 border-slate-600/30' 
            : 'bg-white/80 border-white/20'
        }`}>
          <div className="p-8 sm:p-12">
            {/* Título da etapa */}
            <div className={`text-center mb-8 transition-all duration-500 ease-out ${
              animandoTransicao ? 'opacity-80 transform translate-y-1' : 'opacity-100 transform translate-y-0'
            }`}>
              <h2 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {etapaAtualData.titulo}
              </h2>
              <p className={`text-lg transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {etapaAtualData.subtitulo}
              </p>
            </div>

            {/* Pergunta */}
            <div className={`mb-8 transition-all duration-500 ease-out ${
              animandoTransicao ? 'opacity-80' : 'opacity-100'
            }`}>
              <h3 className={`text-xl font-semibold text-center mb-8 transition-colors duration-300 ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {etapaAtualData.pergunta}
              </h3>

              {/* Opções */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto transition-all duration-500 ease-out ${
                animandoTransicao ? 'opacity-60' : 'opacity-100'
              }`}>
                {etapaAtualData.opcoes?.map((opcao, index) => (
                  <button
                    key={opcao.valor}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🖱️ Onboarding: Botão clicado:', opcao.valor);
                      selecionarOpcao(opcao.valor);
                    }}
                    disabled={animandoTransicao}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-500 ease-out transform ${
                      opcaoSelecionada === opcao.valor
                        ? darkMode
                          ? 'border-emerald-400 bg-emerald-900/30 shadow-xl scale-105 ring-4 ring-emerald-400/30'
                          : 'border-emerald-500 bg-emerald-50 shadow-xl scale-105 ring-4 ring-emerald-500/30'
                        : darkMode
                          ? 'border-slate-600 hover:border-emerald-500 hover:bg-slate-700/50 hover:scale-102 hover:shadow-lg'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:scale-102 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-500 ease-out ${
                        opcaoSelecionada === opcao.valor
                          ? darkMode
                            ? 'border-emerald-400 bg-emerald-400 shadow-lg shadow-emerald-400/40 scale-110'
                            : 'border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/40 scale-110'
                          : darkMode
                            ? 'border-slate-500'
                            : 'border-gray-300'
                      }`}>
                        <div className={`transition-all duration-300 ${
                          opcaoSelecionada === opcao.valor ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {opcao.label}
                        </h4>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
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
          <div className={`px-8 py-6 sm:px-12 transition-colors duration-300 ${
            darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <button
                onClick={etapaAnterior}
                disabled={etapaAtual === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  etapaAtual === 0
                    ? darkMode ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-slate-600' 
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
                      i <= etapaAtual 
                        ? darkMode ? 'bg-emerald-500' : 'bg-emerald-600' 
                        : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={proximaEtapa}
                disabled={!podeAvancar || carregando || animandoTransicao}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  (podeAvancar && !carregando && !animandoTransicao)
                    ? darkMode
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
                    : darkMode
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {carregando ? (
                  <>
                    <div className={`animate-spin rounded-full h-5 w-5 border-2 transition-colors duration-300 ${
                      darkMode 
                        ? 'border-gray-600 border-t-white' 
                        : 'border-white/30 border-t-white'
                    }`}></div>
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
        <div className="text-center mt-8 transition-colors duration-300">
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            ✨ Suas informações são seguras e nos ajudam a personalizar sua experiência
          </p>
        </div>
      </div>
    </div>
  );
}

// Adicione essas classes CSS customizadas ao globals.css se necessário
// .scale-98 { transform: scale(0.98); }
// .scale-102 { transform: scale(1.02); }
