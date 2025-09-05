#!/usr/bin/env python3
"""
SISTEMA DE AUTORIZAÇÃO PARA USUÁRIOS EXTERNOS
🔥 Interface para usuários autorizarem nossa aplicação
"""
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
import secrets
import hashlib
import base64
from urllib.parse import urlencode
import httpx
from datetime import datetime
import json
import sqlite3
import os

# Storage para autorizações de usuários
user_authorizations = {}
pkce_storage = {}

from app.config import settings
from app.services.ml_user_token_service import MLUserTokenService

# Função para salvar token no banco SQLite
def save_token_to_database(user_id: int, token_data: dict):
    """Salva token no banco SQLite para persistência"""
    try:
        # Criar banco se não existir
        db_path = "user_tokens.db"
        conn = sqlite3.connect(db_path)
        
        # Criar tabela se não existir
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_tokens (
                user_id INTEGER PRIMARY KEY,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                scope TEXT,
                expires_in INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Salvar ou atualizar token
        conn.execute("""
            INSERT OR REPLACE INTO user_tokens 
            (user_id, access_token, refresh_token, scope, expires_in, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            token_data["access_token"],
            token_data.get("refresh_token"),
            token_data.get("scope"),
            token_data.get("expires_in"),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        print(f"💾 Token do usuário {user_id} salvo no banco SQLite")
        
    except Exception as e:
        print(f"❌ Erro ao salvar no banco: {e}")

router = APIRouter(prefix="/api/user-auth", tags=["User Authorization"])

def generate_pkce():
    """Gera code_verifier e code_challenge para PKCE"""
    code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    challenge_bytes = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    code_challenge = base64.urlsafe_b64encode(challenge_bytes).decode('utf-8').rstrip('=')
    return code_verifier, code_challenge

@router.get("/", response_class=HTMLResponse)
async def user_auth_page():
    """
    Página para usuários autorizarem nossa aplicação
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Autorizar Aplicação - Mercado Livre Automation</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 500px;
                text-align: center;
                animation: slideUp 0.5s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .logo {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 1.8em;
            }
            
            .description {
                color: #666;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            
            .features {
                background: #f8f9fa;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .features h3 {
                color: #495057;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .features ul {
                list-style: none;
                padding: 0;
            }
            
            .features li {
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
                color: #495057;
            }
            
            .features li:last-child {
                border-bottom: none;
            }
            
            .features li::before {
                content: "✅ ";
                margin-right: 10px;
            }
            
            .auth-button {
                background: linear-gradient(135deg, #FFE600 0%, #FFCC00 100%);
                color: #333;
                border: none;
                padding: 15px 40px;
                border-radius: 50px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                margin: 20px 0;
                box-shadow: 0 5px 15px rgba(255, 204, 0, 0.3);
            }
            
            .auth-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 204, 0, 0.4);
            }
            
            .security-info {
                background: #e8f5e8;
                border: 1px solid #c3e6c3;
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
                color: #2d5a2d;
                font-size: 0.9em;
            }
            
            .security-info::before {
                content: "🔒 ";
                margin-right: 5px;
            }
            
            .footer {
                margin-top: 30px;
                color: #999;
                font-size: 0.8em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🚀</div>
            <h1>Autorizar Aplicação</h1>
            <p class="description">
                Conecte sua conta do Mercado Livre com nossa aplicação de automação 
                para gerenciar seus produtos e campanhas de forma inteligente.
            </p>
            
            <div class="features">
                <h3>🎯 Funcionalidades</h3>
                <ul>
                    <li>Gerenciamento automático de produtos</li>
                    <li>Otimização de preços com IA</li>
                    <li>Análise de performance de vendas</li>
                    <li>Automação de campanhas publicitárias</li>
                    <li>Relatórios detalhados em tempo real</li>
                </ul>
            </div>
            
            <div class="security-info">
                <strong>Segurança Garantida:</strong> Utilizamos OAuth2 + PKCE para máxima segurança. 
                Seus dados são protegidos e você pode revogar o acesso a qualquer momento.
            </div>
            
            <a href="/api/user-auth/authorize" class="auth-button">
                🔐 Autorizar com Mercado Livre
            </a>
            
            <div class="footer">
                <p>Após autorizar, você será redirecionado de volta para nossa aplicação</p>
                <p><small>Desenvolvido com ❤️ para automatizar seu negócio</small></p>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.get("/authorize")
async def start_user_authorization():
    """
    Inicia o processo de autorização para um usuário
    """
    try:
        # Gera state e PKCE únicos
        state = secrets.token_urlsafe(32)
        code_verifier, code_challenge = generate_pkce()
        
        # Armazena code_verifier
        pkce_storage[state] = {
            "code_verifier": code_verifier,
            "timestamp": datetime.now().isoformat(),
            "user_ip": "unknown"  # Pode capturar do request se necessário
        }
        
        # Parâmetros OAuth2 para Mercado Livre
        params = {
            'response_type': 'code',
            'client_id': settings.ml_client_id,
            'redirect_uri': settings.ml_redirect_uri.replace('/oauth-simple/', '/user-auth/'),
            'scope': 'offline_access read write',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        auth_url = f"https://auth.mercadolivre.com.br/authorization?{urlencode(params)}"
        
        print(f"🚀 User Authorization - State: {state[:10]}...")
        print(f"🔗 Auth URL: {auth_url}")
        
        return RedirectResponse(url=auth_url, status_code=307)
        
    except Exception as e:
        print(f"❌ Erro na autorização: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na autorização: {str(e)}")

@router.get("/callback")
async def user_auth_callback(
    code: str = None,
    state: str = None,
    error: str = None
):
    """
    Callback da autorização do usuário
    """
    if error:
        return HTMLResponse(content=f"""
        <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Erro na Autorização</h1>
                <p>Erro: {error}</p>
                <a href="/api/user-auth/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Tentar Novamente</a>
            </body>
        </html>
        """)
    
    if not code:
        return HTMLResponse(content="""
        <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: orange;">⚠️ Código não recebido</h1>
                <p>Não foi possível obter o código de autorização.</p>
                <a href="/api/user-auth/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Tentar Novamente</a>
            </body>
        </html>
        """)
    
    try:
        # Trocar código por token
        token_data = await exchange_user_code_for_token(code, state)
        
        # Salvar token no banco de dados
        user_id = token_data["user_id"]
        
        # Salvar no banco
        saved_token = MLUserTokenService.save_user_token(
            user_id=user_id,
            access_token=token_data["access_token"],
            token_data=token_data,
            state=state
        )
        
        # Também manter na memória para compatibilidade (temporário)
        user_authorizations[user_id] = {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "token_type": token_data["token_type"],
            "expires_in": token_data["expires_in"],
            "scope": token_data["scope"],
            "authorized_at": datetime.now().isoformat(),
            "state": state
        }
        
        # 💾 PERSISTÊNCIA SQLITE - Salvar no banco de dados
        save_token_to_database(user_id, token_data)
        print(f"🎉 Token persistido! Usuário {user_id} salvo no banco SQLite")
        
        # Obter informações do usuário e salvar
        try:
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    "https://api.mercadolibre.com/users/me",
                    headers={"Authorization": f"Bearer {token_data['access_token']}"}
                )
                
                if user_response.status_code == 200:
                    user_info = user_response.json()
                    MLUserTokenService.update_user_info(user_id, user_info)
        except Exception as e:
            print(f"⚠️ Erro ao obter informações do usuário: {e}")
        
        print(f"💾 Token salvo no banco para usuário {user_id}")
        
        # Página de sucesso
        return HTMLResponse(content=f"""
        <html>
            <head>
                <title>Autorização Concluída</title>
                <style>
                    body {{ font-family: Arial; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 50px; }}
                    .container {{ background: white; border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto; text-align: center; }}
                    .success {{ color: #28a745; font-size: 3em; margin-bottom: 20px; }}
                    .info {{ background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✅</div>
                    <h1>Autorização Concluída com Sucesso!</h1>
                    <p>Sua conta foi conectada com sucesso à nossa aplicação.</p>
                    
                    <div class="info">
                        <h3>📊 Informações da Autorização</h3>
                        <p><strong>User ID:</strong> {user_id}</p>
                        <p><strong>Escopo:</strong> {token_data["scope"]}</p>
                        <p><strong>Válido por:</strong> {token_data["expires_in"]} segundos</p>
                        <p><strong>Data:</strong> {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}</p>
                    </div>
                    
                    <p>Agora você pode usar todas as funcionalidades da aplicação!</p>
                    <p><small>Você pode fechar esta janela.</small></p>
                </div>
            </body>
        </html>
        """)
        
    except Exception as e:
        return HTMLResponse(content=f"""
        <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Erro ao processar autorização</h1>
                <p>Erro: {str(e)}</p>
                <a href="/api/user-auth/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Tentar Novamente</a>
            </body>
        </html>
        """)

async def exchange_user_code_for_token(code: str, state: str):
    """Troca código OAuth por token de acesso"""
    
    # Recuperar code_verifier
    pkce_data = pkce_storage.get(state)
    if not pkce_data:
        raise HTTPException(status_code=400, detail="Code verifier não encontrado")
    
    code_verifier = pkce_data["code_verifier"]
    
    token_url = "https://api.mercadolibre.com/oauth/token"
    
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.ml_client_id,
        "client_secret": settings.ml_client_secret,
        "code": code,
        "redirect_uri": settings.ml_redirect_uri.replace('/oauth-simple/', '/user-auth/'),
        "code_verifier": code_verifier
    }
    
    print(f"🔄 Trocando código por token para usuário...")
    print(f"📝 Redirect URI: {data['redirect_uri']}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        
        print(f"📊 Token Response Status: {response.status_code}")
        print(f"📊 Token Response: {response.text}")
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao obter token: {response.text}"
            )
        
        # Limpar code_verifier após uso
        pkce_storage.pop(state, None)
        
        return response.json()

@router.get("/status")
async def user_auth_status():
    """Status das autorizações de usuários (usando banco de dados)"""
    
    # Obter tokens do banco
    active_tokens = MLUserTokenService.get_all_active_tokens()
    
    # Estatísticas do banco
    stats = MLUserTokenService.get_token_stats()
    
    return {
        "total_users_authorized": len(active_tokens),
        "active_pkce_sessions": len(pkce_storage),
        "database_stats": stats,
        "users": [
            {
                "user_id": token.user_id,
                "authorized_at": token.authorized_at.isoformat(),
                "scope": token.scope,
                "has_refresh_token": bool(token.refresh_token),
                "user_nickname": token.user_nickname,
                "user_email": token.user_email,
                "user_country": token.user_country,
                "last_used": token.last_used.isoformat() if token.last_used else None,
                "expires_in": token.expires_in
            }
            for token in active_tokens
        ],
        # Manter compatibilidade com sistema antigo
        "memory_users": [
            {
                "user_id": uid,
                "authorized_at": data["authorized_at"],
                "scope": data["scope"],
                "has_refresh_token": bool(data.get("refresh_token"))
            }
            for uid, data in user_authorizations.items()
        ]
    }

@router.get("/test-api/{user_id}")
async def test_user_api(user_id: str):
    """Testa API com token de usuário autorizado (usando banco)"""
    
    # Converter user_id para int
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="User ID deve ser numérico")
    
    # Obter token do banco
    token_record = MLUserTokenService.get_user_token(user_id_int)
    
    if not token_record:
        # Fallback para memória (compatibilidade)
        if user_id not in user_authorizations and user_id_int not in user_authorizations:
            raise HTTPException(status_code=404, detail="Usuário não autorizado")
        
        # Usar token da memória
        token_data = user_authorizations.get(user_id, user_authorizations.get(user_id_int))
        access_token = token_data["access_token"]
    else:
        # Usar token do banco
        access_token = token_record.access_token
        # Marcar como usado
        MLUserTokenService.mark_token_used(user_id_int)
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # Testar APIs
    test_results = {}
    
    apis_to_test = [
        ("user_info", "https://api.mercadolibre.com/users/me"),
        ("categories", "https://api.mercadolibre.com/sites/MLB/categories"),
        ("search", "https://api.mercadolibre.com/sites/MLB/search?q=teste&limit=5")
    ]
    
    async with httpx.AsyncClient() as client:
        for api_name, url in apis_to_test:
            try:
                response = await client.get(url, headers=headers)
                test_results[api_name] = {
                    "status": response.status_code,
                    "success": response.status_code == 200,
                    "data_preview": str(response.text)[:200] + "..." if len(response.text) > 200 else response.text
                }
            except Exception as e:
                test_results[api_name] = {
                    "status": "error",
                    "success": False,
                    "error": str(e)
                }
    
    return {
        "user_id": user_id,
        "token_valid": True,
        "test_results": test_results,
        "tested_at": datetime.now().isoformat()
    }
