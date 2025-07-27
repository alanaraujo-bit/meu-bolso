# 🛡️ Painel Administrativo - Meu Bolso

## 📋 Visão Geral

O painel administrativo foi desenvolvido para fornecer insights detalhados sobre o uso e performance do sistema Meu Bolso. Ele oferece métricas abrangentes para monitoramento e tomada de decisões.

## 🔐 Configuração de Acesso

### 1. Configurar Email do Administrador

Execute o script de configuração:
```powershell
powershell -ExecutionPolicy Bypass -File setup-admin.ps1
```

Ou configure manualmente editando os arquivos:
- `src/components/Navbar.tsx`
- `src/app/api/admin/metrics/route.ts`

Substitua `alan@exemplo.com` pelo seu email real.

### 2. Acessar o Painel

1. Faça login com o email configurado como administrador
2. O link "Admin" aparecerá automaticamente na barra de navegação
3. Clique em "Admin" para acessar o painel

## 📊 Métricas Disponíveis

### 👥 Métricas de Usuários
- **Total de usuários registrados**
- **Novos usuários (últimos 30 dias)**
- **Taxa de crescimento mensal**
- **Lista dos usuários mais recentes**

### 📈 Análise de Engajamento
- **Usuários ativos (últimos 7 dias)**
- **Usuários ativos (últimos 30 dias)**
- **Taxa de retenção**
- **Sessões médias por usuário**

### 💰 Estatísticas Financeiras
- **Volume total de transações**
- **Receitas vs. Despesas**
- **Ticket médio por transação**
- **Categorias mais utilizadas**

### 🔄 Métricas de Sistema
- **Total de transações**
- **Transações recorrentes ativas**
- **Metas criadas**
- **Dívidas registradas**

### 📅 Análise Temporal
- **Atividade por dia da semana**
- **Horários de pico de uso**
- **Tendências mensais**
- **Sazonalidade de transações**

## 🎯 Funcionalidades Especiais

### 📊 Gráficos Interativos
- Gráficos de linha para crescimento de usuários
- Gráficos de barras para engajamento
- Gráficos de pizza para distribuição financeira
- Gráficos de área para volume de transações

### 📋 Tabelas Detalhadas
- Lista de usuários com data de cadastro
- Atividade recente de transações
- Top categorias por volume
- Metas com maior engajamento

### 🔄 Atualização em Tempo Real
- Métricas atualizadas automaticamente
- Dados sempre sincronizados
- Performance otimizada com cache

## 🛠️ Manutenção

### Adicionar Novos Administradores
1. Edite a lista `ADMIN_EMAILS` nos arquivos:
   - `src/components/Navbar.tsx`
   - `src/app/api/admin/metrics/route.ts`
2. Adicione o email na lista
3. Reinicie o servidor

### Personalizar Métricas
- As métricas estão em `/api/admin/metrics/route.ts`
- Você pode adicionar novos cálculos e consultas
- O dashboard está em `/admin/page.tsx`

## 🔒 Segurança

- ✅ Autenticação obrigatória
- ✅ Verificação de email administrativo
- ✅ Acesso restrito por sessão
- ✅ Dados protegidos por middleware

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique se o email está configurado corretamente
2. Confirme que está logado com o email de administrador
3. Reinicie o servidor se necessário
4. Verifique os logs do console para erros

## 🚀 Próximas Funcionalidades

- [ ] Exportação de relatórios PDF
- [ ] Alertas automáticos por email
- [ ] Dashboard personalizado por usuário
- [ ] Métricas de performance técnica
- [ ] Backup automático de dados
