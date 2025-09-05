from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AdUpdateRequest(BaseModel):
    price: Optional[float] = None
    available_quantity: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    pictures: Optional[List[str]] = None
    attributes: Optional[List[Dict[str, Any]]] = None

class AdActionRequest(BaseModel):
    action: str  # pause, activate, update_price, update_stock
    value: Optional[str] = None

class FilterRequest(BaseModel):
    category_id: Optional[str] = None
    listing_type_id: Optional[str] = None
    status: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_stock: Optional[int] = None
    max_stock: Optional[int] = None
    shipping_mode: Optional[str] = None
    search: Optional[str] = None

class ProcessAdsRequest(BaseModel):
    item_ids: Optional[List[str]] = None
    limit: Optional[int] = None
    analyze_title: bool = False
    optimize_price: bool = False
    suggest_keywords: bool = False
    competition_analysis: bool = False
