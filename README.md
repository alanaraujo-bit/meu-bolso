# 💰 Meu Bolso

Uma aplicação completa de controle financeiro pessoal desenvolvida com Next.js, TypeScript e PostgreSQL.

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
- **Resumo Financeiro**: Visualização de receitas, despesas, saldo e economias
- **Gráficos Interativos**: Análise de gastos por categoria e evolução mensal
- **Contadores Detalhados**: Quantidade de transações e categorias ativas
- **Metas Ativas**: Acompanhamento do progresso das metas financeiras

### 💳 Gestão de Transações
- **Receitas e Despesas**: Controle completo de entradas e saídas
- **Categorização**: Organização por categorias personalizáveis
- **Filtros Avançados**: Por tipo, categoria, período e valor
- **Exportação CSV**: Download dos dados para análise externa
- **Paginação**: Navegação eficiente em grandes volumes de dados

### 🎯 Sistema de Metas
- **Metas Personalizadas**: Definição de objetivos financeiros
- **Acompanhamento**: Progresso visual com barras de progresso
- **Contribuições**: Adição de valores para alcançar as metas
- **Status Automático**: Controle de metas ativas, concluídas e vencidas

### 🔄 Transações Recorrentes
- **Automatização**: Criação de receitas e despesas recorrentes
- **Frequências**: Diária, semanal, mensal e anual
- **Execução Automática**: Processamento de transações pendentes
- **Controle de Status**: Ativação/desativação de recorrências

### 🏷️ Categorias Personalizáveis
- **Cores e Ícones**: Personalização visual das categorias
- **Tipos**: Receita, despesa ou ambos
- **Contadores**: Quantidade de transações por categoria
- **Gestão Completa**: CRUD completo de categorias

### 🔐 Autenticação e Segurança
- **NextAuth.js**: Sistema de autenticação robusto
- **Sessões Seguras**: Controle de acesso baseado em sessões
- **Proteção de Rotas**: APIs e páginas protegidas
- **Criptografia**: Senhas criptografadas com bcrypt

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com SSR e API Routes
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Framework CSS utilitário
- **Recharts**: Biblioteca para gráficos interativos
- **React Hooks**: Gerenciamento de estado moderno

### Backend
- **Next.js API Routes**: APIs RESTful integradas
- **Prisma ORM**: Mapeamento objeto-relacional
- **PostgreSQL**: Banco de dados relacional
- **NextAuth.js**: Autenticação e autorização
- **bcryptjs**: Criptografia de senhas

### Ferramentas de Desenvolvimento
- **ESLint**: Linting de código
- **TypeScript**: Verificação de tipos
- **Prisma Studio**: Interface visual do banco
- **Git**: Controle de versão

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
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
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/meubolso"

# NextAuth
NEXTAUTH_SECRET="409af273f8a747e3d5c642f033995d96"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Visualizar dados
npx prisma studio
```

### 5. Execute o projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📱 Como Usar

### 1. **Cadastro e Login**
- Crie uma conta ou faça login
- Acesse o dashboard principal

### 2. **Configure Categorias**
- Vá em "Categorias"
- Crie categorias para receitas e despesas
- Personalize cores e ícones

### 3. **Registre Transações**
- Acesse "Transações"
- Adicione receitas e despesas
- Categorize e adicione descrições

### 4. **Defina Metas**
- Vá em "Metas"
- Crie objetivos financeiros
- Acompanhe o progresso

### 5. **Configure Recorrências**
- Acesse "Recorrentes"
- Automatize transações repetitivas
- Execute transações pendentes

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/dashboard.png)

### Transações
![Transações](docs/transacoes.png)

### Metas
![Metas](docs/metas.png)

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Para frontend estático
- **Railway**: Para full-stack com banco
- **Heroku**: Para aplicações completas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Alan Araújo**
- GitHub: [@alanaraujo-bit](https://github.com/alanaraujo-bit)
- LinkedIn: [Alan Araújo](https://linkedin.com/in/alanaraujo-bit)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pela excelente framework
- [Prisma](https://prisma.io/) pelo ORM fantástico
- [Tailwind CSS](https://tailwindcss.com/) pelo design system
- [Vercel](https://vercel.com/) pela plataforma de deploy

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!