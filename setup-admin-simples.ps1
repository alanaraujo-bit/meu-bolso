# Script simples para configurar admin
Write-Host "=== Configuracao do Administrador - Meu Bolso ===" -ForegroundColor Green
Write-Host ""

$adminEmail = Read-Host "Digite seu email para acesso administrativo"

if ($adminEmail -notmatch "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$") {
    Write-Host "Email invalido. Por favor, execute o script novamente." -ForegroundColor Red
    exit 1
}

Write-Host "Email informado: $adminEmail" -ForegroundColor Yellow
$confirm = Read-Host "Confirma? (s/n)"

if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "Operacao cancelada." -ForegroundColor Red
    exit 1
}

$files = @(
    "src\components\Navbar.tsx",
    "src\app\api\admin\metrics\route.ts"
)

Write-Host "Atualizando arquivos..." -ForegroundColor Blue

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $updatedContent = $content -replace "alan@exemplo\.com", $adminEmail
        Set-Content $file -Value $updatedContent -NoNewline
        Write-Host "Atualizado: $file" -ForegroundColor Green
    } else {
        Write-Host "Arquivo nao encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Reinicie o servidor (npm run dev)" -ForegroundColor White
Write-Host "2. Faca login com o email: $adminEmail" -ForegroundColor White
Write-Host "3. Acesse o painel admin pelo menu" -ForegroundColor White
