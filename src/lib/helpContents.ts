interface HelpStep {
  title: string;
  content: string;
  image?: string;
  gif?: string;
  analogy?: string;
  tip?: string;
}

export const dashboardHelp: HelpStep[] = [
  {
    title: "Bem-vindo ao seu Dashboard! 🏠",
    content: `
      <p><strong>O Dashboard é como a sala principal da sua casa financeira!</strong></p>
      <p>Aqui você tem uma visão geral de tudo que acontece com o seu dinheiro. É como ter um painel de controle do seu carro - todos os indicadores mais importantes estão aqui para você acompanhar.</p>
      <p>Vamos explorar cada parte desta tela juntos!</p>
    `,
    analogy: "Imagine que seu dinheiro é como uma fazenda. O Dashboard é como subir no alto de uma colina para ver toda a fazenda de uma vez só - você consegue ver onde estão as plantações (receitas), onde estão os gastos (despesas), e como está a saúde geral da fazenda.",
    tip: "Acesse o Dashboard sempre que quiser ter uma visão rápida da sua situação financeira. É aqui que você toma as melhores decisões!"
  },
  {
    title: "Resumo Financeiro - Seus Números 📊",
    content: `
      <p><strong>Esta seção mostra o "estado de saúde" do seu dinheiro neste mês:</strong></p>
      <ul>
        <li><strong>💰 Receitas:</strong> Todo dinheiro que ENTRA (salário, freelances, vendas)</li>
        <li><strong>💸 Despesas:</strong> Todo dinheiro que SAI (contas, compras, gastos)</li>
        <li><strong>💵 Saldo:</strong> O que sobra (Receitas - Despesas)</li>
      </ul>
      <p>As setinhas 📈📉 mostram se você está gastando mais ou menos que no mês passado.</p>
    `,
    analogy: "É como olhar sua carteira no final do dia: você conta quanto tinha de manhã (receitas), quanto gastou (despesas), e vê quanto sobrou (saldo). A diferença é que aqui você vê o mês inteiro!",
    tip: "Se o saldo estiver vermelho (negativo), significa que você gastou mais do que ganhou. Hora de revisar os gastos!"
  },
  {
    title: "Gráficos - Visualizando seu Dinheiro 📈",
    content: `
      <p><strong>Os gráficos transformam números em imagens fáceis de entender:</strong></p>
      <ul>
        <li><strong>Gráfico de Pizza 🥧:</strong> Mostra em quais categorias você mais gasta (alimentação, transporte, etc.)</li>
        <li><strong>Gráfico de Barras 📊:</strong> Compara seus gastos ao longo dos meses</li>
        <li><strong>Linha do Tempo 📈:</strong> Mostra a evolução das suas finanças</li>
      </ul>
      <p>Cada cor representa uma categoria diferente de gasto ou receita.</p>
    `,
    analogy: "Imagine que você tem várias caixinhas coloridas para guardar dinheiro - uma para comida, outra para transporte, etc. Os gráficos mostram qual caixinha está mais cheia ou vazia!",
    tip: "Se uma fatia do gráfico está muito grande, significa que você gasta muito naquela categoria. Pode ser hora de controlar!"
  },
  {
    title: "Transações Recentes - Seus Últimos Movimentos 📝",
    content: `
      <p><strong>Esta lista mostra suas últimas movimentações financeiras:</strong></p>
      <ul>
        <li><strong>Verde 🟢:</strong> Dinheiro que entrou (receitas)</li>
        <li><strong>Vermelho 🔴:</strong> Dinheiro que saiu (despesas)</li>
        <li><strong>Data e Hora:</strong> Quando aconteceu cada movimentação</li>
        <li><strong>Descrição:</strong> O que foi comprado ou recebido</li>
      </ul>
      <p>É como um extrato bancário, mas mais organizado e visual!</p>
    `,
    analogy: "É como ter um diário onde você anota tudo que acontece com seu dinheiro. Cada linha é como uma página do diário contando uma história: 'Hoje gastei R$ 50 no supermercado'.",
    tip: "Revise esta lista regularmente para lembrar onde seu dinheiro foi parar. Às vezes descobrimos gastos que nem lembrávamos!"
  },
  {
    title: "Metas Financeiras - Seus Objetivos 🎯",
    content: `
      <p><strong>As metas são seus sonhos financeiros em ação:</strong></p>
      <ul>
        <li><strong>Barra de Progresso:</strong> Mostra quanto você já juntou da meta</li>
        <li><strong>Valor Alvo:</strong> Quanto você quer juntar</li>
        <li><strong>Prazo:</strong> Até quando você quer alcançar</li>
        <li><strong>Status:</strong> Se está no prazo ou atrasada</li>
      </ul>
      <p>É a sua motivação visual para economizar!</p>
    `,
    analogy: "É como ter um cofrinho transparente para cada sonho: um para a viagem, outro para o carro novo. Você vê o cofrinho enchendo aos poucos até ficar cheio!",
    tip: "Defina metas realistas e comemore cada pequeno progresso. Grandes objetivos são alcançados com pequenos passos!"
  },
  {
    title: "Insights e Dicas - Sua Consultora Virtual 💡",
    content: `
      <p><strong>O sistema analisa seus dados e dá dicas personalizadas:</strong></p>
      <ul>
        <li><strong>🎉 Verde:</strong> Parabéns! Você está indo bem</li>
        <li><strong>⚠️ Amarelo:</strong> Atenção, pode melhorar algo</li>
        <li><strong>🚨 Vermelho:</strong> Cuidado, precisa ajustar</li>
        <li><strong>💡 Azul:</strong> Dica para melhorar suas finanças</li>
      </ul>
      <p>É como ter um consultor financeiro pessoal 24 horas por dia!</p>
    `,
    analogy: "Imagine que você tem um amigo muito esperto que conhece bem suas finanças. Ele está sempre observando e te dando conselhos: 'Opa, você está gastando muito com delivery este mês!' ou 'Parabéns, você economizou mais que o mês passado!'",
    tip: "Leia sempre os insights! Eles são baseados nos seus próprios dados e podem revelar padrões que você não percebeu."
  }
];

export const transacoesHelp: HelpStep[] = [
  {
    title: "Suas Transações - O Coração do Sistema 💳",
    content: `
      <p><strong>Esta é a página mais importante do seu controle financeiro!</strong></p>
      <p>Aqui você registra TODA movimentação do seu dinheiro - cada real que entra e cada real que sai.</p>
      <p>É como um caderninho onde você anota tudo, mas muito mais inteligente e organizado!</p>
    `,
    analogy: "Pense nas transações como as páginas de um livro de história do seu dinheiro. Cada transação é um capítulo que conta: 'Em 15 de janeiro, gastei R$ 25 no almoço' ou 'Em 20 de janeiro, recebi R$ 500 de freelance'.",
    tip: "Registre SEMPRE que gastar ou receber dinheiro, mesmo valores pequenos. R$ 5 aqui, R$ 10 ali, no final do mês vira uma quantia significativa!"
  },
  {
    title: "Adicionando Nova Transação ➕",
    content: `
      <p><strong>Vamos aprender a registrar cada movimento do seu dinheiro:</strong></p>
      <ol>
        <li><strong>Clique em "Nova Transação"</strong> (botão azul)</li>
        <li><strong>Escolha o Tipo:</strong>
          <ul>
            <li>💰 <strong>Receita:</strong> Dinheiro que ENTRA (salário, vendas, prêmios)</li>
            <li>💸 <strong>Despesa:</strong> Dinheiro que SAI (contas, compras, gastos)</li>
          </ul>
        </li>
        <li><strong>Digite o Valor:</strong> Quanto foi o movimento</li>
        <li><strong>Escreva a Descrição:</strong> O que foi (ex: "Almoço no restaurante", "Salário janeiro")</li>
        <li><strong>Escolha a Categoria:</strong> Para organizar (ex: Alimentação, Trabalho)</li>
        <li><strong>Confirme a Data:</strong> Quando aconteceu</li>
      </ol>
    `,
    analogy: "É como preencher um cheque, mas ao contrário - você está anotando o que já aconteceu. Imagine que você é um jornalista contando a história: 'Quando?', 'Quanto?', 'O que foi?', 'Que tipo?'",
    tip: "Seja específico na descrição! Em vez de 'compras', escreva 'compras no supermercado' ou 'compra de roupas'. Isso vai te ajudar a entender melhor seus gastos depois."
  },
  {
    title: "Entendendo as Categorias 🗂️",
    content: `
      <p><strong>Categorias são como gavetas organizadas para seu dinheiro:</strong></p>
      <ul>
        <li><strong>🍔 Alimentação:</strong> Supermercado, restaurantes, delivery</li>
        <li><strong>🚗 Transporte:</strong> Combustível, Uber, ônibus, manutenção do carro</li>
        <li><strong>🏠 Moradia:</strong> Aluguel, contas da casa, móveis</li>
        <li><strong>👕 Vestuário:</strong> Roupas, sapatos, acessórios</li>
        <li><strong>💊 Saúde:</strong> Médicos, remédios, academia</li>
        <li><strong>🎮 Lazer:</strong> Cinema, jogos, hobbies</li>
      </ul>
      <p>Cada categoria tem uma cor para facilitar a identificação!</p>
    `,
    analogy: "Imagine seu armário: você tem uma gaveta para camisetas, outra para calças, outra para meias. As categorias funcionam igual - cada tipo de gasto tem seu 'lugar' específico para ficar organizado.",
    tip: "Use sempre a mesma categoria para gastos similares. Isso vai gerar relatórios mais precisos e te ajudar a identificar onde gasta mais!"
  },
  {
    title: "Filtrando e Buscando 🔍",
    content: `
      <p><strong>Encontre rapidamente qualquer transação:</strong></p>
      <ul>
        <li><strong>🔍 Busca por Texto:</strong> Digite qualquer palavra da descrição</li>
        <li><strong>📅 Filtro por Data:</strong> Escolha um período específico</li>
        <li><strong>💰 Filtro por Tipo:</strong> Só receitas ou só despesas</li>
        <li><strong>🗂️ Filtro por Categoria:</strong> Ex: só gastos com alimentação</li>
        <li><strong>💵 Filtro por Valor:</strong> Transações acima ou abaixo de um valor</li>
      </ul>
      <p>Clique no botão "🔍 Filtros" para mostrar/esconder as opções!</p>
    `,
    analogy: "É como ter uma biblioteca super organizada. Em vez de procurar livro por livro, você pode dizer: 'Quero todos os livros de romance, escritos em 2023, que custaram menos de R$ 50'. O sistema mostra exatamente isso!",
    tip: "Use os filtros para analisar padrões: 'Quanto gastei com alimentação este mês?' ou 'Quais foram minhas maiores despesas?'"
  },
  {
    title: "Editando e Excluindo ✏️",
    content: `
      <p><strong>Cometeu um erro? Sem problemas!</strong></p>
      <ul>
        <li><strong>✏️ Para Editar:</strong> Clique no ícone do lápis na transação</li>
        <li><strong>🗑️ Para Excluir:</strong> Clique no ícone da lixeira</li>
        <li><strong>💾 Para Salvar:</strong> Após editar, clique em "Salvar"</li>
        <li><strong>❌ Para Cancelar:</strong> Se mudou de ideia, clique em "Cancelar"</li>
      </ul>
      <p>O sistema sempre pergunta antes de excluir para evitar acidentes!</p>
    `,
    analogy: "É como ter um caderno escrito a lápis em vez de caneta - você pode apagar e corrigir qualquer coisa a qualquer momento. Errou o valor? Esqueceu de algo na descrição? Só editar!",
    tip: "Revise suas transações de vez em quando. Às vezes você pode ter digitado R$ 500 em vez de R$ 50, ou classificado algo na categoria errada."
  },
  {
    title: "Exportando seus Dados 📊",
    content: `
      <p><strong>Leve seus dados para onde quiser:</strong></p>
      <ul>
        <li><strong>📊 Exportar CSV:</strong> Gera um arquivo Excel com todas as transações</li>
        <li><strong>📅 Período Específico:</strong> Use os filtros antes de exportar</li>
        <li><strong>💻 Abrir no Excel:</strong> O arquivo pode ser aberto em qualquer planilha</li>
        <li><strong>📈 Criar Gráficos:</strong> Use os dados para análises personalizadas</li>
      </ul>
      <p>Útil para fazer relatórios, backup dos dados ou análises mais avançadas!</p>
    `,
    analogy: "É como tirar uma fotocópia de todas as páginas do seu caderno financeiro. Você pode levar para qualquer lugar, mostrar para outras pessoas, ou usar para fazer outros estudos.",
    tip: "Exporte seus dados mensalmente como backup. Assim você sempre terá uma cópia de segurança das suas informações financeiras!"
  }
];

export const categoriasHelp: HelpStep[] = [
  {
    title: "Organizando seu Dinheiro por Categorias 🗂️",
    content: `
      <p><strong>Categorias são as 'gavetas' onde você organiza seus gastos e receitas!</strong></p>
      <p>Em vez de ter tudo misturado, você separa cada tipo de movimento financeiro em grupos que fazem sentido para você.</p>
      <p>É a base para entender seus padrões de consumo e tomar decisões mais inteligentes!</p>
    `,
    analogy: "Imagine que sua carteira é uma caixa de ferramentas. Em vez de jogar tudo solto, você tem compartimentos: um para parafusos (alimentação), outro para pregos (transporte), outro para chaves (moradia). Cada categoria é um compartimento específico!",
    tip: "Quanto mais organizado você for com as categorias, melhor será sua análise financeira. É o segredo para identificar onde seu dinheiro está indo!"
  },
  {
    title: "Criando Novas Categorias ➕",
    content: `
      <p><strong>Personalize seu sistema de organização:</strong></p>
      <ol>
        <li><strong>Nome da Categoria:</strong> Ex: "Alimentação", "Transporte", "Estudos"</li>
        <li><strong>Escolha um Ícone:</strong> Visual para identificar rapidamente (🍔, 🚗, 📚)</li>
        <li><strong>Selecione uma Cor:</strong> Para distinguir nos gráficos e relatórios</li>
        <li><strong>Adicione uma Descrição:</strong> O que incluir nesta categoria</li>
      </ol>
      <p>Crie categorias que façam sentido para SEU estilo de vida!</p>
    `,
    analogy: "É como criar etiquetas coloridas para organizar seus arquivos. Cada etiqueta tem uma cor, um desenho e um nome. Quando você vê a etiqueta verde com desenho de maçã, já sabe que é sobre alimentação!",
    tip: "Não crie categorias demais! Comece com 8-12 categorias principais. Você sempre pode criar mais depois, mas muitas categorias podem confundir mais do que ajudar."
  },
  {
    title: "Categorias para Receitas vs Despesas 💰💸",
    content: `
      <p><strong>Organize tanto o que entra quanto o que sai:</strong></p>
      <h4>💰 Receitas (Dinheiro que ENTRA):</h4>
      <ul>
        <li><strong>💼 Salário:</strong> Seu trabalho principal</li>
        <li><strong>💻 Freelances:</strong> Trabalhos extras</li>
        <li><strong>🏪 Vendas:</strong> Se você vende algo</li>
        <li><strong>🎁 Presentes:</strong> Dinheiro recebido de presente</li>
      </ul>
      <h4>💸 Despesas (Dinheiro que SAI):</h4>
      <ul>
        <li><strong>🍔 Alimentação:</strong> Supermercado, restaurantes</li>
        <li><strong>🚗 Transporte:</strong> Combustível, transporte público</li>
        <li><strong>🏠 Moradia:</strong> Aluguel, contas da casa</li>
      </ul>
    `,
    analogy: "É como ter duas caixas: uma VERDE para guardar os tipos de dinheiro que entra (salário, freelances) e uma VERMELHA para organizar os tipos de gastos (comida, transporte). Cada caixa tem divisórias menores (as categorias).",
    tip: "Use categorias específicas! Em vez de só 'Comida', tenha 'Supermercado' e 'Restaurantes'. Isso te ajuda a ver se você está gastando muito comendo fora."
  },
  {
    title: "Editando e Gerenciando Categorias ✏️",
    content: `
      <p><strong>Suas categorias podem evoluir com o tempo:</strong></p>
      <ul>
        <li><strong>✏️ Editar:</strong> Mudar nome, ícone ou cor</li>
        <li><strong>🗑️ Excluir:</strong> Remover categorias não utilizadas</li>
        <li><strong>🔄 Reorganizar:</strong> Alterar a ordem de exibição</li>
        <li><strong>📊 Ver Estatísticas:</strong> Quanto já foi gasto em cada categoria</li>
      </ul>
      <p><strong>⚠️ Cuidado:</strong> Excluir uma categoria não deleta as transações, apenas as deixa "sem categoria".</p>
    `,
    analogy: "É como reorganizar seu guarda-roupa. Às vezes você percebe que não precisa mais daquela gaveta para 'roupas de festa' porque nunca usa, ou quer criar uma nova gaveta para 'roupas de academia' porque começou a se exercitar.",
    tip: "Revise suas categorias a cada 3 meses. Sua vida muda, seus gastos mudam, e suas categorias devem acompanhar essas mudanças!"
  },
  {
    title: "Usando Cores e Ícones Estrategicamente 🎨",
    content: `
      <p><strong>Visual inteligente para análises mais rápidas:</strong></p>
      <ul>
        <li><strong>🔴 Vermelho:</strong> Gastos altos ou importantes (moradia, alimentação)</li>
        <li><strong>🟡 Amarelo:</strong> Gastos médios (transporte, vestuário)</li>
        <li><strong>🟢 Verde:</strong> Receitas ou gastos pequenos</li>
        <li><strong>🔵 Azul:</strong> Investimentos ou poupança</li>
        <li><strong>🟣 Roxo:</strong> Lazer e entretenimento</li>
      </ul>
      <p>Ícones intuitivos ajudam na identificação rápida!</p>
    `,
    analogy: "É como um semáforo para suas finanças. Vermelho = atenção, gastos importantes; Amarelo = cuidado moderado; Verde = pode seguir tranquilo. Seus olhos vão se acostumar e você identificará tudo numa olhada!",
    tip: "Use um padrão de cores que faça sentido para VOCÊ. Se azul te lembra água e você quer economizar na conta de água, use azul para 'Contas da Casa'!"
  },
  {
    title: "Analisando Gastos por Categoria 📊",
    content: `
      <p><strong>Transforme categorias em insights poderosos:</strong></p>
      <ul>
        <li><strong>📊 Gráficos:</strong> Veja qual categoria consome mais do seu dinheiro</li>
        <li><strong>📈 Tendências:</strong> Compare gastos da mesma categoria ao longo dos meses</li>
        <li><strong>🎯 Metas:</strong> Defina limites para cada categoria</li>
        <li><strong>⚖️ Proporções:</strong> Veja quanto % da sua renda vai para cada categoria</li>
      </ul>
      <p>Use esses dados para tomar decisões financeiras mais inteligentes!</p>
    `,
    analogy: "É como fazer um raio-X das suas finanças. Você consegue ver 'o esqueleto' dos seus gastos: qual 'osso' (categoria) está maior, qual está mais fraco, onde precisa de mais 'cálcio' (atenção) para ficar saudável.",
    tip: "A regra 50/30/20 é um bom ponto de partida: 50% para necessidades (moradia, alimentação), 30% para desejos (lazer, compras), 20% para poupança/investimentos!"
  }
];

export const recorrentesHelp: HelpStep[] = [
  {
    title: "Transações que se Repetem Automaticamente 🔄",
    content: `
      <p><strong>Nem tudo precisa ser registrado manualmente!</strong></p>
      <p>Transações recorrentes são aquelas que acontecem regularmente: salário todo mês, aluguel todo mês, conta de luz, assinatura de streaming, etc.</p>
      <p>Configure uma vez e o sistema cria automaticamente para você!</p>
    `,
    analogy: "É como ter um assistente pessoal que lembra de anotar as coisas que se repetem. Todo dia 5, ele anota 'salário recebido'. Todo dia 10, ele anota 'conta de luz paga'. Você não precisa ficar lembrando!",
    tip: "Use recorrentes para tudo que acontece regularmente. Vai economizar muito tempo e garantir que nada seja esquecido!"
  },
  {
    title: "Tipos de Frequência ⏰",
    content: `
      <p><strong>Configure conforme sua necessidade:</strong></p>
      <ul>
        <li><strong>📅 Diária:</strong> Todos os dias (ex: lanche da tarde)</li>
        <li><strong>📅 Semanal:</strong> Toda semana (ex: almoço de domingo)</li>
        <li><strong>📅 Quinzenal:</strong> A cada 15 dias (ex: salário quinzenal)</li>
        <li><strong>📅 Mensal:</strong> Todo mês (ex: aluguel, conta de luz)</li>
        <li><strong>📅 Trimestral:</strong> A cada 3 meses (ex: IPVA)</li>
        <li><strong>📅 Semestral:</strong> A cada 6 meses (ex: seguro do carro)</li>
        <li><strong>📅 Anual:</strong> Todo ano (ex: IPTU, renovação de documentos)</li>
      </ul>
    `,
    analogy: "É como configurar alarmes no seu celular, mas para o dinheiro. Alguns tocam todo dia (remédio), outros toda semana (feira), outros todo mês (aluguel). Cada 'alarme' tem sua frequência específica.",
    tip: "Pense em TODOS os gastos e receitas que se repetem. Até aquele café de R$ 5 todo dia pode virar uma recorrente diária!"
  },
  {
    title: "Configurando uma Nova Recorrente ➕",
    content: `
      <p><strong>Passo a passo para automatizar:</strong></p>
      <ol>
        <li><strong>Descrição:</strong> Ex: "Salário mensal", "Conta de luz"</li>
        <li><strong>Tipo:</strong> Receita (entra) ou Despesa (sai)</li>
        <li><strong>Valor:</strong> Quanto é o valor fixo</li>
        <li><strong>Categoria:</strong> Para organizar</li>
        <li><strong>Frequência:</strong> Com que frequência acontece</li>
        <li><strong>Data de Início:</strong> Quando começar a contar</li>
        <li><strong>Data de Fim:</strong> Quando parar (opcional)</li>
      </ol>
    `,
    analogy: "É como programar a cafeteira elétrica: você configura uma vez (que horas, quanto café, quantos dias) e ela faz automaticamente. A diferença é que aqui você está programando suas finanças!",
    tip: "Para gastos variáveis (como conta de luz), use a média dos últimos meses. É melhor ter uma estimativa automática do que esquecer de registrar!"
  },
  {
    title: "Recorrentes com Valor Fixo vs Variável 💰",
    content: `
      <p><strong>Nem tudo é sempre o mesmo valor:</strong></p>
      <h4>💰 Valor Fixo (fácil):</h4>
      <ul>
        <li>Aluguel: sempre R$ 800</li>
        <li>Plano de celular: sempre R$ 50</li>
        <li>Netflix: sempre R$ 25</li>
      </ul>
      <h4>📊 Valor Variável (use a média):</h4>
      <ul>
        <li>Conta de luz: varia entre R$ 80-120, use R$ 100</li>
        <li>Supermercado mensal: varia R$ 300-400, use R$ 350</li>
        <li>Combustível semanal: varia R$ 60-80, use R$ 70</li>
      </ul>
    `,
    analogy: "É como estimar quanto você gasta com comida por mês. Alguns dias você come mais, outros menos, mas você tem uma ideia da média. Use essa média para a recorrente e ajuste quando necessário.",
    tip: "Para valores variáveis, revise a cada 3 meses e ajuste se necessário. É melhor ter uma estimativa que se ajusta do que não ter controle nenhum!"
  },
  {
    title: "Gerenciando e Editando Recorrentes ✏️",
    content: `
      <p><strong>Mantenha suas recorrentes sempre atualizadas:</strong></p>
      <ul>
        <li><strong>✏️ Editar:</strong> Mudou o valor do aluguel? Só editar</li>
        <li><strong>⏸️ Pausar:</strong> Temporariamente inativo (ex: férias)</li>
        <li><strong>▶️ Reativar:</strong> Voltar a gerar automaticamente</li>
        <li><strong>🗑️ Excluir:</strong> Não precisa mais (ex: cancelou Netflix)</li>
        <li><strong>📅 Ajustar Datas:</strong> Mudar frequência ou período</li>
      </ul>
      <p>As transações já criadas não são afetadas quando você edita a recorrente!</p>
    `,
    analogy: "É como gerenciar as programações da sua TV. Você pode editar um programa gravado (mudar horário), pausar uma série temporariamente, ou cancelar de vez algo que não quer mais assistir.",
    tip: "Revise suas recorrentes mensalmente. A vida muda: você pode cancelar assinaturas, mudar de emprego, ou ter novos gastos fixos."
  },
  {
    title: "Executar Pendentes e Histórico 📋",
    content: `
      <p><strong>Controle total sobre o que foi e será criado:</strong></p>
      <ul>
        <li><strong>⚡ Executar Pendentes:</strong> Força a criação de transações em atraso</li>
        <li><strong>📊 Ver Histórico:</strong> Todas as transações já criadas por esta recorrente</li>
        <li><strong>🔍 Próximas Execuções:</strong> Quando será a próxima criação automática</li>
        <li><strong>📝 Status:</strong> Ativa, pausada, ou finalizada</li>
      </ul>
      <p>O sistema executa automaticamente, mas você tem controle total!</p>
    `,
    analogy: "É como ter um funcionário muito dedicado que anota suas contas, mas você é o chefe. Você pode ver o que ele já fez, o que ele vai fazer, e dar ordens específicas quando necessário.",
    tip: "Use 'Executar Pendentes' quando voltar de férias ou quando configurar uma recorrente que deveria ter começado no passado!"
  }
];

export const metasHelp: HelpStep[] = [
  {
    title: "Transformando Sonhos em Realidade 🎯",
    content: `
      <p><strong>Metas financeiras são seus sonhos com prazo e preço!</strong></p>
      <p>Em vez de só sonhar "quero uma viagem", você define: "quero R$ 3.000 para uma viagem até dezembro".</p>
      <p>O sistema te ajuda a acompanhar o progresso e se manter motivado!</p>
    `,
    analogy: "É como treinar para uma maratona. Você não só diz 'quero correr uma maratona', você define: 'quero correr 42km em 6 meses'. Depois treina um pouco todo dia até chegar lá. As metas financeiras funcionam igual!",
    tip: "Metas claras e específicas têm muito mais chance de serem alcançadas. Seja específico: não 'quero economizar', mas 'quero R$ 1.000 para emergências até junho'!"
  },
  {
    title: "Criando uma Nova Meta 🎯",
    content: `
      <p><strong>Transforme seu sonho em um plano:</strong></p>
      <ol>
        <li><strong>Nome da Meta:</strong> Ex: "Viagem para a praia", "Carro novo"</li>
        <li><strong>Valor Alvo:</strong> Quanto você precisa juntar</li>
        <li><strong>Data Limite:</strong> Até quando quer alcançar</li>
        <li><strong>Valor Inicial:</strong> Quanto já tem (se tiver)</li>
        <li><strong>Contribuição Mensal:</strong> Quanto planeja guardar por mês</li>
      </ol>
      <p>O sistema calcula automaticamente se é possível alcançar no prazo!</p>
    `,
    analogy: "É como fazer uma receita de bolo. Você precisa definir: que bolo quer (meta), quais ingredientes (quanto dinheiro), quando quer que fique pronto (prazo), e quantos ingredientes já tem em casa (valor inicial).",
    tip: "Seja realista! Se você ganha R$ 2.000 e gasta R$ 1.900, não defina uma meta de economizar R$ 500 por mês. Comece com R$ 50-100 e vá aumentando."
  },
  {
    title: "Tipos de Metas Inteligentes 💡",
    content: `
      <p><strong>Diferentes objetivos, diferentes estratégias:</strong></p>
      <ul>
        <li><strong>🚨 Emergência:</strong> 3-6 meses de gastos para imprevistos</li>
        <li><strong>🎁 Compras:</strong> Celular novo, móveis, eletrodomésticos</li>
        <li><strong>✈️ Experiências:</strong> Viagens, cursos, shows</li>
        <li><strong>🏠 Grandes Projetos:</strong> Casa própria, carro, casamento</li>
        <li><strong>📚 Educação:</strong> Cursos, faculdade, certificações</li>
        <li><strong>💰 Investimentos:</strong> Ações, fundos, aposentadoria</li>
      </ul>
    `,
    analogy: "É como ter diferentes potes na cozinha: um para açúcar (emergência), outro para farinha (viagem), outro para café (carro novo). Cada pote tem um propósito específico e você vai enchendo cada um conforme sua prioridade.",
    tip: "Comece SEMPRE com uma meta de emergência. Antes de sonhar com viagens, tenha pelo menos R$ 1.000 guardados para imprevistos!"
  },
  {
    title: "Contribuindo para suas Metas 💰",
    content: `
      <p><strong>Transforme pequenas quantias em grandes conquistas:</strong></p>
      <ul>
        <li><strong>➕ Contribuição Manual:</strong> Adicione dinheiro quando puder</li>
        <li><strong>🔄 Contribuição Automática:</strong> Todo mês na mesma data</li>
        <li><strong>💡 Dica do Sistema:</strong> Sugestão de quanto contribuir</li>
        <li><strong>🎉 Celebre Marcos:</strong> 25%, 50%, 75% conquistados</li>
      </ul>
      <p>Cada real conta para chegar ao seu objetivo!</p>
    `,
    analogy: "É como encher uma garrafa de água pingo a pingo. Cada pingo parece pequeno, mas se você for constante, a garrafa enche. R$ 10 hoje, R$ 20 na semana que vem, R$ 50 quando receber um extra...",
    tip: "Use a 'regra dos trocos': todo dinheiro 'extra' (troco, dinheiro achado, economia numa compra) vai direto para as metas. Você se surpreenderá com os resultados!"
  },
  {
    title: "Acompanhando o Progresso 📊",
    content: `
      <p><strong>Visualize sua caminhada rumo ao objetivo:</strong></p>
      <ul>
        <li><strong>📊 Barra de Progresso:</strong> Mostra quanto % já conquistou</li>
        <li><strong>📅 Dias Restantes:</strong> Quanto tempo falta</li>
        <li><strong>💰 Valor Faltante:</strong> Quanto ainda precisa</li>
        <li><strong>📈 Ritmo Atual:</strong> Se está no caminho certo</li>
        <li><strong>🎯 Sugestão de Contribuição:</strong> Quanto deveria guardar por mês</li>
      </ul>
      <p>O sistema te avisa se você está atrasado ou adiantado!</p>
    `,
    analogy: "É como usar GPS numa viagem. Ele mostra onde você está, quanto falta, se está no caminho certo, e se precisa acelerar ou pode ir mais devagar. Só que aqui a 'viagem' é até seu objetivo financeiro!",
    tip: "Olhe suas metas pelo menos uma vez por semana. A visualização constante do progresso aumenta muito a motivação para continuar!"
  },
  {
    title: "Estratégias para Alcançar Metas 🚀",
    content: `
      <p><strong>Dicas práticas para acelerar seus resultados:</strong></p>
      <ul>
        <li><strong>🎯 Metas Menores:</strong> Divida grandes objetivos em partes</li>
        <li><strong>💸 Reduza Gastos:</strong> Identifique onde pode economizar</li>
        <li><strong>💰 Renda Extra:</strong> Freelances, vendas, trabalhos extras</li>
        <li><strong>🔄 Automatize:</strong> Configure transferências automáticas</li>
        <li><strong>🎉 Celebre Conquistas:</strong> Comemore cada marco alcançado</li>
      </ul>
      <p>Consistência vale mais que valor alto!</p>
    `,
    analogy: "É como emagrecer: melhor perder 1kg por mês durante 10 meses do que tentar perder 10kg em 1 mês e desistir. Com dinheiro é igual: R$ 100 todo mês é melhor que R$ 1.000 uma vez só e depois nada.",
    tip: "Use a 'regra do 1%': se sua meta parece impossível, comece guardando apenas 1% do valor por mês. Quando virar hábito, aumente gradualmente!"
  }
];

export const dividasHelp: HelpStep[] = [
  {
    title: "Controlando suas Dívidas 💳",
    content: `
      <p><strong>Dívidas não precisam ser um pesadelo!</strong></p>
      <p>Com organização e controle, você pode quitar tudo de forma planejada e ainda evitar que elas cresçam descontroladamente.</p>
      <p>Esta seção te ajuda a ver o quadro completo e criar um plano de ação!</p>
    `,
    analogy: "Imagine suas dívidas como plantas num jardim. Se você não cuidar, elas crescem demais e tomam conta de tudo. Mas se você souber onde cada uma está, quanto água (dinheiro) precisa, e cuidar regularmente, consegue manter tudo sob controle.",
    tip: "Não esconda as dívidas! O primeiro passo para resolver um problema é encará-lo de frente. Liste tudo, mesmo que dê medo no início."
  },
  {
    title: "Cadastrando suas Dívidas 📝",
    content: `
      <p><strong>Organize todas as suas dívidas em um só lugar:</strong></p>
      <ol>
        <li><strong>Nome da Dívida:</strong> Ex: "Cartão Nubank", "Empréstimo Carro"</li>
        <li><strong>Valor Total:</strong> Quanto você deve no total</li>
        <li><strong>Valor das Parcelas:</strong> Quanto paga por mês</li>
        <li><strong>Número de Parcelas:</strong> Quantas restam</li>
        <li><strong>Taxa de Juros:</strong> Quanto % cobram por mês</li>
        <li><strong>Data de Vencimento:</strong> Quando vence cada parcela</li>
        <li><strong>Categoria:</strong> Tipo de dívida (cartão, financiamento, etc.)</li>
      </ol>
    `,
    analogy: "É como fazer uma ficha médica completa de cada 'doença' financeira. Você anota todos os sintomas (valores, juros, prazos) para o 'médico' (você mesmo) poder fazer o melhor 'tratamento' (plano de pagamento).",
    tip: "Pegue todos os boletos, extratos e contratos. Anote TUDO, até aquele empréstimo pequeno com um amigo. Só assim você terá a foto completa da situação."
  },
  {
    title: "Entendendo os Juros 📈",
    content: `
      <p><strong>Juros são o 'aluguel' do dinheiro que você deve:</strong></p>
      <ul>
        <li><strong>💰 Juros Simples:</strong> Valor fixo sobre o total (mais raro)</li>
        <li><strong>📈 Juros Compostos:</strong> Juros sobre juros (mais comum)</li>
        <li><strong>🔴 Rotativo do Cartão:</strong> Os juros mais altos (evite!)</li>
        <li><strong>🟡 Financiamentos:</strong> Juros médios, prazos longos</li>
        <li><strong>🟢 Empréstimos com Garantia:</strong> Juros menores</li>
      </ul>
      <p>Quanto maior o juros, mais urgente é quitar!</p>
    `,
    analogy: "Imagine que juros são como uma torneira pingando numa bacia. Se o pingo é pequeno (juros baixos), demora para encher. Se o pingo é grande (juros altos), a bacia enche rapidamente. Você quer fechar primeiro as torneiras que pingam mais!",
    tip: "Priorize SEMPRE as dívidas com juros mais altos. É matemática simples: eliminar 15% de juros do cartão faz mais diferença que eliminar 2% de um financiamento."
  },
  {
    title: "Estratégias de Quitação 🎯",
    content: `
      <p><strong>Duas estratégias principais comprovadas:</strong></p>
      <h4>⚡ Método Avalanche (Matemático):</h4>
      <ul>
        <li>Pague primeiro a dívida com MAIOR juro</li>
        <li>Economiza mais dinheiro no total</li>
        <li>Melhor para quem tem disciplina</li>
      </ul>
      <h4>🏔️ Método Bola de Neve (Psicológico):</h4>
      <ul>
        <li>Pague primeiro a MENOR dívida</li>
        <li>Gera motivação com vitórias rápidas</li>
        <li>Melhor para quem precisa de estímulo</li>
      </ul>
    `,
    analogy: "É como limpar a casa: você pode começar pelo quarto mais bagunçado (método avalanche) que vai dar mais trabalho mas resolver o maior problema, ou começar pelo banheiro pequeno (bola de neve) que termina rápido e te motiva a continuar.",
    tip: "Escolha o método que combina com sua personalidade. Se você precisa de motivação, use bola de neve. Se você é disciplinado e quer otimizar, use avalanche."
  },
  {
    title: "Renegociando Dívidas 🤝",
    content: `
      <p><strong>Muitas vezes você pode conseguir condições melhores:</strong></p>
      <ul>
        <li><strong>📞 Ligue para o Credor:</strong> Explique sua situação honestamente</li>
        <li><strong>💰 Desconto à Vista:</strong> Ofereça pagar tudo de uma vez</li>
        <li><strong>📅 Prazo Maior:</strong> Parcelas menores em mais tempo</li>
        <li><strong>📊 Juros Menores:</strong> Negocie uma taxa melhor</li>
        <li><strong>📝 Feirões de Negociação:</strong> Aproveite épocas especiais</li>
      </ul>
      <p>O pior 'não' você já tem. Vale a pena tentar!</p>
    `,
    analogy: "É como pechinchar numa feira. O vendedor (credor) prefere vender por um preço menor do que ficar com o produto encalhado (você não pagar nada). Eles têm interesse em negociar!",
    tip: "Antes de ligar, tenha uma proposta concreta: 'Posso pagar R$ X à vista' ou 'Posso pagar R$ Y em Z parcelas'. Seja específico e realista."
  },
  {
    title: "Evitando Novas Dívidas 🛡️",
    content: `
      <p><strong>Prevenção é melhor que cura:</strong></p>
      <ul>
        <li><strong>💳 Use Débito:</strong> Só gaste o que tem</li>
        <li><strong>📊 Controle o Orçamento:</strong> Saiba onde vai cada real</li>
        <li><strong>🚨 Fundo de Emergência:</strong> Para imprevistos</li>
        <li><strong>🎯 Compre com Propósito:</strong> Evite compras por impulso</li>
        <li><strong>📅 Pague em Dia:</strong> Evite juros e multas</li>
      </ul>
      <p>É muito mais fácil não se endividar do que sair das dívidas!</p>
    `,
    analogy: "É como cuidar da saúde: melhor comer bem e se exercitar (controlar gastos) do que precisar tomar remédios caros depois (pagar juros). Prevenção sempre custa menos que tratamento!",
    tip: "Toda vez que quiser comprar algo no cartão, pare e pense: 'Eu compraria isso à vista pelo mesmo preço?' Se a resposta for não, não compre!"
  }
];

export const helpContents = {
  dashboard: dashboardHelp,
  transacoes: transacoesHelp,
  categorias: categoriasHelp,
  recorrentes: recorrentesHelp,
  metas: metasHelp,
  dividas: dividasHelp
};
