# 🌟 Clever Cloud - MySQL 100% Gratuito

## 🎯 Por que Clever Cloud?
- ✅ **100% gratuito permanente**
- ✅ **1GB storage + 256MB RAM**
- ✅ **MySQL 8.0**
- ✅ **Backup automático**
- ✅ **SSL/TLS incluído**
- ✅ **Sem cartão de crédito necessário**

## 🚀 Configuração Passo a Passo

### 1. Criar Conta
1. Acesse: https://clever-cloud.com
2. Clique em **"Sign up for free"**
3. Faça cadastro com email ou GitHub
4. Confirme seu email

### 2. Criar MySQL Database
1. No console, clique em **"Create an application"**
2. Selecione **"MySQL"**
3. Escolha a região mais próxima (Europe West geralmente é boa)
4. Nome: `meu-bolso-db` (ou o que preferir)
5. Clique em **"Create"**

### 3. Obter Credenciais
1. Vá na aba **"Environment variables"**
2. Você verá as variáveis:
   - `MYSQL_ADDON_HOST`
   - `MYSQL_ADDON_PORT`
   - `MYSQL_ADDON_DB`
   - `MYSQL_ADDON_USER`
   - `MYSQL_ADDON_PASSWORD`

### 4. Montar Connection String
Formato: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

Exemplo:
```
mysql://u1a2b3c4d5e6f7g8:h9i0j1k2l3m4n5o6@mysql-clever-cloud.com:3306/b1a2b3c4d5e6f7g8
```

## 📋 Limites do Plano Gratuito
- **Storage**: 1GB
- **RAM**: 256MB
- **Conexões**: 10 simultâneas
- **Backup**: Automático (7 dias)
- **Uptime**: 99.9%

## 🔧 Configuração no Projeto

1. **Configure o .env:**
   ```env
   DATABASE_URL="mysql://user:password@mysql-clever-cloud.com:3306/database"
   NEXTAUTH_SECRET="409af273f8a747e3d5c642f033995d96"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Aplique o schema:**
   ```bash
   npx prisma db push
   ```

3. **Teste a conexão:**
   ```bash
   npx prisma studio
   ```

---

**💡 Dica**: Para projetos maiores, você pode fazer upgrade para planos pagos, mas o gratuito é suficiente para desenvolvimento e projetos pequenos!