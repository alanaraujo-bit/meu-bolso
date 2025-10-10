// Teste da API de edição de valor usando curl
// Execute este comando no PowerShell para testar a API

$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    novoValor = 1500
} | ConvertTo-Json

# Substitua os IDs pelos valores reais da sua dívida/parcela
$dividaId = "SEU_ID_DIVIDA_AQUI"
$parcelaId = "SEU_ID_PARCELA_AQUI"

$url = "http://localhost:3000/api/dividas/$dividaId/parcelas/$parcelaId/valor"

Write-Host "Testando URL: $url"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $url -Method PUT -Headers $headers -Body $body
    Write-Host "✅ Sucesso!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ Erro!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Resposta do servidor: $responseText"
    }
}