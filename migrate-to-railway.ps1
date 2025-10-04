# Script para migrar dados do MySQL VPS antigo para Railway
# Execute este script para fazer a migração completa

Write-Host "🚀 Iniciando migração do MySQL VPS para Railway..." -ForegroundColor Cyan
Write-Host ""

# Configurações
$BACKUP_FILE = "backup_vps_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
$OLD_DB = "mysql://alanaraujo:MysqL_2025_segura@148.230.72.122:3306/meu_bolso_db"
$NEW_DB = "mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway"

Write-Host "📋 Etapa 1: Fazendo backup do banco antigo..." -ForegroundColor Yellow

# Extrair credenciais do banco antigo
$OLD_HOST = "148.230.72.122"
$OLD_PORT = "3306"
$OLD_USER = "alanaraujo"
$OLD_PASS = "MysqL_2025_segura"
$OLD_DBNAME = "meu_bolso_db"

# Fazer backup usando mysqldump
Write-Host "Executando mysqldump..." -ForegroundColor Gray
$dumpCommand = "mysqldump -h $OLD_HOST -P $OLD_PORT -u $OLD_USER -p$OLD_PASS $OLD_DBNAME > $BACKUP_FILE"

try {
    # Tentar fazer o backup
    & cmd /c "mysqldump -h $OLD_HOST -P $OLD_PORT -u $OLD_USER -p$OLD_PASS $OLD_DBNAME > $BACKUP_FILE 2>&1"
    
    if (Test-Path $BACKUP_FILE) {
        $fileSize = (Get-Item $BACKUP_FILE).Length / 1KB
        Write-Host "✅ Backup criado com sucesso! ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Erro ao criar backup. Tentando método alternativo..." -ForegroundColor Red
        Write-Host ""
        Write-Host "⚠️  ALTERNATIVA: Use o Prisma para migrar os dados" -ForegroundColor Yellow
        Write-Host "Execute os comandos abaixo:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Fazer backup via Prisma Studio:" -ForegroundColor White
        Write-Host "   npx prisma studio" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Ou use o script Node.js de migração:" -ForegroundColor White
        Write-Host "   node scripts/migrate-to-railway.js" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao fazer backup: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Você pode usar o Prisma para migrar os dados" -ForegroundColor Yellow
    Write-Host "Execute: node scripts/migrate-to-railway.js" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "📋 Etapa 2: Configurando novo banco Railway..." -ForegroundColor Yellow

# Extrair credenciais do Railway
$NEW_HOST = "monorote.proxy.rlwy.net"
$NEW_PORT = "38165"
$NEW_USER = "root"
$NEW_PASS = "YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy"
$NEW_DBNAME = "railway"

Write-Host "Executando Prisma migrations no novo banco..." -ForegroundColor Gray
$env:DATABASE_URL = $NEW_DB
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema criado no Railway com sucesso!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Erro ao criar schema no Railway" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "📋 Etapa 3: Restaurando dados no Railway..." -ForegroundColor Yellow

if (Test-Path $BACKUP_FILE) {
    Write-Host "Importando dados..." -ForegroundColor Gray
    
    try {
        & cmd /c "mysql -h $NEW_HOST -P $NEW_PORT -u $NEW_USER -p$NEW_PASS $NEW_DBNAME < $BACKUP_FILE 2>&1"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dados restaurados com sucesso no Railway!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "⚠️  Possível erro na restauração. Verifique os dados." -ForegroundColor Yellow
            Write-Host ""
        }
    } catch {
        Write-Host "❌ Erro ao restaurar dados: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "📋 Etapa 4: Verificando migração..." -ForegroundColor Yellow
Write-Host "Executando Prisma Studio para verificar..." -ForegroundColor Gray
Write-Host ""

npx prisma studio

Write-Host ""
Write-Host "✅ MIGRAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique os dados no Prisma Studio" -ForegroundColor White
Write-Host "2. Teste a aplicação localmente" -ForegroundColor White
Write-Host "3. Atualize as variáveis de ambiente no seu servidor de produção" -ForegroundColor White
Write-Host "4. Faça deploy da nova versão" -ForegroundColor White
Write-Host ""
Write-Host "📁 Backup salvo em: $BACKUP_FILE" -ForegroundColor Gray
Write-Host ""
