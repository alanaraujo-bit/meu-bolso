# 🚨 ERRO DE DEPLOY - Configuração Railway

## 🔍 **Problema Identificado:**
O deploy está tentando conectar ao banco antigo da VPS (148.230.72.122:3306) que está fora do ar.

## ✅ **Solução: Configurar Variáveis no Vercel**

### **1. Acesse o Vercel Dashboard:**
```
https://vercel.com/dashboard
```

### **2. Vá no seu projeto → Settings → Environment Variables**

### **3. Adicione/Atualize estas variáveis:**

**Para PRODUÇÃO (use URL INTERNA do Railway):**
```
DATABASE_URL=mysql://root:YkEqMJBvocpBsKhKKaVVxQMesOftWoYy@mysql.railway.internal:3306/railway
```

**NextAuth:**
```
NEXTAUTH_SECRET=34165e9413d77d1c28dbb61d1703f7bc2
NEXTAUTH_URL=https://www.appmeubolso.com.br
```

### **4. Importante - Environments:**
- ✅ **Production** ✓
- ✅ **Preview** ✓  
- ✅ **Development** ✓

### **5. Após configurar:**
- Clique em **"Save"**
- Faça novo deploy: `vercel --prod`

## 🚀 **Comandos para Deploy:**

```powershell
# 1. Fazer deploy
npm run build  # Para testar local primeiro
vercel --prod  # Para fazer deploy

# 2. Ou via Git (se conectado ao GitHub)
git add .
git commit -m "Fix: Configuração Railway para produção"
git push origin main
```

## 📝 **URLs Corretas:**

### **Desenvolvimento Local:**
```
DATABASE_URL=mysql://root:YkEqMJBvocpBsKhKKaVVxQMesOftWoYy@yamanote.proxy.rlwy.net:38165/railway
```

### **Produção (Vercel):**
```
DATABASE_URL=mysql://root:YkEqMJBvocpBsKhKKaVVxQMesOftWoYy@mysql.railway.internal:3306/railway
```

---

**Resumo:** Configure a variável DATABASE_URL no Vercel com a URL INTERNA do Railway!