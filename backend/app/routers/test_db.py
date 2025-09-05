#!/usr/bin/env python3
"""
Endpoint de teste para verificar conectividade do banco
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.oauth_session import OAuthSession

router = APIRouter(prefix="/api/test", tags=["Test"])

@router.get("/db")
async def test_database(session: Session = Depends(get_session)):
    """Testa conectividade do banco de dados"""
    try:
        # Tenta fazer uma consulta simples
        result = session.exec(select(OAuthSession)).all()
        
        return {
            "success": True,
            "message": "Banco funcionando!",
            "oauth_sessions_count": len(result),
            "sample_data": [{"state": s.state, "created_at": str(s.created_at)} for s in result[:3]]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Erro no banco de dados"
        }
