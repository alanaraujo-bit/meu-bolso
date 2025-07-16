# Guia de Deploy no Vercel

## 🚀 Deploy Rápido

### 1. Configurar Variáveis de Ambiente no Vercel:

```
DATABASE_URL = postgresql://postgres:z90rFFb1mRP62cav@db.tjocgefyjgyndzahcwwd.supabase.co:6543/postgres?pgbouncer=true&connect_timeout=10&pool_timeout=10&sslmode=require

NEXTAUTH_SECRET = 409af273f8a747e3d5c642f033995d96

NEXTAUTH_URL = https://seu-projeto.vercel.app
```

### 2. Comandos para Deploy:

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod
```

### 3. Credenciais de Teste:

- **Email:** alanvitoraraujo@gmail.com
- **Senha:** 123456

### 4. Após o Deploy:

1. Acesse a URL do Vercel
2. Vá para `/login`
3. Use as credenciais acima
4. Deve funcionar perfeitamente!

## 🎯 Por que vai funcionar no Vercel?

- **Ambiente limpo** sem conflitos de configuração
- **Conexão direta** com Supabase
- **Variáveis de ambiente** isoladas
- **SSL/TLS** configurado automaticamente

## 📱 Funcionalidades Disponíveis:

- ✅ Login/Cadastro
- ✅ Dashboard financeiro
- ✅ Gestão de transações
- ✅ Categorias personalizadas
- ✅ Metas financeiras
- ✅ Transações recorrentes
- ✅ Relatórios e gráficos

**O usuário já existe no banco, então o login deve funcionar no Vercel!** 🎉