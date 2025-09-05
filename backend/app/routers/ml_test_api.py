#!/usr/bin/env python3
"""
Endpoint para testar chamadas API do Mercado Livre com token
Implementação simples e segura
"""
from fastapi import APIRouter, HTTPException
import httpx
from typing import Dict, Any

router = APIRouter(prefix="/api/ml-test", tags=["ML API Test"])

# Token que obtivemos anteriormente (temporário para teste)
# Em produção, isso viria do banco de dados
TEMP_ACCESS_TOKEN = None

@router.post("/set-token")
async def set_token(token_data: Dict[str, Any]):
    """Define o token para teste (temporário)"""
    global TEMP_ACCESS_TOKEN
    TEMP_ACCESS_TOKEN = token_data.get("access_token")
    return {
        "success": True,
        "message": "Token definido para testes",
        "token_preview": TEMP_ACCESS_TOKEN[:10] + "..." if TEMP_ACCESS_TOKEN else None
    }

@router.get("/user/me")
async def get_user_info():
    """Testa endpoint /users/me da API do ML"""
    if not TEMP_ACCESS_TOKEN:
        raise HTTPException(status_code=400, detail="Token não definido. Use /set-token primeiro")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.mercadolibre.com/users/me",
                headers={"Authorization": f"Bearer {TEMP_ACCESS_TOKEN}"}
            )
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    "success": True,
                    "user_id": user_data.get("id"),
                    "nickname": user_data.get("nickname"),
                    "email": user_data.get("email"),
                    "country_id": user_data.get("country_id"),
                    "site_id": user_data.get("site_id"),
                    "user_type": user_data.get("user_type"),
                    "full_data": user_data
                }
            else:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na chamada API: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Testa endpoint público de categorias (não precisa token)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.mercadolibre.com/sites/MLB/categories")
            
            if response.status_code == 200:
                categories = response.json()
                return {
                    "success": True,
                    "total_categories": len(categories),
                    "sample_categories": categories[:5],  # Primeiras 5 categorias
                    "all_categories": categories
                }
            else:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na chamada API: {str(e)}")

@router.get("/search")
async def search_items(q: str = "notebook", limit: int = 5):
    """Testa busca de itens (endpoint público)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.mercadolibre.com/sites/MLB/search?q={q}&limit={limit}"
            )
            
            if response.status_code == 200:
                search_data = response.json()
                return {
                    "success": True,
                    "query": q,
                    "total_results": search_data.get("paging", {}).get("total", 0),
                    "items_returned": len(search_data.get("results", [])),
                    "items": [
                        {
                            "id": item.get("id"),
                            "title": item.get("title"),
                            "price": item.get("price"),
                            "currency": item.get("currency_id"),
                            "permalink": item.get("permalink")
                        }
                        for item in search_data.get("results", [])
                    ],
                    "full_response": search_data
                }
            else:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na chamada API: {str(e)}")

@router.get("/my-items")
async def get_my_items():
    """Testa endpoint dos meus itens (precisa token)"""
    if not TEMP_ACCESS_TOKEN:
        raise HTTPException(status_code=400, detail="Token não definido. Use /set-token primeiro")
    
    try:
        async with httpx.AsyncClient() as client:
            # Primeiro pega o user_id
            user_response = await client.get(
                "https://api.mercadolibre.com/users/me",
                headers={"Authorization": f"Bearer {TEMP_ACCESS_TOKEN}"}
            )
            
            if user_response.status_code != 200:
                return {"success": False, "error": "Não foi possível obter dados do usuário"}
            
            user_data = user_response.json()
            user_id = user_data.get("id")
            
            # Busca os itens do usuário
            items_response = await client.get(
                f"https://api.mercadolibre.com/users/{user_id}/items/search",
                headers={"Authorization": f"Bearer {TEMP_ACCESS_TOKEN}"}
            )
            
            if items_response.status_code == 200:
                items_data = items_response.json()
                return {
                    "success": True,
                    "user_id": user_id,
                    "total_items": items_data.get("paging", {}).get("total", 0),
                    "items": items_data.get("results", []),
                    "full_response": items_data
                }
            else:
                return {
                    "success": False,
                    "status_code": items_response.status_code,
                    "error": items_response.text
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na chamada API: {str(e)}")

@router.get("/status")
async def api_status():
    """Status do módulo de teste de API"""
    return {
        "success": True,
        "module": "ML API Test",
        "token_set": TEMP_ACCESS_TOKEN is not None,
        "token_preview": TEMP_ACCESS_TOKEN[:10] + "..." if TEMP_ACCESS_TOKEN else "Não definido",
        "available_endpoints": [
            "/set-token - Define token para testes",
            "/user/me - Dados do usuário autenticado",
            "/categories - Lista categorias (público)",
            "/search - Busca produtos (público)",
            "/my-items - Meus itens (autenticado)",
            "/status - Este endpoint"
        ]
    }
