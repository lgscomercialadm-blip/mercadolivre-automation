#!/usr/bin/env python3
"""
Endpoints para testar API do Mercado Livre com token de acesso
"""
from fastapi import APIRouter, HTTPException, Header
import httpx
from typing import Optional
from ..config.settings import settings

router = APIRouter()

@router.get("/user/me")
async def get_user_info(authorization: str = Header(...)):
    """Obtém informações do usuário autenticado"""
    try:
        # Extrair token do header Authorization: Bearer TOKEN
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=400, detail="Token deve estar no formato 'Bearer TOKEN'")
        
        token = authorization.replace("Bearer ", "")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.mercadolibre.com/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro da API ML: {response.text}"
                )
            
            user_data = response.json()
            
            return {
                "success": True,
                "message": "Usuário obtido com sucesso!",
                "user": {
                    "id": user_data.get("id"),
                    "nickname": user_data.get("nickname"),
                    "email": user_data.get("email"),
                    "first_name": user_data.get("first_name"),
                    "last_name": user_data.get("last_name"),
                    "country_id": user_data.get("country_id"),
                    "address": user_data.get("address", {}).get("city"),
                    "phone": user_data.get("phone", {}).get("number"),
                    "registration_date": user_data.get("registration_date"),
                    "seller_reputation": user_data.get("seller_reputation", {}).get("level_id"),
                    "buyer_reputation": user_data.get("buyer_reputation", {}).get("tags")
                }
            }
            
    except Exception as e:
        print(f"❌ Erro ao obter usuário: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/items/search")
async def search_my_items(authorization: str = Header(...), limit: int = 10):
    """Lista produtos/anúncios do usuário"""
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=400, detail="Token deve estar no formato 'Bearer TOKEN'")
        
        token = authorization.replace("Bearer ", "")
        
        # Primeiro, obter o user_id
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                "https://api.mercadolibre.com/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=user_response.status_code, detail="Erro ao obter user_id")
            
            user_id = user_response.json()["id"]
            
            # Buscar itens do usuário
            items_response = await client.get(
                f"https://api.mercadolibre.com/users/{user_id}/items/search",
                params={"limit": limit},
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if items_response.status_code != 200:
                raise HTTPException(
                    status_code=items_response.status_code,
                    detail=f"Erro ao buscar itens: {items_response.text}"
                )
            
            items_data = items_response.json()
            
            return {
                "success": True,
                "message": f"Encontrados {len(items_data.get('results', []))} itens",
                "user_id": user_id,
                "total": items_data.get("paging", {}).get("total", 0),
                "items": items_data.get("results", [])
            }
            
    except Exception as e:
        print(f"❌ Erro ao buscar itens: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Lista categorias do Mercado Livre (não precisa de token)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.mercadolibre.com/sites/MLB/categories")
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro ao obter categorias: {response.text}"
                )
            
            categories = response.json()
            
            return {
                "success": True,
                "message": f"Encontradas {len(categories)} categorias",
                "categories": categories[:20]  # Primeiras 20 para não sobrecarregar
            }
            
    except Exception as e:
        print(f"❌ Erro ao obter categorias: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/test-api")
async def test_api_calls(authorization: str = Header(...)):
    """Teste completo das principais APIs"""
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=400, detail="Token deve estar no formato 'Bearer TOKEN'")
        
        token = authorization.replace("Bearer ", "")
        results = {}
        
        async with httpx.AsyncClient() as client:
            # Teste 1: Informações do usuário
            try:
                user_response = await client.get(
                    "https://api.mercadolibre.com/users/me",
                    headers={"Authorization": f"Bearer {token}"}
                )
                results["user_info"] = {
                    "status": user_response.status_code,
                    "success": user_response.status_code == 200,
                    "data": user_response.json() if user_response.status_code == 200 else user_response.text
                }
            except Exception as e:
                results["user_info"] = {"status": "error", "success": False, "error": str(e)}
            
            # Teste 2: Notificações
            try:
                notifications_response = await client.get(
                    "https://api.mercadolibre.com/myfeeds",
                    headers={"Authorization": f"Bearer {token}"}
                )
                results["notifications"] = {
                    "status": notifications_response.status_code,
                    "success": notifications_response.status_code == 200,
                    "data": "Notifications API accessible" if notifications_response.status_code == 200 else notifications_response.text
                }
            except Exception as e:
                results["notifications"] = {"status": "error", "success": False, "error": str(e)}
            
            # Teste 3: Currencies (público)
            try:
                currencies_response = await client.get("https://api.mercadolibre.com/currencies")
                results["currencies"] = {
                    "status": currencies_response.status_code,
                    "success": currencies_response.status_code == 200,
                    "data": f"{len(currencies_response.json())} currencies available" if currencies_response.status_code == 200 else currencies_response.text
                }
            except Exception as e:
                results["currencies"] = {"status": "error", "success": False, "error": str(e)}
        
        return {
            "success": True,
            "message": "Testes de API concluídos",
            "results": results
        }
            
    except Exception as e:
        print(f"❌ Erro nos testes de API: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
