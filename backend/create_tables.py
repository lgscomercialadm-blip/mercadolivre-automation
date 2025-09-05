#!/usr/bin/env python3
"""Script para criar tabelas do banco de dados"""

import sys
import os
from pathlib import Path

# Adiciona o diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import SQLModel, create_engine
from app.config import settings

# Importa todos os modelos para garantir que sejam registrados
from app.models import (
    User, OAuthToken, OAuthSession, 
    ApiTest, ApiEndpoint, MeliToken
)

def create_all_tables():
    """Cria todas as tabelas"""
    try:
        engine = create_engine(settings.database_url, echo=True)
        
        print("🗄️ Criando todas as tabelas...")
        print(f"📁 Database URL: {settings.database_url}")
        
        # Remove todas as tabelas e recria
        SQLModel.metadata.drop_all(engine)
        SQLModel.metadata.create_all(engine)
        
        print("✅ Tabelas criadas com sucesso!")
        
        # Lista tabelas criadas
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\n📋 Tabelas criadas:")
        for table in tables:
            print(f"  • {table}")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    success = create_all_tables()
    sys.exit(0 if success else 1)
