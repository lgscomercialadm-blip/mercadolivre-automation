#!/usr/bin/env python3
"""
Verificação básica da configuração OAuth2

Script simples para verificar se a configuração está OK
sem dependências complexas.
"""

import os
from pathlib import Path

def check_env_file():
    """Verifica se arquivo .env existe e tem as variáveis principais."""
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ Arquivo .env não encontrado")
        print("   Copie .env.example para .env e configure as variáveis")
        return False
    
    print("✅ Arquivo .env encontrado")
    
    # Verificar variáveis principais
    required_vars = [
        "ML_CLIENT_ID",
        "ML_CLIENT_SECRET", 
        "ML_REDIRECT_URI",
        "SECRET_KEY"
    ]
    
    missing_vars = []
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            for var in required_vars:
                if f"{var}=" not in content or f"{var}=" in content and not content.split(f"{var}=")[1].split('\n')[0].strip():
                    missing_vars.append(var)
    except UnicodeDecodeError:
        # Tentar com encoding alternativo
        with open(env_path, 'r', encoding='latin-1') as f:
            content = f.read()
            for var in required_vars:
                if f"{var}=" not in content or f"{var}=" in content and not content.split(f"{var}=")[1].split('\n')[0].strip():
                    missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Variáveis ausentes ou vazias: {', '.join(missing_vars)}")
        return False
    else:
        print("✅ Todas as variáveis obrigatórias estão definidas")
        return True

def check_files():
    """Verifica se os arquivos OAuth foram criados."""
    files_to_check = [
        "app/core/mercadolivre_oauth.py",
        "app/services/mercadolivre_oauth.py", 
        "app/routers/oauth_secure.py",
        "app/middleware/security.py",
        "app/main_fixed.py",
        ".env.example"
    ]
    
    missing_files = []
    for file_path in files_to_check:
        if not Path(file_path).exists():
            missing_files.append(file_path)
        else:
            print(f"✅ {file_path}")
    
    if missing_files:
        print(f"❌ Arquivos ausentes: {', '.join(missing_files)}")
        return False
    
    return True

def main():
    print("🔐 VERIFICAÇÃO RÁPIDA - OAUTH2 SETUP")
    print("="*50)
    
    # Verificar arquivos
    print("\n📁 Verificando arquivos...")
    files_ok = check_files()
    
    # Verificar .env
    print("\n⚙️ Verificando configuração...")
    env_ok = check_env_file()
    
    # Resultado final
    print("\n" + "="*50)
    if files_ok and env_ok:
        print("🎉 CONFIGURAÇÃO BÁSICA OK!")
        print("\n📝 Próximos passos:")
        print("1. Instalar dependências: pip install -r requirements.txt")
        print("2. Iniciar servidor: uvicorn app.main_fixed:app --reload")
        print("3. Acessar: http://localhost:8000/docs")
        return True
    else:
        print("❌ CONFIGURAÇÃO INCOMPLETA!")
        print("\n📝 Para corrigir:")
        if not files_ok:
            print("- Verifique se todos os arquivos OAuth foram criados")
        if not env_ok:
            print("- Configure as variáveis no arquivo .env")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
