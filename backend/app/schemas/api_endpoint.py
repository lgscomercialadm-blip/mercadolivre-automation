from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApiEndpointBase(BaseModel):
    name: str
    url: str
    default_headers: Optional[str] = None
    auth_type: Optional[str] = "none"
    oauth_scope: Optional[str] = None

class ApiEndpointCreate(ApiEndpointBase):
    pass

class ApiEndpointRead(ApiEndpointBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
