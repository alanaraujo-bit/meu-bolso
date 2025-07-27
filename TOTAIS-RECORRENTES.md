# Visualização de Totais de Transações Recorrentes

## Funcionalidade Implementada

### 🎯 Objetivo
Fornecer uma visualização completa dos totais de transações recorrentes por mês, incluindo receitas, despesas e saldos projetados, para auxiliar no planejamento financeiro a longo prazo.

## 📋 Funcionalidades

### 1. API de Totais Recorrentes
- **Endpoint**: `GET /api/recorrentes/totais`
- **Parâmetros**:
  - `meses` (opcional): Número de meses para projeção (padrão: 12)
- **Funcionalidades**:
  - Calcula projeções baseadas nas frequências das transações recorrentes
  - Agrupa dados por mês e categoria
  - Fornece estatísticas resumidas
  - Análise por frequência de recorrência

### 2. Componente de Visualização
- **Localização**: `src/components/TotaisRecorrentes.tsx`
- **Funcionalidades**:
  - Tabela com dados mensais detalhados
  - Estatísticas resumidas (médias, melhor/pior mês)
  - Modal de detalhes por mês com breakdown por categoria
  - Seleção de período (6, 12, 24 meses)
  - Interface responsiva e intuitiva

### 3. Integração na Página de Recorrentes
- **Botão**: "📊 Ver Totais" no header da página
- **Modal**: Overlay completo com visualização dos dados
- **Contextual**: Integrado naturalmente no fluxo da aplicação

## 🔧 Como Usar

### Na Página de Transações Recorrentes
1. Acesse a aba "Transações Recorrentes"
2. Clique no botão "📊 Ver Totais" no topo da página
3. Visualize os dados mensais na tabela
4. Clique em "Detalhes" em qualquer mês para ver breakdown por categoria
5. Use o seletor de período para alterar a projeção (6, 12 ou 24 meses)

## 📊 Dados Disponíveis

### Resumo Estatístico
- **Receitas/mês**: Média mensal de receitas recorrentes
- **Despesas/mês**: Média mensal de despesas recorrentes  
- **Saldo médio**: Diferença média entre receitas e despesas
- **Transações/mês**: Número médio de transações por mês

### Informações Gerais
- **Recorrentes Ativas**: Total de transações recorrentes configuradas
- **Melhor Mês**: Mês com maior saldo projetado
- **Pior Mês**: Mês com menor saldo projetado

### Dados Mensais
Para cada mês futuro:
- Total de receitas projetadas
- Total de despesas projetadas
- Saldo líquido
- Número de transações previstas
- Breakdown por categoria

### Detalhes por Mês
Ao clicar em "Detalhes":
- Resumo financeiro do mês
- Lista de categorias com valores
- Separação entre receitas e despesas por categoria

## 🎨 Interface Visual

### Tabela Principal
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Totais de Transações Recorrentes          [12 meses ▼]  │
├─────────────────────────────────────────────────────────────┤
│ Receitas/mês    Despesas/mês    Saldo médio   Transações/mês│
│   R$ 5.000,00     R$ 3.200,00    R$ 1.800,00       12      │
├─────────────────────────────────────────────────────────────┤
│ Mês      Receitas    Despesas     Saldo     Transações  [Det]│
│ Jul 2025  R$ 5.000   R$ 3.100    R$ 1.900      11      [>] │
│ Ago 2025  R$ 5.000   R$ 3.200    R$ 1.800      12      [>] │
│ Set 2025  R$ 5.000   R$ 3.200    R$ 1.800      12      [>] │
└─────────────────────────────────────────────────────────────┘
```

### Modal de Detalhes
```
┌─────────────────────────────────────────────────────────────┐
│ Detalhes de Julho 2025                                  ✕  │
├─────────────────────────────────────────────────────────────┤
│ R$ 5.000,00    R$ 3.100,00    R$ 1.900,00                 │
│ 8 receitas     3 despesas     Saldo                        │
├─────────────────────────────────────────────────────────────┤
│ Por Categoria                                               │
│ 💰 Salário              +R$ 5.000,00                       │
│ 🏠 Aluguel                         -R$ 1.500,00            │
│ 📱 Internet                        -R$ 100,00              │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Lógica de Cálculo

### Projeção de Frequências
O sistema calcula automaticamente as ocorrências futuras baseado na frequência:

- **Diária**: +1 dia
- **Semanal**: +7 dias  
- **Quinzenal**: +15 dias
- **Mensal**: +1 mês
- **Trimestral**: +3 meses
- **Semestral**: +6 meses
- **Anual**: +1 ano

### Validação de Períodos
- Respeita `dataInicio` e `dataFim` das transações recorrentes
- Considera apenas transações ativas (`isActive: true`)
- Evita duplicações de transações já executadas

### Agregação por Categoria
- Agrupa valores por categoria
- Separa receitas e despesas
- Conta número de transações por tipo
- Ordena categorias por valor total

## 🚀 Benefícios

### Para o Usuário
- ✅ **Planejamento a Longo Prazo**: Visualização de até 24 meses futuros
- ✅ **Identificação de Tendências**: Padrões de receitas e despesas
- ✅ **Controle de Categorias**: Breakdown detalhado por categoria
- ✅ **Tomada de Decisão**: Dados para ajustar transações recorrentes

### Para o Sistema
- ✅ **Performance Otimizada**: Cálculos eficientes sem consultas pesadas
- ✅ **Escalabilidade**: Suporta múltiplas frequências e períodos
- ✅ **Flexibilidade**: Períodos configuráveis (6, 12, 24 meses)
- ✅ **Consistência**: Usa mesma lógica do dashboard principal

## 📈 Métricas e Insights

### Estatísticas Automáticas
- Taxa de crescimento mensal
- Identificação de meses críticos
- Comparação entre períodos
- Análise de sazonalidade

### Alertas Visuais
- Mês atual destacado em azul
- Saldos negativos em vermelho
- Saldos positivos em verde
- Categorias ordenadas por impacto

## 💡 Próximas Melhorias

### Funcionalidades Futuras
- [ ] **Gráficos Visuais**: Charts de linha e barras para tendências
- [ ] **Exportação**: PDF/Excel dos dados projetados
- [ ] **Alertas**: Notificações de meses com saldo negativo
- [ ] **Comparação**: Cenários "E se" para diferentes configurações
- [ ] **Histórico**: Comparação com execuções reais passadas

### Melhorias de UX
- [ ] **Filtros Avançados**: Por categoria, tipo, frequência
- [ ] **Busca**: Localizar transações específicas
- [ ] **Favoritos**: Salvar configurações de visualização
- [ ] **Compartilhamento**: Links para compartilhar projeções

## 🔧 Implementação Técnica

### Endpoint da API
```typescript
// GET /api/recorrentes/totais?meses=12
{
  success: true,
  periodo: { meses: 12, dataInicio: "...", dataFim: "..." },
  dadosMensais: [...],
  estatisticas: { ... },
  analiseFrequencia: { ... },
  recorrentesAtivas: [...]
}
```

### Estrutura de Dados
```typescript
interface DadosMensal {
  mes: number;
  ano: number;
  mesNome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  contadorReceitas: number;
  contadorDespesas: number;
  categorias: CategoriaDetalhes[];
}
```

### Performance
- Cálculos em memória (sem consultas DB pesadas)
- Cache de categorias
- Otimização de loops de frequência
- Lazy loading de detalhes por mês

---

**Status**: ✅ Implementado e funcionando
**Versão**: 1.0
**Data**: Janeiro 2025
**Integração**: Página de Transações Recorrentes
