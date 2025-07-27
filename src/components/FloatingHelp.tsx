'use client';

import { usePathname } from 'next/navigation';
import HelpButton from './HelpButton';
import { helpContents } from '@/lib/helpContents';

export default function FloatingHelp() {
  const pathname = usePathname();

  // Mapear caminhos para conteúdo de ajuda
  const getHelpContent = () => {
    if (pathname.includes('/dashboard')) {
      return {
        title: "Como usar o Dashboard",
        steps: helpContents.dashboard
      };
    }
    if (pathname.includes('/transacoes')) {
      return {
        title: "Como gerenciar suas transações",
        steps: helpContents.transacoes
      };
    }
    if (pathname.includes('/categorias')) {
      return {
        title: "Como organizar suas categorias",
        steps: helpContents.categorias
      };
    }
    if (pathname.includes('/recorrentes')) {
      return {
        title: "Como usar transações recorrentes",
        steps: helpContents.recorrentes
      };
    }
    if (pathname.includes('/metas')) {
      return {
        title: "Como definir e alcançar metas financeiras",
        steps: helpContents.metas
      };
    }
    if (pathname.includes('/dividas')) {
      return {
        title: "Como controlar suas dívidas",
        steps: helpContents.dividas
      };
    }
    
    // Ajuda geral para outras páginas
    return {
      title: "Ajuda Geral - Meu Bolso",
      steps: [
        {
          title: "Bem-vindo ao Meu Bolso! 👋",
          content: `
            <p><strong>Seu aplicativo de controle financeiro pessoal!</strong></p>
            <p>O Meu Bolso foi criado para ajudar você a ter controle total sobre suas finanças de forma simples e intuitiva.</p>
            <p>Navegue pelas diferentes seções usando o menu para explorar todas as funcionalidades.</p>
          `,
          analogy: "Pense no Meu Bolso como um consultor financeiro pessoal que está sempre com você, te ajudando a tomar decisões inteligentes com seu dinheiro.",
          tip: "Comece explorando o Dashboard para ter uma visão geral das suas finanças!"
        },
        {
          title: "Navegação Principal 🧭",
          content: `
            <p><strong>Conheça as principais seções:</strong></p>
            <ul>
              <li><strong>🏠 Dashboard:</strong> Visão geral das suas finanças</li>
              <li><strong>💰 Transações:</strong> Registre entradas e saídas de dinheiro</li>
              <li><strong>📊 Categorias:</strong> Organize seus gastos por tipo</li>
              <li><strong>🔄 Recorrentes:</strong> Automatize movimentações regulares</li>
              <li><strong>🎯 Metas:</strong> Defina e acompanhe objetivos financeiros</li>
              <li><strong>💳 Dívidas:</strong> Controle e quite suas dívidas</li>
            </ul>
          `,
          tip: "Cada seção tem seu próprio botão de ajuda específica. Procure pelo ícone de interrogação!"
        },
        {
          title: "Primeiros Passos 🚀",
          content: `
            <p><strong>Para começar bem:</strong></p>
            <ol>
              <li><strong>Crie suas categorias</strong> principais (alimentação, transporte, etc.)</li>
              <li><strong>Registre suas transações</strong> dos últimos dias</li>
              <li><strong>Configure recorrentes</strong> para entradas/saídas fixas</li>
              <li><strong>Defina uma meta</strong> de economia ou para um objetivo específico</li>
              <li><strong>Acompanhe o dashboard</strong> regularmente</li>
            </ol>
          `,
          tip: "Não precisa fazer tudo de uma vez! Comece com o básico e vá evoluindo gradualmente."
        }
      ]
    };
  };

  const helpContent = getHelpContent();

  // Não mostrar em páginas de login ou páginas que não precisam de ajuda
  if (pathname === '/login' || pathname === '/cadastro' || pathname === '/') {
    return null;
  }

  return (
    <HelpButton 
      title={helpContent.title}
      steps={helpContent.steps}
      size="lg"
      variant="floating"
    />
  );
}
