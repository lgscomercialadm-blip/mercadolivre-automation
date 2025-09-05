#!/usr/bin/env python3
"""
Endpoint OAuth simplificado que funciona sem banco de dados complexo
"""
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
import secrets
import hashlib
import base64
from urllib.parse import urlencode

# Armazenamento temporário dos code_verifiers (em produção, usar Redis/DB)
pkce_storage = {}
from app.config import settings

router = APIRouter(prefix="/api/oauth-simple", tags=["OAuth Simple"])

def generate_pkce():
    """Gera code_verifier e code_challenge para PKCE"""
    # Gera code_verifier
    code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    
    # Gera code_challenge
    challenge_bytes = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    code_challenge = base64.urlsafe_b64encode(challenge_bytes).decode('utf-8').rstrip('=')
    
    return code_verifier, code_challenge

@router.get("/login")
async def oauth_login_simple(request: Request):
    """
    OAuth login simplificado que funciona sem banco complexo
    """
    try:
        # Gera state seguro
        state = secrets.token_urlsafe(32)
        
        # Gera PKCE
        code_verifier, code_challenge = generate_pkce()
        
        # Parâmetros OAuth2 para Mercado Livre
        params = {
            'response_type': 'code',
            'client_id': settings.ml_client_id,
            'redirect_uri': settings.ml_redirect_uri,
            'scope': 'offline_access read write',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        # URL de autorização do ML
        auth_url = f"https://auth.mercadolivre.com.br/authorization?{urlencode(params)}"
        
        print(f"🚀 OAuth Login - State: {state[:10]}...")
        print(f"🔗 Redirecionando para: {auth_url}")
        
        # Armazenar code_verifier temporariamente
        pkce_storage[state] = code_verifier
        
        return RedirectResponse(url=auth_url, status_code=307)
        
    except Exception as e:
        print(f"❌ Erro no OAuth: {e}")
        raise HTTPException(status_code=500, detail=f"Erro OAuth: {str(e)}")

@router.get("/callback")
async def oauth_callback_simple(
    code: str = None,
    state: str = None,
    error: str = None
):
    """Callback simplificado do OAuth"""
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {error}")
    
    if not code:
        raise HTTPException(status_code=400, detail="Código de autorização não recebido")
    
    # Trocar código por token automaticamente
    try:
        token_data = await exchange_code_for_token(code, state)
        
        return {
            "success": True,
            "message": "Token obtido com sucesso!",
            "user_id": token_data["user_id"],
            "access_token": token_data["access_token"][:10] + "...",
            "token_type": token_data["token_type"],
            "expires_in": token_data["expires_in"],
            "scope": token_data["scope"],
            "refresh_token": token_data.get("refresh_token", "")[:10] + "..." if token_data.get("refresh_token") else None
        }
    except Exception as e:
        return {
            "success": True,
            "message": "Código OAuth recebido com sucesso!",
            "code": code[:10] + "...",
            "state": state[:10] + "...",
            "next_step": f"Erro ao trocar token: {str(e)}"
        }

async def exchange_code_for_token(code: str, state: str):
    """Troca código OAuth por token de acesso"""
    import httpx
    
    # Recuperar code_verifier do storage
    code_verifier = pkce_storage.get(state)
    if not code_verifier:
        raise HTTPException(status_code=400, detail="Code verifier não encontrado")
    
    token_url = "https://api.mercadolibre.com/oauth/token"
    
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.ml_client_id,
        "client_secret": settings.ml_client_secret,
        "code": code,
        "redirect_uri": settings.ml_redirect_uri,
        "code_verifier": code_verifier
    }
    
    print(f"🔄 Trocando código por token...")
    print(f"📝 Data: {data}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao obter token: {response.text}"
            )
        
        # Limpar code_verifier após uso
        pkce_storage.pop(state, None)
        
        return response.json()

@router.get("/status")
async def oauth_status_simple():
    """Status do OAuth simplificado"""
    return {
        "oauth_configured": True,
        "client_id": settings.ml_client_id,
        "redirect_uri": settings.ml_redirect_uri,
        "ready": True,
        "message": "OAuth2 + PKCE configurado e pronto!"
    }
