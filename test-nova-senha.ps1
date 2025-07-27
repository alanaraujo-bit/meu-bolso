# Teste de Verificação de Senha
Write-Host "=== Testando Nova Senha Administrativa ===" -ForegroundColor Green
Write-Host ""

# Teste direto com Node.js
$testScript = @"
const bcrypt = require('bcryptjs');

const hash = '`$2b`$10`$ULkGzj3cnhPVrjGPc.jmTeAGjgcvVEwBl.IfiA5/MOAI/lfQqJff2';
const senha = 'Sucesso@2025#';

const resultado = bcrypt.compareSync(senha, hash);

console.log('Hash armazenado:', hash);
console.log('Senha testada:', senha);
console.log('Resultado:', resultado ? 'SUCESSO - Senha correta!' : 'ERRO - Senha incorreta!');
"@

# Salvar script temporário
$testScript | Out-File -FilePath "test-senha.js" -Encoding UTF8

# Executar teste
Write-Host "Executando teste de validacao da senha..." -ForegroundColor Blue
node test-senha.js

# Limpar arquivo temporário
Remove-Item "test-senha.js" -Force

Write-Host ""
Write-Host "Nova senha configurada com sucesso!" -ForegroundColor Green
Write-Host "Email: alanvitoraraujo1a@outlook.com" -ForegroundColor Yellow
Write-Host "Senha: Sucesso@2025#" -ForegroundColor Yellow
Write-Host ""
Write-Host "Acesse http://localhost:3000 e teste o login!" -ForegroundColor Cyan
