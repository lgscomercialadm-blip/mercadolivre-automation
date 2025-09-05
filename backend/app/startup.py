import os
from sqlmodel import Session, select
from app.models import User
from app.models.ml_token import MLToken
from app.database import engine, Base
from app.auth import get_password_hash

def create_admin_user():
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_password:
        raise ValueError("ADMIN_PASSWORD não definido no .env")

    # Criar todas as tabelas
    Base.metadata.create_all(bind=engine)
    print("[Startup] Tabelas criadas/verificadas no banco de dados")

    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == admin_email)).first()
        if existing:
            print(f"[Seed] Usuário admin já existe: {admin_email}")
            return

        hashed_password = get_password_hash(admin_password)
        user = User(email=admin_email, password=hashed_password)
        session.add(user)
        session.commit()
        print(f"[Seed] Usuário admin criado: {admin_email}")