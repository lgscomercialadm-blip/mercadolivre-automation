#!/usr/bin/env python3
"""
Script de teste rápido para verificar endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Desabilitar temporariamente o setup do Loki
import app.monitoring.loki_config
app.monitoring.loki_config.setup_loki_logging = lambda: None

from app.routers.oauth_simple import router as oauth_simple_router
from app.routers.ml_simple import router as ml_simple_router
from app.routers.ml_api import router as ml_api_router

print("✅ Routers importados com sucesso:")
print(f"OAuth Simple: {oauth_simple_router.prefix}")
print(f"ML Simple: {ml_simple_router.prefix}")  
print(f"ML API: {ml_api_router.prefix}")

# Testar endpoints diretamente
from app.routers.oauth_simple import oauth_status_simple
from app.routers.ml_simple import test_ml_connection

print("\n🔍 Testando endpoints diretamente:")

try:
    oauth_result = oauth_status_simple()
    print(f"OAuth Status: {oauth_result}")
except Exception as e:
    print(f"❌ OAuth Status Error: {e}")

try:
    ml_result = test_ml_connection()
    print(f"ML Test: {ml_result}")
except Exception as e:
    print(f"❌ ML Test Error: {e}")
