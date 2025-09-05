"""
Router de autenticação temporário sem banco de dados.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", status_code=201)
def register(payload: UserCreate):
    """
    Registra um novo usuário (temporário sem banco).
    """
    try:
        # TODO: Implementar persistência em banco
        return {
            "email": payload.email, 
            "message": "Usuário registrado temporariamente - sem persistência"
        }
    except Exception as e:
        logger.error(f"Erro no registro: {e}")
        raise HTTPException(status_code=400, detail="Erro no registro")

@router.post("/token", response_model=TokenResponse)
def login_for_access_token(email: str, password: str):
    """
    Autentica usuário (temporário sem validação real).
    """
    try:
        # TODO: Implementar validação real com banco
        if email and password:
            return {
                "access_token": "fake_token_for_testing",
                "token_type": "bearer"
            }
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        raise HTTPException(status_code=401, detail="Erro de autenticação")

@router.get("/me")
def get_current_user_info():
    """
    Retorna informações do usuário atual (temporário).
    """
    return {
        "email": "user@example.com",
        "id": 1,
        "message": "Dados temporários - implementar autenticação real"
    }
