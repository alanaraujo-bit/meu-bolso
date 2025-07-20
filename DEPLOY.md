# Configuração para Deploy no Vercel

## 1. Banco de Dados (Escolha uma opção):

### Opção A - Neon (Recomendado - Gratuito)
1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string que será algo como:
   `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Opção B - Supabase (Alternativa - Gratuito)
1. Acesse: https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em Settings > Database
5. Copie a connection string

## 2. Variáveis de Ambiente no Vercel

No painel do Vercel, vá em Settings > Environment Variables e adicione:

### DATABASE_URL
- Name: `DATABASE_URL`
- Value: `sua-connection-string-do-banco`
- Environment: Production, Preview, Development

### NEXTAUTH_SECRET
- Name: `NEXTAUTH_SECRET`
- Value: Gere em https://generate-secret.vercel.app/32
- Environment: Production, Preview, Development

### NEXTAUTH_URL
- Name: `NEXTAUTH_URL`
- Value: `https://seu-projeto.vercel.app`
- Environment: Production, Preview

## 3. Após configurar as variáveis:
1. Vá em Deployments
2. Clique nos três pontos do último deployment
3. Clique em "Redeploy"

## 4. Executar migrações do banco:
Após o deploy, você precisará executar as migrações do Prisma.
Isso pode ser feito através de um script ou manualmente conectando ao banco.