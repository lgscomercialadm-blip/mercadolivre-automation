from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class OAuthSession(SQLModel, table=True):
    __tablename__ = "oauthsession"
    
    state: str = Field(primary_key=True, index=True)
    code_verifier: str
    endpoint_id: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
