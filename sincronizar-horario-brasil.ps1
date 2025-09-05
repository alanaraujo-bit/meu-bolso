# Script para sincronizar o horário do Windows com servidores NTP brasileiros
# Execute como administrador: .\sincronizar-horario-brasil.ps1

param(
    [switch]$Force,
    [switch]$Verbose
)

Write-Host "🇧🇷 SINCRONIZAÇÃO DE HORÁRIO - BRASIL" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Warning "⚠️ Este script precisa ser executado como ADMINISTRADOR"
    Write-Host "Clique com botão direito no PowerShell e escolha 'Executar como administrador'" -ForegroundColor Yellow
    
    if ($Force) {
        Write-Host "Tentando executar mesmo assim..." -ForegroundColor Yellow
    } else {
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}

Write-Host "`n📅 Horário atual do sistema:" -ForegroundColor Cyan
$horaAtual = Get-Date
Write-Host "  $($horaAtual.ToString('dd/MM/yyyy HH:mm:ss'))" -ForegroundColor White
Write-Host "  Timezone: $([System.TimeZoneInfo]::Local.DisplayName)" -ForegroundColor White

# Configurar servidores NTP brasileiros
Write-Host "`n🔧 Configurando servidores NTP brasileiros..." -ForegroundColor Yellow

$servidoresNTP = @(
    "a.ntp.br",
    "b.ntp.br", 
    "c.ntp.br",
    "gps.ntp.br"
)

try {
    # Parar o serviço de tempo
    Write-Host "  Parando serviço Windows Time..." -ForegroundColor Gray
    Stop-Service w32time -Force -ErrorAction SilentlyContinue
    
    # Configurar servidores NTP
    $servidoresString = $servidoresNTP -join ","
    Write-Host "  Configurando servidores: $servidoresString" -ForegroundColor Gray
    
    $resultado1 = Start-Process -FilePath "w32tm" -ArgumentList "/config", "/manualpeerlist:$servidoresString", "/syncfromflags:manual", "/reliable:YES", "/update" -Wait -PassThru -NoNewWindow
    
    if ($resultado1.ExitCode -ne 0) {
        throw "Falha ao configurar servidores NTP (código: $($resultado1.ExitCode))"
    }
    
    # Iniciar o serviço de tempo
    Write-Host "  Iniciando serviço Windows Time..." -ForegroundColor Gray
    Start-Service w32time
    
    # Forçar sincronização
    Write-Host "  Sincronizando horário..." -ForegroundColor Gray
    $resultado2 = Start-Process -FilePath "w32tm" -ArgumentList "/resync", "/force" -Wait -PassThru -NoNewWindow
    
    if ($resultado2.ExitCode -ne 0) {
        Write-Warning "Sincronização pode ter falhado (código: $($resultado2.ExitCode))"
    }
    
    # Verificar status
    Write-Host "`n✅ Verificando sincronização..." -ForegroundColor Green
    $status = w32tm /query /status
    
    if ($Verbose) {
        Write-Host $status -ForegroundColor Gray
    }
    
    # Mostrar novo horário
    Write-Host "`n📅 Horário após sincronização:" -ForegroundColor Cyan
    $horaAtualizada = Get-Date
    Write-Host "  $($horaAtualizada.ToString('dd/MM/yyyy HH:mm:ss'))" -ForegroundColor White
    
    $diferenca = ($horaAtualizada - $horaAtual).TotalSeconds
    if ([Math]::Abs($diferenca) > 1) {
        Write-Host "  Ajuste aplicado: $([Math]::Round($diferenca, 2)) segundos" -ForegroundColor Yellow
    } else {
        Write-Host "  Horário já estava preciso" -ForegroundColor Green
    }
    
    Write-Host "`n🎯 SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
    
} catch {
    Write-Error "❌ Erro durante sincronização: $_"
    Write-Host "Verifique se está executando como administrador" -ForegroundColor Yellow
}

Write-Host "`n💡 Dicas:" -ForegroundColor Cyan
Write-Host "  • O Windows sincroniza automaticamente uma vez por semana" -ForegroundColor Gray
Write-Host "  • Para sincronização mais frequente, configure no Painel de Controle" -ForegroundColor Gray
Write-Host "  • Em caso de problemas, reinicie o serviço 'Windows Time'" -ForegroundColor Gray
