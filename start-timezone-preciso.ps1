# Script para iniciar a aplicação com timezone preciso do Brasil
# Execute: .\start-timezone-preciso.ps1

Write-Host "🇧🇷 CONFIGURANDO TIMEZONE PRECISO PARA O BRASIL" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configurar variáveis de ambiente para timezone
$env:TZ = "America/Sao_Paulo"
$env:TIMEZONE = "America/Sao_Paulo"
$env:NODE_ENV = "development"

Write-Host "✅ Timezone configurado: $env:TZ" -ForegroundColor Yellow

# Verificar timezone atual
Write-Host "`n📅 INFORMAÇÕES DE DATA/HORA:" -ForegroundColor Cyan
$dataAtual = Get-Date
Write-Host "  Sistema Windows: $($dataAtual.ToString('dd/MM/yyyy HH:mm:ss'))" -ForegroundColor White
Write-Host "  Timezone Windows: $([System.TimeZoneInfo]::Local.DisplayName)" -ForegroundColor White

# Testar Node.js com timezone
Write-Host "`n🧪 TESTANDO NODE.JS COM TIMEZONE:" -ForegroundColor Cyan
node -e "
console.log('  ✅ TZ configurado:', process.env.TZ);
console.log('  📅 Horário Brasil:', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
console.log('  🌍 UTC:', new Date().toUTCString());
console.log('  🕐 Offset UTC:', new Date().getTimezoneOffset(), 'minutos');
"

Write-Host "`n🚀 INICIANDO APLICAÇÃO..." -ForegroundColor Green
Write-Host "  Para parar: Ctrl+C" -ForegroundColor Yellow
Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Iniciar aplicação em modo desenvolvimento
try {
    npm run dev
} catch {
    Write-Host "`n❌ Erro ao iniciar aplicação: $_" -ForegroundColor Red
    Write-Host "Verifique se todas as dependências estão instaladas." -ForegroundColor Yellow
}
