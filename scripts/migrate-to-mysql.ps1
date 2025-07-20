# Script de migração para MySQL - PowerShell
Write-Host "🚀 Iniciando migração para MySQL..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado. Por favor, instale o npm primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

Write-Host "📤 Exportando dados do PostgreSQL atual..." -ForegroundColor Yellow
node scripts/export-data.js

# Verificar se o backup foi criado
$backupFiles = Get-ChildItem -Path "backup" -Filter "backup-*.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
if ($backupFiles.Count -eq 0) {
    Write-Host "❌ Erro: Backup não foi criado. Verifique a conexão com o PostgreSQL." -ForegroundColor Red
    exit 1
}

$backupFile = $backupFiles[0].FullName
Write-Host "✅ Backup criado: $backupFile" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Configure sua nova DATABASE_URL no arquivo .env para apontar para o MySQL" -ForegroundColor Yellow
Write-Host "📝 Exemplo de configuração no .env.mysql.example" -ForegroundColor Cyan
Write-Host ""
Write-Host "Após configurar a DATABASE_URL, execute:" -ForegroundColor White
Write-Host "1. npx prisma db push" -ForegroundColor Cyan
Write-Host "2. node scripts/import-data.js `"$backupFile`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Migração preparada! Siga os passos acima para completar." -ForegroundColor Green