# Script PowerShell para publicar no GitHub
Write-Host "🚀 Publicando projeto Meu Bolso no GitHub..." -ForegroundColor Green
Write-Host ""

# Verificar se o Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Git não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "Por favor, instale o Git primeiro: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se já existe um repositório
if (Test-Path ".git") {
    Write-Host "📁 Repositório Git já existe. Adicionando arquivos..." -ForegroundColor Yellow
} else {
    Write-Host "🔧 Inicializando repositório Git..." -ForegroundColor Cyan
    git init
}

# Adicionar todos os arquivos
Write-Host "📦 Adicionando arquivos ao repositório..." -ForegroundColor Cyan
git add .

# Fazer o primeiro commit
Write-Host "💾 Fazendo commit inicial..." -ForegroundColor Cyan
git commit -m "feat: aplicação completa de controle financeiro pessoal

- Sistema de autenticação com NextAuth
- Dashboard com gráficos e resumos financeiros
- Gestão de categorias personalizáveis
- Controle de transações (receitas e despesas)
- Sistema de metas financeiras
- Transações recorrentes
- Exportação de dados em CSV
- Interface responsiva com Tailwind CSS
- Banco de dados PostgreSQL com Prisma ORM"

# Configurar branch principal
Write-Host "🌿 Configurando branch principal..." -ForegroundColor Cyan
git branch -M main

# Adicionar origem remota
Write-Host "🔗 Adicionando repositório remoto..." -ForegroundColor Cyan
try {
    git remote add origin https://github.com/alanaraujo-bit/meu-bolso.git
} catch {
    Write-Host "⚠️  Repositório remoto já existe, continuando..." -ForegroundColor Yellow
}

# Fazer push
Write-Host "🚀 Enviando para o GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "✅ Projeto publicado com sucesso no GitHub!" -ForegroundColor Green
Write-Host "🔗 Acesse: https://github.com/alanaraujo-bit/meu-bolso" -ForegroundColor Blue
Write-Host ""
Read-Host "Pressione Enter para continuar"