# 🚂 Configuração Railway - Guia Passo a Passo

## 🎯 Por que Railway?
- ✅ **$5 gratuitos por mês** (suficiente para projetos pequenos/médios)
- ✅ **MySQL incluído** sem configuração complexa
- ✅ **Deploy automático** via GitHub
- ✅ **Interface simples** e intuitiva
- ✅ **Escalável** conforme necessário

## 🚀 Configuração Passo a Passo

### 1. Criar Conta
1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. Faça login com **GitHub** (recomendado)
4. Confirme sua conta por email se necessário

### 2. Criar Database MySQL
1. No dashboard, clique em **"New Project"**
2. Selecione **"Provision MySQL"**
3. Aguarde a criação (1-2 minutos)
4. O MySQL será criado automaticamente

### 3. Obter Connection String
1. Clique no **serviço MySQL** criado
2. Vá na aba **"Variables"**
3. Copie o valor de **`MYSQL_URL`**
4. Deve ser algo como: `mysql://root:password@containers-us-west-xxx.railway.app:6543/railway`

### 4. Configurar no Projeto
1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.mysql.example .env
   ```

2. **Cole a MYSQL_URL no .env:**
   ```env
   DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:6543/railway"
   NEXTAUTH_SECRET="409af273f8a747e3d5c642f033995d96"
   NEXTAUTH_URL="http://localhost:3000"
   ```

### 5. Aplicar Schema
```bash
npx prisma db push
```

### 6. Testar Conexão
```bash
npx prisma studio
```

## 🔧 Configuração Avançada

### Deploy Automático (Opcional)
1. No Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Conecte seu repositório
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Sua connection string MySQL
   - `NEXTAUTH_SECRET`: Seu secret
   - `NEXTAUTH_URL`: URL do deploy (ex: `https://meu-bolso-production.up.railway.app`)

### Monitoramento
- **Usage**: Veja quanto dos $5 você usou
- **Metrics**: CPU, RAM, Network
- **Logs**: Debug em tempo real

## 💰 Custos
- **Gratuito**: $5 de crédito mensal
- **Uso típico**: $1-3/mês para projetos pequenos
- **Se exceder**: $0.000463 por GB-hora

## 🛠️ Troubleshooting

### Erro de SSL
Se der erro de SSL, adicione parâmetros:
```env
DATABASE_URL="mysql://root:password@host:port/railway?ssl-mode=REQUIRED"
```

### Timeout de Conexão
Railway pode ter timeout. Configure no Prisma:
```javascript
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma" // Adicione esta linha
}
```

### Limites Atingidos
Se atingir o limite de $5:
1. Otimize queries
2. Adicione índices
3. Considere upgrade para $20/mês

## 🔄 Migração dos Dados

Após configurar o Railway:

1. **Exporte dados atuais** (se houver):
   ```bash
   node scripts/export-data.js
   ```

2. **Configure nova DATABASE_URL**

3. **Aplique schema**:
   ```bash
   npx prisma db push
   ```

4. **Importe dados**:
   ```bash
   node scripts/import-data.js backup/backup-[timestamp].json
   ```

## ✅ Verificação Final

Teste se tudo funcionou:
```bash
# Testar conexão
npx prisma db pull

# Gerar cliente
npx prisma generate

# Iniciar app
npm run dev
```

---

**🎉 Pronto!** Seu projeto agora está rodando no Railway com MySQL gratuito!