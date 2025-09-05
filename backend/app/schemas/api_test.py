from pydantic import BaseModel
from typing import Optional

class ApiTestBase(BaseModel):
    name: str

class ApiTestCreate(ApiTestBase):
    pass

class ApiTestRead(ApiTestBase):
    id: int

    class Config:
        from_attributes = True
