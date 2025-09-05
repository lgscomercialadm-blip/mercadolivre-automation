"""
Router OAuth temporário sem banco de dados.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/oauth", tags=["oauth"])

@router.get("/login")
def login(state: Optional[str] = None):
    """
    Inicia processo OAuth (temporário sem persistência).
    """
    try:
        # TODO: Implementar OAuth real com Mercado Livre
        mock_auth_url = "https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI"
        
        return {
            "authorization_url": mock_auth_url,
            "state": state or "temp_state",
            "message": "OAuth temporário - configurar credenciais reais"
        }
    except Exception as e:
        logger.error(f"Erro no OAuth login: {e}")
        raise HTTPException(status_code=400, detail="Erro no OAuth")

@router.get("/callback")
def callback(code: Optional[str] = None, state: Optional[str] = None):
    """
    Callback OAuth (temporário sem processamento real).
    """
    try:
        if not code or not state:
            raise HTTPException(status_code=400, detail="Código ou estado ausente")
        
        # TODO: Implementar troca de código por token
        return {
            "status": "ok",
            "access_token": "fake_ml_token",
            "message": "Token temporário - implementar troca real de código"
        }
    except Exception as e:
        logger.error(f"Erro no OAuth callback: {e}")
        raise HTTPException(status_code=400, detail="Erro no callback OAuth")

@router.get("/status")
def oauth_status():
    """
    Status da autenticação OAuth.
    """
    return {
        "authenticated": False,
        "provider": "mercadolibre",
        "message": "OAuth não configurado - usar versão temporária"
    }
