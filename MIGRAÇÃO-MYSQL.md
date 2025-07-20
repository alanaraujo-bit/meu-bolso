# 🔄 Guia de Migração para MySQL

Este guia te ajudará a migrar seu projeto do PostgreSQL (Supabase) para MySQL sem perder dados.

## 📋 Pré-requisitos

- Node.js instalado
- Acesso ao banco PostgreSQL atual
- Novo servidor MySQL configurado

## 🎯 Servidores MySQL Recomendados

### 1. **PlanetScale** (Mais Recomendado)
- ✅ Serverless e escalável
- ✅ Plano gratuito generoso (1GB, 1 bilhão de reads/mês)
- ✅ Branching de database
- ✅ Sem necessidade de gerenciar conexões
- 🔗 [planetscale.com](https://planetscale.com)

**Como configurar:**
1. Crie uma conta no PlanetScale
2. Crie um novo database
3. Obtenha a connection string
4. Configure no `.env`

### 2. **Railway**
- ✅ Deploy fácil
- ✅ $5 de crédito mensal gratuito
- ✅ Integração com GitHub
- 🔗 [railway.app](https://railway.app)

### 3. **Aiven**
- ✅ Managed MySQL
- ✅ Backup automático
- ✅ Múltiplas regiões
- 💰 1 mês grátis, depois pago
- 🔗 [aiven.io](https://aiven.io)

## 🚀 Processo de Migração

### Passo 1: Preparar a migração

```bash
# No Windows (PowerShell)
.\scripts\migrate-to-mysql.ps1

# No Linux/Mac
./scripts/migrate-to-mysql.sh
```

### Passo 2: Configurar novo banco MySQL

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.mysql.example .env
   ```

2. **Configure a DATABASE_URL no .env:**
   ```env
   # Para PlanetScale
   DATABASE_URL="mysql://username:password@host:3306/database_name?sslaccept=strict"
   
   # Para Railway
   DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:6543/railway"
   ```

### Passo 3: Aplicar schema no MySQL

```bash
npx prisma db push
```

### Passo 4: Importar dados

```bash
# Substitua pelo caminho do seu backup
node scripts/import-data.js backup/backup-1234567890.json
```

### Passo 5: Verificar migração

```bash
# Testar conexão
npx prisma db pull

# Gerar cliente Prisma
npx prisma generate

# Iniciar aplicação
npm run dev
```

## 🔧 Configurações Específicas por Provedor

### PlanetScale
```env
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict"
```

**Vantagens:**
- Sem necessidade de migrations tradicionais
- Branching para desenvolvimento
- Escalabilidade automática

### Railway
```env
DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:6543/railway"
```

**Configuração adicional:**
- Adicione variáveis de ambiente no painel Railway
- Configure deploy automático via GitHub

### Aiven
```env
DATABASE_URL="mysql://username:password@mysql-xxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED"
```

**Recursos extras:**
- Backup automático diário
- Monitoramento integrado
- Logs detalhados

## 🛠️ Troubleshooting

### Erro de conexão SSL
```env
# Adicione parâmetros SSL
DATABASE_URL="mysql://user:pass@host:port/db?ssl-mode=REQUIRED"
```

### Erro de timezone
```env
# Para PlanetScale/MySQL 8.0+
DATABASE_URL="mysql://user:pass@host:port/db?sslaccept=strict&timezone=UTC"
```

### Problemas com Decimal
O MySQL pode ter comportamento diferente com campos Decimal. Se houver problemas:

1. Verifique se os valores estão sendo salvos corretamente
2. Considere usar `@db.Decimal(10, 2)` no schema
3. Teste operações matemáticas

## 📊 Verificação Pós-Migração

Execute estes comandos para verificar se tudo funcionou:

```bash
# Contar registros
npx prisma studio

# Testar API
curl http://localhost:3000/api/test-db

# Verificar logs
npm run dev
```

## 🔒 Backup e Segurança

### Backup automático
Configure backup automático no seu provedor MySQL:

- **PlanetScale**: Backup automático incluído
- **Railway**: Configure via painel
- **Aiven**: Backup diário automático

### Variáveis de ambiente
Mantenha sempre:
```env
DATABASE_URL="sua_connection_string"
NEXTAUTH_SECRET="seu_secret_seguro"
NEXTAUTH_URL="https://seu-dominio.com"
```

## 🎉 Finalização

Após a migração bem-sucedida:

1. ✅ Teste todas as funcionalidades
2. ✅ Verifique se os dados estão íntegros
3. ✅ Configure backup automático
4. ✅ Atualize documentação
5. ✅ Monitore performance

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Prisma
2. Teste a conexão com `npx prisma db pull`
3. Consulte a documentação do seu provedor MySQL
4. Verifique se todas as dependências estão atualizadas

---

**Dica:** Mantenha o backup do PostgreSQL até ter certeza de que tudo está funcionando perfeitamente no MySQL!