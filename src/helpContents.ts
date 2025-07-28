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
  dividas: `# Controle de Dívidas - Sistema Completo

Tutorial: /ajuda/dividas.md

Objetivo: Explicar como registrar, controlar e gerenciar dívidas parceladas com sistema completo de análise.

## ✅ Funcionalidades Implementadas:

### 📝 Cadastro de Dívidas
- Nome da dívida (ex: Cartão Nubank, Financiamento)
- Valor de cada parcela
- Quantidade total de parcelas
- Categorização opcional
- Cálculo automático do valor total

### 📊 Dashboard e Estatísticas
- Total de dívidas (ativas e quitadas)
- Valor total e valor restante
- Progresso de pagamento em percentual
- Contagem de parcelas vencidas

### 🎯 Sistema de Insights Inteligentes
- **Performance**: Análise de progresso de pagamentos
- **Endividamento**: Avaliação de concentração de dívidas
- **Planejamento**: Projeções de pagamentos futuros
- **Alertas**: Identificação de parcelas vencidas
- **Oportunidades**: Sugestões de quitação antecipada
- **Riscos**: Identificação de problemas financeiros
- **Estratégias**: Recomendações de reorganização

### ⚙️ Funcionalidades de Controle
- Edição completa de dívidas existentes
- Exclusão de dívidas
- Filtros por status (ativa/quitada)
- Visualização detalhada de cada dívida
- Barra de progresso visual

### 📱 Interface Responsiva
- Otimizada para celular e desktop
- Cards organizados e informativos
- Navegação intuitiva
- Loading screens suaves

## 🔧 Como Usar:

1. **Cadastrar Nova Dívida**: Clique em "Nova Dívida"
2. **Preencher Dados**: Nome, valor da parcela e quantidade
3. **Categorizar**: Selecione uma categoria (opcional)
4. **Acompanhar**: Use insights para monitorar progresso
5. **Editar**: Clique no ícone de edição para modificar
6. **Filtrar**: Use filtros para organizar visualização

Imagens previstas:

/docs/ajuda-divida-cadastro.png
/docs/ajuda-divida-dashboard.png
/docs/ajuda-divida-insights.png
/docs/ajuda-divida-edicao.png`,
  default: `# Ajuda

Selecione uma aba para ver o tutorial de ajuda correspondente.`
}

export default helpContents
