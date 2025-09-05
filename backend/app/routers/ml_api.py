#!/usr/bin/env python3
"""
Router para integração com APIs do Mercado Livre
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
import aiohttp
import asyncio
from typing import Optional, List, Dict, Any
from app.config import settings

router = APIRouter(prefix="/api/ml", tags=["Mercado Livre APIs"])

# URLs base das APIs do ML
ML_API_BASE = "https://api.mercadolibre.com"
ML_API_BASE_BR = "https://api.mercadolibre.com/sites/MLB"

async def make_ml_request(
    endpoint: str, 
    method: str = "GET", 
    params: Optional[Dict] = None,
    headers: Optional[Dict] = None,
    access_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Faz requisição para API do Mercado Livre
    """
    url = f"{ML_API_BASE}{endpoint}"
    
    # Headers padrão
    default_headers = {
        "User-Agent": "ML-Integration-Tool/2.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    if headers:
        default_headers.update(headers)
    
    # Adiciona token de acesso se fornecido
    if access_token:
        default_headers["Authorization"] = f"Bearer {access_token}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method=method.upper(),
                url=url,
                params=params,
                headers=default_headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                data = await response.json()
                
                return {
                    "success": response.status == 200,
                    "status_code": response.status,
                    "data": data,
                    "url": str(response.url)
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Erro ao comunicar com API do ML"
        }

@router.get("/categories")
async def get_categories():
    """
    Lista todas as categorias do Mercado Livre Brasil
    """
    try:
        result = await make_ml_request("/sites/MLB/categories")
        
        if result["success"]:
            categories = result["data"]
            
            # Formata resposta
            formatted_categories = []
            for cat in categories[:20]:  # Primeiras 20 para não sobrecarregar
                formatted_categories.append({
                    "id": cat["id"],
                    "name": cat["name"],
                    "total_items_in_this_category": cat.get("total_items_in_this_category", 0)
                })
            
            return {
                "success": True,
                "total_categories": len(categories),
                "categories": formatted_categories,
                "message": f"Encontradas {len(categories)} categorias"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro na API do ML"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/search")
async def search_products(
    q: str = Query(..., description="Termo de busca"),
    category: Optional[str] = Query(None, description="ID da categoria"),
    limit: int = Query(10, description="Limite de resultados", le=50),
    offset: int = Query(0, description="Offset para paginação")
):
    """
    Busca produtos no Mercado Livre
    """
    try:
        params = {
            "q": q,
            "limit": limit,
            "offset": offset
        }
        
        if category:
            params["category"] = category
        
        result = await make_ml_request("/sites/MLB/search", params=params)
        
        if result["success"]:
            data = result["data"]
            
            # Formata produtos
            products = []
            for item in data.get("results", []):
                products.append({
                    "id": item["id"],
                    "title": item["title"],
                    "price": item["price"],
                    "currency_id": item["currency_id"],
                    "condition": item["condition"],
                    "thumbnail": item["thumbnail"],
                    "permalink": item["permalink"],
                    "seller": {
                        "id": item["seller"]["id"],
                        "nickname": item["seller"].get("nickname", "N/A")
                    }
                })
            
            return {
                "success": True,
                "query": q,
                "total_results": data.get("paging", {}).get("total", 0),
                "showing": len(products),
                "products": products
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro na busca"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/product/{item_id}")
async def get_product_details(item_id: str):
    """
    Obtém detalhes completos de um produto
    """
    try:
        result = await make_ml_request(f"/items/{item_id}")
        
        if result["success"]:
            item = result["data"]
            
            # Busca também descrição do produto
            desc_result = await make_ml_request(f"/items/{item_id}/description")
            description = ""
            if desc_result["success"]:
                description = desc_result["data"].get("plain_text", "")
            
            return {
                "success": True,
                "product": {
                    "id": item["id"],
                    "title": item["title"],
                    "price": item["price"],
                    "currency_id": item["currency_id"],
                    "condition": item["condition"],
                    "category_id": item["category_id"],
                    "description": description,
                    "pictures": [pic["url"] for pic in item.get("pictures", [])],
                    "attributes": item.get("attributes", []),
                    "seller_id": item["seller_id"],
                    "permalink": item["permalink"],
                    "available_quantity": item.get("available_quantity", 0),
                    "sold_quantity": item.get("sold_quantity", 0)
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/trending")
async def get_trending_products(
    category: Optional[str] = Query(None, description="ID da categoria")
):
    """
    Obtém produtos em alta/tendência
    """
    try:
        # Busca produtos mais vendidos
        params = {
            "sort": "sold_quantity_desc",
            "limit": 20
        }
        
        if category:
            params["category"] = category
        
        result = await make_ml_request("/sites/MLB/search", params=params)
        
        if result["success"]:
            data = result["data"]
            
            trending = []
            for item in data.get("results", []):
                trending.append({
                    "id": item["id"],
                    "title": item["title"],
                    "price": item["price"],
                    "sold_quantity": item.get("sold_quantity", 0),
                    "thumbnail": item["thumbnail"],
                    "condition": item["condition"]
                })
            
            return {
                "success": True,
                "trending_products": trending,
                "total_found": len(trending)
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao buscar tendências"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/currency")
async def get_currency_info():
    """
    Informações sobre moedas do ML
    """
    try:
        result = await make_ml_request("/currencies")
        
        if result["success"]:
            currencies = result["data"]
            
            # Filtra apenas moedas relevantes para o Brasil
            br_currencies = [curr for curr in currencies if curr["id"] in ["BRL", "USD"]]
            
            return {
                "success": True,
                "currencies": br_currencies
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao buscar moedas"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/status")
async def ml_api_status():
    """
    Verifica status das APIs do Mercado Livre
    """
    try:
        # Testa conectividade básica
        result = await make_ml_request("/sites/MLB")
        
        return {
            "ml_api_online": result["success"],
            "response_time_ms": "< 1000",  # Aproximado
            "endpoints_available": [
                "/api/ml/categories",
                "/api/ml/search",
                "/api/ml/product/{id}",
                "/api/ml/trending",
                "/api/ml/currency"
            ],
            "authentication_required": [
                "Para listar produtos do usuário",
                "Para criar/editar anúncios",
                "Para acessar vendas e métricas"
            ]
        }
        
    except Exception as e:
        return {
            "ml_api_online": False,
            "error": str(e)
        }
