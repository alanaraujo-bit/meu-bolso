#!/bin/bash

echo "🚀 Iniciando migração para MySQL..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo "📤 Exportando dados do PostgreSQL atual..."
node scripts/export-data.js

# Verificar se o backup foi criado
BACKUP_FILE=$(ls -t backup/backup-*.json 2>/dev/null | head -n1)
if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Erro: Backup não foi criado. Verifique a conexão com o PostgreSQL."
    exit 1
fi

echo "✅ Backup criado: $BACKUP_FILE"

echo "⚠️  IMPORTANTE: Configure sua nova DATABASE_URL no arquivo .env para apontar para o MySQL"
echo "📝 Exemplo de configuração no .env.mysql.example"
echo ""
echo "Após configurar a DATABASE_URL, execute:"
echo "1. npx prisma db push"
echo "2. node scripts/import-data.js $BACKUP_FILE"
echo ""
echo "🎯 Migração preparada! Siga os passos acima para completar."