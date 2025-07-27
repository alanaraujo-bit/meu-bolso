# 💰 Meu Bolso

Uma aplicação completa de controle financeiro pessoal desenvolvida com Next.js, TypeScript e MySQL, com sistema administrativo avançado para gestão completa de usuários e dados.

## 🚀 Funcionalidades Principais

### 📊 Dashboard Inteligente
- **Resumo Financeiro Completo**: Visualização de receitas, despesas, saldo e economias
- **Gráficos Interativos Avançados**: Análise de gastos por categoria e evolução mensal
- **Contadores Detalhados**: Quantidade de transações, categorias ativas e metas
- **Metas Ativas**: Acompanhamento do progresso das metas financeiras
- **Alertas e Notificações**: Sistema de avisos para transações importantes

### 💳 Gestão Avançada de Transações
- **Receitas e Despesas**: Controle completo de entradas e saídas
- **Categorização Inteligente**: Organização por categorias personalizáveis com cores e ícones
- **Filtros Super Avançados**: Por tipo, categoria, período, valor e status
- **Exportação Completa**: Download em CSV e outros formatos
- **Paginação Inteligente**: Navegação eficiente em grandes volumes de dados
- **Busca Avançada**: Sistema de pesquisa por descrição e valores

### 🎯 Sistema Completo de Metas
- **Metas Personalizadas**: Definição de objetivos financeiros detalhados
- **Acompanhamento Visual**: Progresso com barras e gráficos interativos
- **Contribuições Flexíveis**: Adição de valores parciais para alcançar metas
- **Status Automático**: Controle de metas ativas, concluídas, pausadas e vencidas
- **Histórico de Contribuições**: Rastreamento completo das contribuições

### 🔄 Sistema de Transações Recorrentes
- **Automatização Completa**: Criação de receitas e despesas recorrentes
- **Frequências Variadas**: Diária, semanal, quinzenal, mensal, bimestral, trimestral, semestral e anual
- **Execução Automática**: Processamento inteligente de transações pendentes
- **Controle de Status**: Ativação/desativação individual de recorrências
- **Previsões Financeiras**: Projeção de receitas e despesas futuras
- **Execução em Lote**: Processamento de múltiplas transações de uma vez

### � Sistema de Dívidas e Parcelas
- **Gestão de Dívidas**: Controle completo de valores devidos
- **Parcelamento Inteligente**: Divisão automática em parcelas
- **Acompanhamento de Status**: Controle de parcelas pagas, pendentes e vencidas
- **Estatísticas de Dívidas**: Análise completa do endividamento

### 🏷️ Categorias Totalmente Personalizáveis
- **Cores e Ícones**: Personalização visual completa das categorias
- **Tipos Flexíveis**: Receita, despesa ou ambos
- **Contadores Automáticos**: Quantidade de transações por categoria
- **Gestão Completa**: CRUD completo com validações
- **Criação Rápida**: Sistema de criação instantânea de categorias

### 👑 Sistema Administrativo Completo
- **Dashboard Administrativo**: Painel de controle completo para admins
- **Gestão de Usuários**: Visualização, edição e controle de todos os usuários
- **Analytics Avançado**: Estatísticas completas de uso da plataforma
- **Relatórios Detalhados**: Exportação de dados e relatórios gerenciais
- **Monitoramento em Tempo Real**: Acompanhamento de atividades do sistema
- **Configurações Globais**: Controle de configurações da plataforma
- **Comunicação**: Sistema de mensagens e notificações para usuários
- **Métricas Financeiras**: Análise financeira global de todos os usuários
- **Backup e Exportação**: Sistema completo de backup de dados

### 🔐 Autenticação e Segurança Avançada
- **NextAuth.js**: Sistema de autenticação robusto e seguro
- **Sessões Protegidas**: Controle de acesso baseado em sessões JWT
- **Proteção de Rotas**: Middleware para proteção de APIs e páginas
- **Criptografia**: Senhas criptografadas com bcrypt
- **Níveis de Acesso**: Sistema de permissões admin/usuário
- **Reset de Senha**: Sistema automático de recuperação de senhas
- **Criação Automática**: Sistema failsafe para criação de usuários admin

### 📱 Interface e Experiência do Usuário
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Loading Personalizado**: Animações customizadas de carregamento
- **Navegação Intuitiva**: Menu lateral moderno e intuitivo
- **Temas e Cores**: Sistema de cores consistente e profissional
- **Feedback Visual**: Alertas, toasts e confirmações visuais
- **Ajuda Contextual**: Sistema de ajuda integrado em cada página

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com SSR, SSG e API Routes
- **TypeScript**: Tipagem estática para maior segurança e produtividade
- **Tailwind CSS**: Framework CSS utilitário para design moderno
- **Recharts**: Biblioteca para gráficos interativos e responsivos
- **React Hooks**: Gerenciamento de estado moderno e eficiente
- **Lucide React**: Biblioteca de ícones moderna e consistente

### Backend
- **Next.js API Routes**: APIs RESTful integradas e otimizadas
- **Prisma ORM**: Mapeamento objeto-relacional type-safe
- **MySQL**: Banco de dados relacional robusto e escalável
- **NextAuth.js**: Sistema completo de autenticação e autorização
- **bcryptjs**: Criptografia segura de senhas

### Ferramentas de Desenvolvimento
- **ESLint**: Linting avançado de código
- **TypeScript**: Verificação estática de tipos
- **Prisma Studio**: Interface visual para gerenciamento do banco
- **Git**: Controle de versão distribuído
- **Vercel**: Plataforma de deploy automático

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- MySQL 8.0+
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/alanaraujo-bit/meu-bolso.git
cd meu-bolso
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Database MySQL
DATABASE_URL="mysql://usuario:senha@localhost:3306/meubolso"

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# (Opcional) Visualizar dados
npx prisma studio
```

### 5. Execute o projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📱 Como Usar

### 1. **Acesso ao Sistema**
- **Usuário Normal**: Cadastre-se ou faça login
- **Administrador**: Acesse `/admin` com credenciais administrativas

### 2. **Configure seu Perfil Financeiro**
- Crie categorias personalizadas para suas receitas e despesas
- Configure transações recorrentes (salário, contas fixas, etc.)
- Defina suas metas financeiras

### 3. **Gestão Diária**
- Registre suas transações do dia a dia
- Acompanhe o progresso das suas metas
- Execute transações recorrentes pendentes

### 4. **Análise e Relatórios**
- Visualize gráficos e estatísticas no dashboard
- Exporte dados para análise externa
- Monitore seu progresso financeiro

### 5. **Funcionalidades Admin (Para Administradores)**
- Gerencie usuários da plataforma
- Visualize métricas globais
- Configure parâmetros do sistema
- Gere relatórios administrativos

## 🎨 Screenshots

### Dashboard Principal
![Dashboard](docs/dashboard.png)

### Sistema Administrativo
![Admin Dashboard](docs/admin-dashboard.png)

### Gestão de Transações
![Transações](docs/transacoes.png)

### Sistema de Metas
![Metas](docs/metas.png)

### Transações Recorrentes
![Recorrentes](docs/recorrentes.png)

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Configure banco MySQL (PlanetScale recomendado)
4. Deploy automático a cada push na branch main

### Outras Plataformas
- **Railway**: Para full-stack com banco MySQL integrado
- **DigitalOcean**: Para VPS com controle total
- **AWS**: Para infraestrutura empresarial

### Configuração de Produção
```env
# Produção
DATABASE_URL="sua-url-mysql-producao"
NEXTAUTH_SECRET="secret-super-seguro-producao"
NEXTAUTH_URL="https://seudominio.com"
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting

# Banco de dados
npm run db:generate  # Gera cliente Prisma
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre Prisma Studio
npm run db:reset     # Reset completo do banco
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Alan Araújo**
- GitHub: [@alanaraujo-bit](https://github.com/alanaraujo-bit)
- LinkedIn: [Alan Araújo](https://linkedin.com/in/alanaraujo-bit)
- Email: contato@alanaraujo.dev

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pela framework fantástica
- [Prisma](https://prisma.io/) pelo ORM excepcional
- [Tailwind CSS](https://tailwindcss.com/) pelo sistema de design
- [Vercel](https://vercel.com/) pela plataforma de deploy
- [MySQL](https://mysql.com/) pela robustez do banco de dados

## 📈 Estatísticas do Projeto

- ✅ **12 Páginas Administrativas** completas
- ✅ **30+ APIs** desenvolvidas
- ✅ **Sistema de Autenticação** robusto
- ✅ **Interface Responsiva** para todos os dispositivos
- ✅ **Dashboard Analítico** com métricas em tempo real
- ✅ **Sistema de Backup** e exportação de dados

---

⭐ **Se este projeto te ajudou a organizar suas finanças, considere dar uma estrela no repositório!**

💰 **Controle suas finanças de forma inteligente e moderna com o Meu Bolso!**