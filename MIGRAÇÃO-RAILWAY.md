# 🚀 Guia de Migração: MySQL VPS → Railway

## 📋 Pré-requisitos

✅ Banco Railway criado e configurado
✅ Credenciais do Railway anotadas
✅ Backup do banco antigo (recomendado)

## 🔧 Configuração

### 1. Variáveis de Ambiente Configuradas

Os arquivos `.env` e `.env.local` já foram atualizados com as credenciais do Railway:

**Banco Antigo (VPS):**
- Host: 148.230.72.122:3306
- Database: meu_bolso_db
- User: alanaraujo

**Banco Novo (Railway):**
- Host Interno: mysql.railway.internal:3306
- Host Público: monorote.proxy.rlwy.net:38165
- Database: railway
- User: root

## 🎯 Opções de Migração

### Opção 1: Migração Automática via Script Node.js (RECOMENDADO)

Este método usa o Prisma e garante total compatibilidade:

```powershell
# 1. Instalar dependências (se necessário)
npm install

# 2. Gerar o Prisma Client
npx prisma generate

# 3. Criar o schema no Railway
$env:DATABASE_URL="mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway"
npx prisma migrate deploy

# 4. Executar a migração de dados
node migrate-to-railway.js
```

**Vantagens:**
- ✅ Mais confiável
- ✅ Mantém relacionamentos
- ✅ Preserva IDs originais
- ✅ Relatório detalhado

### Opção 2: Migração via mysqldump (Requer MySQL instalado)

```powershell
# Execute o script PowerShell
.\migrate-to-railway.ps1
```

**Requer:** MySQL Client instalado no Windows

### Opção 3: Migração Manual via Prisma Studio

```powershell
# 1. Abrir Prisma Studio do banco ANTIGO
$env:DATABASE_URL="mysql://alanaraujo:MysqL_2025_segura@148.230.72.122:3306/meu_bolso_db"
npx prisma studio

# 2. Exportar dados manualmente (copiar)

# 3. Abrir Prisma Studio do banco NOVO
$env:DATABASE_URL="mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway"
npx prisma studio

# 4. Importar dados manualmente (colar)
```

## 📝 Passo a Passo Detalhado (Opção 1 - Recomendado)

### Passo 1: Preparar o Banco Railway

```powershell
# Navegar até o projeto
cd "c:\Users\Alan Araújo\OneDrive\Documentos\Meu-Bolso\meu-bolso"

# Configurar a URL do Railway
$env:DATABASE_URL="mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway"

# Executar as migrations no Railway
npx prisma migrate deploy
```

### Passo 2: Executar a Migração

```powershell
# Executar o script de migração
node migrate-to-railway.js
```

O script irá:
1. ✅ Conectar aos dois bancos
2. ✅ Buscar todos os dados do banco antigo
3. ✅ Migrar usuários
4. ✅ Migrar categorias
5. ✅ Migrar transações
6. ✅ Migrar recorrentes
7. ✅ Migrar metas
8. ✅ Migrar dívidas e parcelas
9. ✅ Verificar a integridade

### Passo 3: Verificar os Dados

```powershell
# Abrir Prisma Studio para verificar
npx prisma studio
```

### Passo 4: Testar Localmente

```powershell
# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Passo 5: Atualizar Produção

Depois de confirmar que tudo está funcionando:

1. **Atualizar variáveis no Vercel/servidor:**
   ```
   DATABASE_URL=mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway
   ```

2. **Fazer deploy:**
   ```powershell
   git add .
   git commit -m "Migração para Railway concluída"
   git push origin main
   ```

## ⚠️ Importante

### URLs de Conexão

**Para desenvolvimento local:**
Use a URL PÚBLICA do Railway (já está no `.env.local`):
```
mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway
```

**Para produção (Vercel):**
Use a URL INTERNA do Railway:
```
mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@mysql.railway.internal:3306/railway
```

### Backup

Antes de desligar o banco antigo, faça um backup final:

```powershell
# Usando o script Node.js (cria JSON de backup)
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient({ datasources: { db: { url: 'mysql://alanaraujo:MysqL_2025_segura@148.230.72.122:3306/meu_bolso_db' } } }); async function backup() { const fs = require('fs'); const data = { usuarios: await prisma.usuario.findMany({ include: { categorias: true, transacoes: true, transacoesRecorrentes: true, metas: true, dividas: { include: { parcelas: true } } } }) }; fs.writeFileSync('backup_final.json', JSON.stringify(data, null, 2)); console.log('Backup salvo em backup_final.json'); await prisma.$disconnect(); } backup();"
```

## 🎉 Checklist Final

Antes de considerar a migração completa:

- [ ] Script de migração executado sem erros
- [ ] Dados verificados no Prisma Studio
- [ ] Aplicação testada localmente (login, transações, etc)
- [ ] Backup do banco antigo realizado
- [ ] Variáveis de ambiente atualizadas na produção
- [ ] Deploy realizado com sucesso
- [ ] Aplicação em produção testada
- [ ] Banco antigo mantido por 7 dias (segurança)

## 🆘 Problemas Comuns

### Erro de Conexão Local

**Problema:** Não consegue conectar do PC ao Railway

**Solução:** Certifique-se de usar a URL PÚBLICA:
```
monorote.proxy.rlwy.net:38165
```

### Erro de Schema

**Problema:** Tabelas não existem no Railway

**Solução:** Execute as migrations primeiro:
```powershell
npx prisma migrate deploy
```

### Erro de Timeout

**Problema:** Timeout ao migrar muitos dados

**Solução:** Migre por partes ou aumente o timeout do Prisma

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do script
2. Confirme as credenciais no Railway
3. Teste a conexão com: `npx prisma studio`

---

**Criado em:** 04/10/2025
**Status:** ✅ Configurado e pronto para uso
