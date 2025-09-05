#!/usr/bin/env python3
"""
Teste direto do endpoint OAuth
"""

import sys
import os
from pathlib import Path

# Adiciona o diretório backend ao path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

import requests

def test_oauth_endpoint():
    """Testa o endpoint OAuth"""
    try:
        print("🧪 Testando endpoint OAuth...")
        
        response = requests.get("http://localhost:8001/api/oauth/login", allow_redirects=False)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        print(f"📄 Body: {response.text}")
        
        if response.status_code == 307 or response.status_code == 302:
            location = response.headers.get('location', '')
            if 'auth.mercadolivre.com.br' in location:
                print("✅ SUCCESS! Redirecionando para Mercado Livre!")
                print(f"🔗 URL de autorização: {location}")
                return True
            else:
                print(f"⚠️ Redirecionamento para: {location}")
        
        return False
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    test_oauth_endpoint()
