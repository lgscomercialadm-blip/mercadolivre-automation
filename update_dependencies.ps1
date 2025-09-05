# ====================================
# SCRIPT DE ATUALIZAÇÃO DE DEPENDÊNCIAS - PowerShell
# ====================================

Write-Host "🚀 Iniciando atualização de dependências do ML Project..." -ForegroundColor Green

# ============ BACKUP ATUAL ============
Write-Host "📁 Criando backup dos arquivos atuais..." -ForegroundColor Yellow
$backupDir = "backup\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup de arquivos existentes
$filesToBackup = @("requirements*.txt", "package*.json", "docker-compose.yml")
foreach ($pattern in $filesToBackup) {
    Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item $_ $backupDir -ErrorAction SilentlyContinue
    }
}

# ============ PYTHON DEPENDENCIES ============
Write-Host "🐍 Atualizando dependências Python..." -ForegroundColor Cyan

# Atualizar requirements dos serviços principais
$services = @(
    "backend",
    "optimizer_ai",
    "strategic_mode_service", 
    "campaign_automation_service",
    "discount_campaign_scheduler",
    "learning_service",
    "gamification_service",
    "simulator_service",
    "alerts_service",
    "acos_service"
)

foreach ($service in $services) {
    if (Test-Path $service) {
        Write-Host "  📦 Atualizando $service..." -ForegroundColor White
        Copy-Item "requirements-unified.txt" "$service\requirements.txt" -Force
    }
}

# Atualizar módulos AI
Write-Host "  🤖 Atualizando módulos AI..." -ForegroundColor White
Get-ChildItem -Path "modules" -Recurse -Name "requirements.txt" | ForEach-Object {
    $targetPath = "modules\$_"
    Copy-Item "requirements-unified.txt" $targetPath -Force
}

# ============ FRONTEND DEPENDENCIES ============
Write-Host "⚛️ Atualizando dependências Frontend..." -ForegroundColor Cyan

# Atualizar package.json dos frontends
if (Test-Path "frontend") {
    Write-Host "  📦 Atualizando frontend..." -ForegroundColor White
    Copy-Item "package-unified.json" "frontend\package.json" -Force
}

if (Test-Path "frontend-vite") {
    Write-Host "  📦 Atualizando frontend-vite..." -ForegroundColor White
    Copy-Item "package-unified.json" "frontend-vite\package.json" -Force
}

# ============ DOCKER COMPOSE ============
Write-Host "🐳 Atualizando Docker Compose..." -ForegroundColor Cyan
Copy-Item "docker-compose-unified.yml" "docker-compose.yml" -Force

# ============ INSTALAÇÃO ============
Write-Host "📥 Instalando dependências..." -ForegroundColor Green

# Python virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "  🐍 Criando ambiente virtual Python..." -ForegroundColor White
    python -m venv venv
}

Write-Host "  🐍 Ativando ambiente virtual e instalando dependências..." -ForegroundColor White
& "venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
pip install -r requirements-unified.txt

# Frontend (se Node.js estiver disponível)
if (Get-Command node -ErrorAction SilentlyContinue) {
    if (Test-Path "frontend-vite") {
        Write-Host "  ⚛️ Instalando dependências do frontend..." -ForegroundColor White
        Set-Location "frontend-vite"
        npm install
        Set-Location ".."
    }
} else {
    Write-Host "  ⚠️ Node.js não encontrado. Instale Node.js 18+ para o frontend." -ForegroundColor Yellow
}

# ============ VALIDAÇÃO ============
Write-Host "🔍 Validando instalação..." -ForegroundColor Green

# Verificar conflitos Python
Write-Host "  🐍 Verificando conflitos Python..." -ForegroundColor White
pip check

# Verificar serviços Docker
Write-Host "  🐳 Validando Docker Compose..." -ForegroundColor White
try {
    docker-compose -f docker-compose.yml config | Out-Null
    Write-Host "  ✅ Docker Compose válido" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Erro na validação do Docker Compose" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Atualização concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Revisar logs de conflitos (se houver)" -ForegroundColor White
Write-Host "   2. Executar testes: pytest tests/" -ForegroundColor White
Write-Host "   3. Iniciar ambiente: docker-compose up --build" -ForegroundColor White
Write-Host "   4. Verificar funcionamento dos serviços" -ForegroundColor White
Write-Host ""
Write-Host "📁 Arquivos criados:" -ForegroundColor Yellow
Write-Host "   - requirements-unified.txt" -ForegroundColor White
Write-Host "   - package-unified.json" -ForegroundColor White
Write-Host "   - docker-compose-unified.yml" -ForegroundColor White
Write-Host "   - DEPENDENCIES_ANALYSIS.md" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para executar este script: .\update_dependencies.ps1" -ForegroundColor Cyan
