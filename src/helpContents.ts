// Create a new file to hold the help contents for each tab

const helpContents: Record<string, string> = {
  transacoes: `# Transações

Tutorial: /ajuda/transacoes.md

Objetivo: Ensinar como registrar receitas e despesas.

Tópicos abordados:

- Diferença entre receita e despesa
- Como preencher corretamente os campos
- Como usar categorias

Exemplo com imagens reais

Imagens usadas:

/docs/ajuda-transacoes-receita.png
/docs/ajuda-transacoes-despesa.png
`,
  dashboard: `# Dashboard Geral

Tutorial: /ajuda/dashboard.md

Objetivo: Ajudar o usuário a interpretar os gráficos e indicadores financeiros.

Tópicos abordados:

- Como entender o saldo total
- Análise de gastos por categoria
- Gráficos de pizza, colunas e linha
- Dicas sobre metas visuais

Imagens esperadas:

/docs/ajuda-dashboard-graficos.png
`,
  metas: `# Metas

Tutorial: /ajuda/metas.md

Objetivo: Explicar como criar, acompanhar e alcançar metas financeiras.

Tópicos abordados:

- Diferença entre meta mensal e de longo prazo
- Como definir valor, prazo e categoria
- Acompanhamento de progresso

Imagens esperadas:

/docs/ajuda-metas-exemplo.png
`,
  recorrentes: `# Transações Recorrentes

Tutorial: /ajuda/recorrentes.md

Objetivo: Ensinar a agendar receitas ou despesas fixas (ex: salário, aluguel).

Tópicos abordados:

- Como criar uma transação recorrente
- Frequência (mensal, semanal etc.)
- Cancelamento ou edição futura

Imagens esperadas:

/docs/ajuda-recorrente-exemplo.png
`,
  dividas: `# Dívidas e Parcelamentos (em planejamento)

Tutorial: /ajuda/dividas.md

Objetivo: Explicar como registrar e controlar dívidas parceladas.

Tópicos previstos:

- Como registrar uma dívida
- Quantidade de parcelas
- Juros embutidos (futuramente)
- Progresso do pagamento

Imagens previstas:

/docs/ajuda-divida-exemplo.png
`,
  default: `# Ajuda

Selecione uma aba para ver o tutorial de ajuda correspondente.`
}

export default helpContents
