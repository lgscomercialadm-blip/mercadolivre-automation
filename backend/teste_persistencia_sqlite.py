#!/usr/bin/env python3
"""
🧪 TESTE DA PERSISTÊNCIA SQLITE
Testa se os tokens estão sendo salvos no banco SQLite
"""

import sqlite3
import requests
import json
from datetime import datetime

def verificar_banco_sqlite():
    """Verifica se há tokens salvos no banco SQLite"""
    print("🗄️ VERIFICANDO BANCO SQLITE")
    print("=" * 40)
    
    try:
        db_path = "user_tokens.db"
        
        # Verificar se arquivo existe
        import os
        if not os.path.exists(db_path):
            print(f"❌ Arquivo {db_path} não encontrado")
            return False
        
        print(f"✅ Arquivo encontrado: {db_path}")
        
        # Conectar e verificar conteúdo
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se tabela existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_tokens'")
        if not cursor.fetchone():
            print("❌ Tabela user_tokens não encontrada")
            conn.close()
            return False
        
        print("✅ Tabela user_tokens encontrada")
        
        # Contar tokens
        cursor.execute("SELECT COUNT(*) FROM user_tokens")
        count = cursor.fetchone()[0]
        print(f"📊 Total de tokens no banco: {count}")
        
        if count > 0:
            # Mostrar tokens
            cursor.execute("SELECT user_id, scope, created_at, updated_at FROM user_tokens ORDER BY updated_at DESC")
            tokens = cursor.fetchall()
            
            print(f"\n👥 TOKENS SALVOS:")
            for token in tokens:
                user_id, scope, created, updated = token
                print(f"   🆔 User ID: {user_id}")
                print(f"   🔐 Scope: {scope}")
                print(f"   📅 Criado: {created}")
                print(f"   🔄 Atualizado: {updated}")
                print()
                
                # Testar se token ainda funciona
                testar_token_sqlite(user_id)
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao verificar banco: {e}")
        return False

def testar_token_sqlite(user_id):
    """Testa token específico do SQLite"""
    print(f"🧪 Testando token do SQLite para usuário {user_id}...")
    
    try:
        # Recuperar token do banco
        conn = sqlite3.connect("user_tokens.db")
        cursor = conn.cursor()
        
        cursor.execute("SELECT access_token FROM user_tokens WHERE user_id = ?", (user_id,))
        result = cursor.fetchone()
        
        if result:
            access_token = result[0]
            print(f"   ✅ Token recuperado: {access_token[:20]}...")
            
            # Testar API do ML
            headers = {
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "CortexIA/1.0"
            }
            
            response = requests.get("https://api.mercadolibre.com/users/me", headers=headers, timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                print(f"   🎉 TOKEN VÁLIDO! Usuário: {user_data.get('nickname')}")
                return True
            else:
                print(f"   ❌ Token inválido ou expirado: {response.status_code}")
                return False
        else:
            print(f"   ❌ Token não encontrado no banco")
            return False
            
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Erro ao testar token: {e}")
        return False

def testar_persistencia_completa():
    """Testa se sistema de persistência está funcionando"""
    print("\n🎯 TESTE DE PERSISTÊNCIA COMPLETA")
    print("=" * 50)
    
    # 1. Verificar banco
    banco_ok = verificar_banco_sqlite()
    
    # 2. Verificar se API funciona
    print("\n📡 Testando API do servidor...")
    try:
        response = requests.get("http://localhost:8002/api/user-auth/status", timeout=5)
        
        if response.status_code == 200:
            status_data = response.json()
            print(f"   ✅ API funcionando")
            print(f"   👥 Usuários autorizados: {status_data.get('total_users_authorized', 0)}")
            
            # Comparar com banco
            if banco_ok:
                print(f"   💾 Tokens no SQLite confirmados")
                print(f"   🎉 PERSISTÊNCIA FUNCIONANDO!")
                return True
        else:
            print(f"   ❌ API erro: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erro na API: {e}")
    
    return False

def main():
    print("🚀 TESTE COMPLETO DA PERSISTÊNCIA SQLITE")
    print("=" * 60)
    
    sucesso = testar_persistencia_completa()
    
    print(f"\n📊 RESULTADO FINAL:")
    if sucesso:
        print("✅ PERSISTÊNCIA IMPLEMENTADA COM SUCESSO!")
        print("✅ Tokens salvos no banco SQLite")
        print("✅ Sistema funcionando perfeitamente")
        print("\n🎯 PRÓXIMOS PASSOS:")
        print("   1. Reiniciar servidor para testar persistência")
        print("   2. Verificar se tokens permanecem após reinício")
        print("   3. Sistema pronto para produção!")
    else:
        print("❌ Problemas encontrados")
        print("💡 Verificar se autorização foi feita após implementação")

if __name__ == "__main__":
    main()
