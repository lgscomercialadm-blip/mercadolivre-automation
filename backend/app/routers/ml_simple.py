#!/usr/bin/env python3
"""
Router simplificado para APIs do Mercado Livre (usando requests)
"""
from fastapi import APIRouter, HTTPException, Query
import requests
from typing import Optional, Dict, Any

router = APIRouter(prefix="/api/ml-simple", tags=["ML APIs Simple"])

def make_ml_request_sync(endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Faz requisição síncrona para API do Mercado Livre
    """
    url = f"https://api.mercadolibre.com{endpoint}"
    
    headers = {
        "User-Agent": "ML-Integration-Tool/2.0",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        return {
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "data": response.json() if response.status_code == 200 else response.text,
            "url": response.url
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Erro ao comunicar com API do ML"
        }

@router.get("/categories")
def get_categories_simple():
    """
    Lista categorias do Mercado Livre Brasil (versão simplificada)
    """
    try:
        result = make_ml_request_sync("/sites/MLB/categories")
        
        if result["success"]:
            categories = result["data"][:10]  # Primeiras 10 categorias
            
            formatted = []
            for cat in categories:
                formatted.append({
                    "id": cat["id"],
                    "name": cat["name"]
                })
            
            return {
                "success": True,
                "categories": formatted,
                "total_showing": len(formatted),
                "message": "Categorias carregadas com sucesso!"
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Erro desconhecido"),
                "status_code": result.get("status_code", 500)
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/search")
def search_products_simple(q: str = Query(..., description="Termo de busca")):
    """
    Busca produtos no Mercado Livre (versão simplificada)
    """
    try:
        params = {"q": q, "limit": 5}  # Limite baixo para teste
        result = make_ml_request_sync("/sites/MLB/search", params=params)
        
        if result["success"]:
            data = result["data"]
            products = []
            
            for item in data.get("results", []):
                products.append({
                    "id": item["id"],
                    "title": item["title"],
                    "price": item["price"],
                    "thumbnail": item["thumbnail"],
                    "condition": item["condition"]
                })
            
            return {
                "success": True,
                "query": q,
                "products": products,
                "total_found": data.get("paging", {}).get("total", 0)
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Erro na busca")
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/test")
def test_ml_connection():
    """
    Testa conectividade básica com ML usando endpoint público
    """
    try:
        # Tenta primeiro com um endpoint que não requer autenticação
        result = make_ml_request_sync("/currencies")
        
        if result["success"]:
            sites_data = result["data"]
            return {
                "success": True,
                "message": "Conexão com ML funcionando!",
                "total_sites": len(sites_data) if isinstance(sites_data, list) else 1,
                "test_endpoint": "/sites",
                "status": "API Mercado Livre acessível"
            }
        else:
            # Se falhou, verifica se pelo menos conseguiu conectar (não é erro de rede)
            if result.get("status_code") in [401, 403, 404]:
                return {
                    "success": True,
                    "message": "Conexão com ML funcionando (endpoint requer auth)!",
                    "status_code": result.get("status_code"),
                    "note": "API acessível, mas endpoint requer autenticação"
                }
            else:
                return {
                    "success": False,
                    "message": "Erro na conexão com ML",
                    "error": result.get("error", "Erro desconhecido"),
                    "status_code": result.get("status_code")
                }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
