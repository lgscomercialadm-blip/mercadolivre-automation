#!/usr/bin/env python3
"""
API simplificada para integração com frontend
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..db import get_db
from ..services.ml_token_service import MLTokenService
import httpx

router = APIRouter()

@router.get("/auth/status")
async def get_auth_status(db: Session = Depends(get_db)):
    """Verifica status de autenticação de todos os usuários"""
    try:
        token_service = MLTokenService(db)
        active_tokens = token_service.get_all_active_tokens()
        
        users_status = []
        for token in active_tokens:
            users_status.append({
                "user_id": token.user_id,
                "nickname": token.user_nickname,
                "email": token.user_email,
                "country": token.user_country,
                "is_expired": token.is_expired,
                "expires_at": token.expires_at.isoformat(),
                "time_left_minutes": token.time_left_minutes,
                "last_refresh": token.last_refresh.isoformat() if token.last_refresh else None
            })
        
        return {
            "success": True,
            "total_users": len(users_status),
            "users": users_status,
            "oauth_url": "/api/oauth-simple/login"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """Obtém perfil completo do usuário ML"""
    try:
        token_service = MLTokenService(db)
        valid_token = await token_service.get_valid_token(user_id)
        
        if not valid_token:
            raise HTTPException(status_code=404, detail="Token não encontrado ou expirado")
        
        async with httpx.AsyncClient() as client:
            # Buscar dados do usuário
            user_response = await client.get(
                "https://api.mercadolibre.com/users/me",
                headers={"Authorization": f"Bearer {valid_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=user_response.status_code, detail="Erro ao buscar usuário")
            
            user_data = user_response.json()
            
            # Buscar itens do usuário
            items_response = await client.get(
                f"https://api.mercadolibre.com/users/{user_id}/items/search",
                params={"limit": 5},
                headers={"Authorization": f"Bearer {valid_token}"}
            )
            
            items_data = items_response.json() if items_response.status_code == 200 else {"results": []}
            
            return {
                "success": True,
                "user": {
                    "id": user_data.get("id"),
                    "nickname": user_data.get("nickname"),
                    "email": user_data.get("email"),
                    "first_name": user_data.get("first_name"),
                    "last_name": user_data.get("last_name"),
                    "country_id": user_data.get("country_id"),
                    "registration_date": user_data.get("registration_date"),
                    "seller_reputation": user_data.get("seller_reputation", {}).get("level_id"),
                    "points": user_data.get("points"),
                    "address": user_data.get("address", {}),
                    "phone": user_data.get("phone", {})
                },
                "items": {
                    "total": items_data.get("paging", {}).get("total", 0),
                    "recent": items_data.get("results", [])[:5]
                }
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.post("/user/{user_id}/refresh")
async def refresh_user_token(user_id: str, db: Session = Depends(get_db)):
    """Força refresh do token do usuário"""
    try:
        token_service = MLTokenService(db)
        refreshed_token = await token_service.refresh_token(user_id)
        
        if not refreshed_token:
            raise HTTPException(status_code=400, detail="Não foi possível renovar o token")
        
        return {
            "success": True,
            "message": "Token renovado com sucesso",
            "expires_at": refreshed_token.expires_at.isoformat(),
            "time_left_minutes": refreshed_token.time_left_minutes
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.delete("/user/{user_id}/logout")
async def logout_user(user_id: str, db: Session = Depends(get_db)):
    """Remove autenticação do usuário"""
    try:
        token_service = MLTokenService(db)
        success = token_service.deactivate_token(user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return {
            "success": True,
            "message": f"Usuário {user_id} desconectado com sucesso"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/dashboard/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """Resumo para dashboard do frontend"""
    try:
        token_service = MLTokenService(db)
        active_tokens = token_service.get_all_active_tokens()
        
        total_users = len(active_tokens)
        expired_tokens = sum(1 for token in active_tokens if token.is_expired)
        valid_tokens = total_users - expired_tokens
        
        # Estatísticas por país
        countries = {}
        for token in active_tokens:
            country = token.user_country or "Unknown"
            countries[country] = countries.get(country, 0) + 1
        
        return {
            "success": True,
            "summary": {
                "total_users": total_users,
                "valid_tokens": valid_tokens,
                "expired_tokens": expired_tokens,
                "countries": countries,
                "oauth_ready": True,
                "last_update": active_tokens[0].updated_at.isoformat() if active_tokens else None
            },
            "actions": {
                "new_auth": "/api/oauth-simple/login",
                "refresh_all": "/api/frontend/tokens/refresh-all",
                "user_management": "/api/frontend/auth/status"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.post("/tokens/refresh-all")
async def refresh_all_tokens(db: Session = Depends(get_db)):
    """Renova todos os tokens expirados"""
    try:
        token_service = MLTokenService(db)
        active_tokens = token_service.get_all_active_tokens()
        
        results = []
        for token in active_tokens:
            if token.is_expired:
                refreshed = await token_service.refresh_token(token.user_id)
                results.append({
                    "user_id": token.user_id,
                    "success": refreshed is not None,
                    "message": "Renovado" if refreshed else "Falha na renovação"
                })
        
        success_count = sum(1 for r in results if r["success"])
        
        return {
            "success": True,
            "message": f"Processados {len(results)} tokens",
            "renewed": success_count,
            "failed": len(results) - success_count,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")
