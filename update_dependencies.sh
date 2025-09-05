#!/bin/bash
# ====================================
# SCRIPT DE ATUALIZAÇÃO DE DEPENDÊNCIAS
# ====================================

echo "🚀 Iniciando atualização de dependências do ML Project..."

# ============ BACKUP ATUAL ============
echo "📁 Criando backup dos arquivos atuais..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp requirements*.txt backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp package*.json backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp docker-compose.yml backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# ============ PYTHON DEPENDENCIES ============
echo "🐍 Atualizando dependências Python..."

# Atualizar requirements dos serviços principais
SERVICES=(
    "backend"
    "optimizer_ai" 
    "strategic_mode_service"
    "campaign_automation_service"
    "discount_campaign_scheduler"
    "learning_service"
    "gamification_service"
    "simulator_service"
    "alerts_service"
    "acos_service"
)

for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        echo "  📦 Atualizando $service..."
        cp requirements-unified.txt "$service/requirements.txt"
    fi
done

# Atualizar módulos AI
echo "  🤖 Atualizando módulos AI..."
find modules/ -name "requirements.txt" -exec cp requirements-unified.txt {} \;

# ============ FRONTEND DEPENDENCIES ============
echo "⚛️ Atualizando dependências Frontend..."

# Atualizar package.json dos frontends
if [ -d "frontend" ]; then
    echo "  📦 Atualizando frontend..."
    cp package-unified.json frontend/package.json
fi

if [ -d "frontend-vite" ]; then
    echo "  📦 Atualizando frontend-vite..."
    cp package-unified.json frontend-vite/package.json
fi

# ============ DOCKER COMPOSE ============
echo "🐳 Atualizando Docker Compose..."
cp docker-compose-unified.yml docker-compose.yml

# ============ INSTALAÇÃO ============
echo "📥 Instalando dependências..."

# Python virtual environment
if [ ! -d "venv" ]; then
    echo "  🐍 Criando ambiente virtual Python..."
    python -m venv venv
fi

echo "  🐍 Ativando ambiente virtual e instalando dependências..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-unified.txt

# Frontend (se Node.js estiver disponível)
if command -v node &> /dev/null; then
    if [ -d "frontend-vite" ]; then
        echo "  ⚛️ Instalando dependências do frontend..."
        cd frontend-vite
        npm install
        cd ..
    fi
else
    echo "  ⚠️ Node.js não encontrado. Instale Node.js 18+ para o frontend."
fi

# ============ VALIDAÇÃO ============
echo "🔍 Validando instalação..."

# Verificar conflitos Python
echo "  🐍 Verificando conflitos Python..."
pip check

# Verificar serviços Docker
echo "  🐳 Validando Docker Compose..."
docker-compose -f docker-compose.yml config > /dev/null

echo "✅ Atualização concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Revisar logs de conflitos (se houver)"
echo "   2. Executar testes: pytest tests/"
echo "   3. Iniciar ambiente: docker-compose up --build"
echo "   4. Verificar funcionamento dos serviços"
echo ""
echo "📁 Arquivos criados:"
echo "   - requirements-unified.txt"
echo "   - package-unified.json" 
echo "   - docker-compose-unified.yml"
echo "   - DEPENDENCIES_ANALYSIS.md"
