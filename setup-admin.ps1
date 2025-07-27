# Script para configurar o email do administrador no sistema Meu Bolso
# Execute: powershell -ExecutionPolicy Bypass -File setup-admin.ps1

Write-Host "=== Configuração do Administrador - Meu Bolso ===" -ForegroundColor Green
Write-Host ""

# Solicitar o email do administrador
$adminEmail = Read-Host "Digite seu email para acesso administrativo"

# Validar formato do email
if ($adminEmail -notmatch "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$") {
    Write-Host "❌ Email inválido. Por favor, execute o script novamente." -ForegroundColor Red
    exit 1
}

Write-Host "📧 Email informado: $adminEmail" -ForegroundColor Yellow
$confirm = Read-Host "Confirma? (s/n)"

if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "❌ Operação cancelada." -ForegroundColor Red
    exit 1
}

# Arquivos para atualizar
$files = @(
    "src\components\Navbar.tsx",
    "src\app\api\admin\metrics\route.ts"
)

Write-Host "🔧 Atualizando arquivos..." -ForegroundColor Blue

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $updatedContent = $content -replace "alan@exemplo\.com", $adminEmail
        Set-Content $file -Value $updatedContent -NoNewline
        Write-Host "✅ Atualizado: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Arquivo não encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Reinicie o servidor de desenvolvimento (npm run dev)" -ForegroundColor White
Write-Host "   2. Faça login com o email: $adminEmail" -ForegroundColor White
Write-Host "   3. Acesse o painel admin através do menu de navegação" -ForegroundColor White
Write-Host ""
Write-Host "Funcionalidades do Admin:" -ForegroundColor Magenta
Write-Host "   - Metricas de usuarios e crescimento" -ForegroundColor White
Write-Host "   - Analise de engajamento" -ForegroundColor White
Write-Host "   - Estatisticas financeiras" -ForegroundColor White
Write-Host "   - Monitoramento de retencao" -ForegroundColor White
Write-Host "   - Transacoes em tempo real" -ForegroundColor White
Write-Host ""
