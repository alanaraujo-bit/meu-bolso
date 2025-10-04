# ✅ Migração para Railway - Status

## 📊 Configuração Concluída

### Arquivos Criados/Atualizados:

1. ✅ `.env` - Credenciais Railway (produção)
2. ✅ `.env.local` - Credenciais Railway (desenvolvimento local)
3. ✅ `migrate-to-railway.js` - Script Node.js de migração (RECOMENDADO)
4. ✅ `migrate-to-railway.ps1` - Script PowerShell alternativo
5. ✅ `MIGRAÇÃO-RAILWAY.md` - Guia completo de migração

### Credenciais Railway Configuradas:

**Banco de Dados MySQL Railway:**
- Host Público: `monorote.proxy.rlwy.net:38165`
- Host Interno: `mysql.railway.internal:3306`
- Database: `railway`
- User: `root`
- Password: `YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy`

**Banco Antigo (VPS) - Backup:**
- Host: `148.230.72.122:3306`
- Database: `meu_bolso_db`
- User: `alanaraujo`

## 🚀 Próximos Passos

### 1️⃣ Executar a Migração (ESCOLHA UMA OPÇÃO):

#### Opção A: Migração Automática (RECOMENDADO) ⭐
```powershell
# Criar schema no Railway
npx prisma migrate deploy

# Migrar todos os dados
node migrate-to-railway.js
```

#### Opção B: Migração via mysqldump
```powershell
.\migrate-to-railway.ps1
```

### 2️⃣ Verificar os Dados
```powershell
npx prisma studio
```

### 3️⃣ Testar Localmente
```powershell
npm run dev
```

### 4️⃣ Atualizar Produção

**No Vercel/Railway (Variáveis de Ambiente):**
```env
DATABASE_URL=mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@mysql.railway.internal:3306/railway
NEXTAUTH_SECRET=34165e9413d77d1c28dbb61d1703f7bc2
NEXTAUTH_URL=https://www.appmeubolso.com.br
```

### 5️⃣ Deploy
```powershell
git add .
git commit -m "Migração para Railway concluída"
git push origin main
```

## 📝 Importante

### URLs de Conexão:

**Desenvolvimento Local (já configurado no .env.local):**
```
mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway
```

**Produção (usar no Vercel):**
```
mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@mysql.railway.internal:3306/railway
```

## ⚠️ Checklist Antes de Desligar VPS

- [ ] Migração executada com sucesso
- [ ] Dados verificados no Prisma Studio
- [ ] App testado localmente (login, transações funcionando)
- [ ] Backup final do banco VPS realizado
- [ ] Variáveis de ambiente atualizadas na produção
- [ ] Deploy realizado e testado
- [ ] App em produção funcionando 100%
- [ ] Aguardar 7 dias antes de desativar o banco antigo (segurança)

## 🎯 Status Atual

- ✅ Prisma Client gerado
- ✅ Arquivos de configuração criados
- ✅ Scripts de migração prontos
- ⏳ Aguardando execução da migração

## 📞 Comando Rápido para Começar

Execute este comando único para fazer tudo:

```powershell
cd "c:\Users\Alan Araújo\OneDrive\Documentos\Meu-Bolso\meu-bolso" ; npx prisma migrate deploy ; node migrate-to-railway.js
```

---

**Data:** 04/10/2025
**Próximo passo:** Executar a migração
