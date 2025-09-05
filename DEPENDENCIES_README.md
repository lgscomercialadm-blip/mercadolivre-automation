# 🔧 Guia de Gerenciamento de Dependências

## 📊 Situação Atual das Dependências

### ❌ Problemas Identificados
- **21 serviços** com versões diferentes de FastAPI, Pydantic e SQLAlchemy
- **Conflitos críticos** entre versões de ML libraries
- **Frontend duplicado** com dependências inconsistentes
- **Redis faltando** no docker-compose original
- **Versões desatualizadas** de bibliotecas críticas

### ✅ Soluções Implementadas
- **requirements-unified.txt**: Versões unificadas para todos os serviços
- **package-unified.json**: Frontend consolidado com Vite
- **docker-compose-unified.yml**: Infraestrutura completa com Redis
- **Scripts de automação**: PowerShell e Bash para atualização

## 🚀 Como Atualizar as Dependências

### Opção 1: Script Automático (Recomendado)
```powershell
# Windows PowerShell
.\update_dependencies.ps1
```

```bash
# Linux/Mac
chmod +x update_dependencies.sh
./update_dependencies.sh
```

### Opção 2: Manual

#### 1. Backend (Python)
```bash
# Ativar ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependências unificadas
pip install -r requirements-unified.txt

# Verificar conflitos
pip check
```

#### 2. Frontend (Node.js)
```bash
cd frontend-vite
npm install
npm audit fix
```

#### 3. Infraestrutura (Docker)
```bash
# Usar docker-compose atualizado
cp docker-compose-unified.yml docker-compose.yml
docker-compose up --build
```

## 📋 Versões Unificadas

### Core Framework
| Pacote | Versão Unificada | Versões Anteriores |
|--------|------------------|-------------------|
| FastAPI | `0.116.1` | `0.104.1`, `0.115.6` |
| Pydantic | `2.11.7` | `2.5.0`, `2.6.1`, `2.10.4` |
| SQLAlchemy | `2.0.43` | `2.0.23`, `2.0.36` |

### Machine Learning
| Pacote | Versão Unificada | Status |
|--------|------------------|--------|
| Transformers | `4.47.1` | ⬆️ Atualizado |
| PyTorch | `2.8.0` | ⬆️ Atualizado |
| Scikit-learn | `1.6.0` | ⬆️ Unificado |

### Frontend
| Pacote | Versão Unificada | Framework |
|--------|------------------|-----------|
| React | `18.3.1` | Core |
| Vite | `7.1.3` | Build Tool |
| MUI | `7.3.1` | UI Library |

## 🔍 Validação e Testes

### 1. Verificar Instalação
```bash
# Python dependencies
pip list | grep -E "(fastapi|pydantic|sqlalchemy)"

# Node dependencies
npm list react axios @mui/material

# Docker services
docker-compose ps
```

### 2. Testes de Compatibilidade
```bash
# Backend tests
pytest tests/ -v

# Frontend tests
npm test

# E2E tests
npm run cypress:run
```

### 3. Verificar Serviços
```bash
# Health checks
curl http://localhost:8000/health  # Backend
curl http://localhost:8001/health  # Optimizer AI
curl http://localhost:3000         # Frontend
```

## 🚨 Resolução de Problemas Comuns

### Conflito de Versões Python
```bash
# Limpar cache pip
pip cache purge

# Reinstalar com versões fixas
pip install --force-reinstall -r requirements-unified.txt
```

### Problemas Node.js
```bash
# Limpar cache npm
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Docker Issues
```bash
# Rebuild completo
docker-compose down -v
docker-compose up --build --force-recreate
```

## 📁 Estrutura de Arquivos Criados

```
ml_project_novo/
├── 📄 DEPENDENCIES_ANALYSIS.md      # Análise detalhada
├── 📄 requirements-unified.txt       # Python unificado
├── 📄 package-unified.json          # Frontend unificado  
├── 📄 docker-compose-unified.yml    # Docker completo
├── 🔧 update_dependencies.ps1       # Script Windows
├── 🔧 update_dependencies.sh        # Script Linux/Mac
└── 📁 backup/                       # Backups automáticos
```

## 🎯 Próximos Passos

1. **✅ Executar script de atualização**
2. **🧪 Rodar todos os testes**
3. **🚀 Deploy em ambiente de desenvolvimento**
4. **📊 Monitorar performance e erros**
5. **📝 Documentar mudanças específicas**

## 🔄 Manutenção Contínua

### Verificação Semanal
```bash
# Verificar atualizações disponíveis
pip list --outdated
npm outdated
```

### Atualização Mensal
```bash
# Atualizar dependências secundárias
pip-review --auto
npm update
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs em `backup/`
2. Consultar `DEPENDENCIES_ANALYSIS.md`
3. Reverter para backup se necessário:
   ```bash
   cp backup/[timestamp]/requirements.txt .
   ```
